/**
 * useAgentStream — connects to a Pydantic AI AG-UI backend endpoint.
 *
 * AG-UI works like this:
 *   1. You POST a list of messages (+ optional state) to the agent endpoint.
 *   2. The backend streams back Server-Sent Events (SSE).
 *   3. Each event has a `type` field that tells you what happened:
 *      - TEXT_MESSAGE_CONTENT → append delta text to the assistant message
 *      - TOOL_CALL_START/END  → the agent is calling a tool
 *      - TOOL_CALL_RESULT     → the tool returned a result
 *      - STATE_SNAPSHOT       → shared state was updated (productivity agent)
 *      - RUN_FINISHED         → stream is done
 *      - RUN_ERROR            → something went wrong
 */
"use client";

import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ToolCall {
  id: string;
  name: string;
  args: string;
  result?: string;
}

interface UseAgentStreamOptions {
  /** Path to the agent, e.g. "/api/agents/pydantic" */
  agentPath: string;
  /** Called whenever the agent emits a STATE_SNAPSHOT event */
  onStateSnapshot?: (snapshot: unknown) => void;
}

export function useAgentStream({ agentPath, onStateSnapshot }: UseAgentStreamOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const threadId = useRef(crypto.randomUUID());

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isStreaming) return;

      setError(null);
      setToolCalls([]);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userText.trim(),
      };

      // Optimistically add user message + empty assistant placeholder
      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        userMsg,
        { id: assistantId, role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      // Build the full history to send (all previous + new user message)
      const history = [...messages, userMsg];

      try {
        const res = await fetch(agentPath, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thread_id: threadId.current,
            run_id: crypto.randomUUID(),
            messages: history.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })),
            // Required fields in the AG-UI RunAgentInput schema
            state: null,
            tools: [],
            context: [],
            forwardedProps: {},
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buf += decoder.decode(value, { stream: true });

          // SSE format: lines starting with "data: ", separated by "\n\n"
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw || raw === "[DONE]") continue;

            let event: Record<string, unknown>;
            try {
              event = JSON.parse(raw);
            } catch {
              continue;
            }

            const type = event.type as string;

            if (type === "TEXT_MESSAGE_CONTENT") {
              // Append streamed text to the assistant message
              const delta = (event.delta as string) ?? "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + delta }
                    : m
                )
              );
            } else if (type === "TOOL_CALL_START") {
              setToolCalls((prev) => [
                ...prev,
                {
                  id: event.tool_call_id as string,
                  name: event.tool_call_name as string,
                  args: "",
                },
              ]);
            } else if (type === "TOOL_CALL_ARGS") {
              const delta = (event.delta as string) ?? "";
              setToolCalls((prev) =>
                prev.map((t) =>
                  t.id === event.tool_call_id
                    ? { ...t, args: t.args + delta }
                    : t
                )
              );
            } else if (type === "TOOL_CALL_RESULT") {
              setToolCalls((prev) =>
                prev.map((t) =>
                  t.id === event.tool_call_id
                    ? { ...t, result: event.content as string }
                    : t
                )
              );
            } else if (type === "STATE_SNAPSHOT") {
              onStateSnapshot?.(event.snapshot);
            } else if (type === "RUN_ERROR") {
              setError((event.message as string) ?? "Agent error");
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        // Remove the empty assistant placeholder on error
        setMessages((prev) => prev.filter((m) => m.id !== assistantId));
      } finally {
        setIsStreaming(false);
      }
    },
    [agentPath, isStreaming, messages, onStateSnapshot]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setToolCalls([]);
    setError(null);
    threadId.current = crypto.randomUUID();
  }, []);

  return { messages, toolCalls, isStreaming, error, sendMessage, clearMessages };
}
