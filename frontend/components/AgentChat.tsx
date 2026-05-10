"use client";

import { useRef, useEffect, useState } from "react";
import type { ChatMessage, ToolCall } from "@/hooks/useAgentStream";

interface Props {
  messages: ChatMessage[];
  toolCalls: ToolCall[];
  isStreaming: boolean;
  error: string | null;
  onSend: (text: string) => void;
  placeholder?: string;
  initialMessage?: string;
  suggestedPrompts?: string[];
}

const toolLabels: Record<string, string> = {
  create_task:  "Creating task",
  update_task:  "Updating task",
  delete_task:  "Removing task",
  list_tasks:   "Reading board",
  fetch_url:    "Fetching page",
  current_time: "Checking time",
  web_search:   "Searching web",
};

function friendlyToolName(name: string | undefined): string {
  if (!name) return "Working…";
  return toolLabels[name] ?? name.replace(/_/g, " ");
}

/** Cycles ● → ●● → ●●● every 400ms */
function ThinkingDots() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => (c % 3) + 1), 400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-[#6e6e73] tracking-widest">
      {"●".repeat(count)}
    </span>
  );
}

export default function AgentChat({
  messages,
  toolCalls,
  isStreaming,
  error,
  onSend,
  placeholder = "Type a message...",
  initialMessage,
  suggestedPrompts = [],
}: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolCalls]);

  function handleSend() {
    if (!input.trim() || isStreaming) return;
    onSend(input.trim());
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages — constrained width, centered */}
      <div className="flex-1 overflow-y-auto py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-4">

          {/* Initial greeting */}
          {messages.length === 0 && initialMessage && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-white border border-[#e5e5ea] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#1d1d1f] shadow-sm leading-relaxed">
                {initialMessage}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-500 text-white rounded-tr-sm shadow-sm"
                    : "bg-white border border-[#e5e5ea] text-[#1d1d1f] rounded-tl-sm shadow-sm"
                }`}
              >
                {/* Show cycling dots while waiting for content, actual text once it arrives */}
                {m.content || (isStreaming && m.role === "assistant" ? <ThinkingDots /> : null)}
              </div>
            </div>
          ))}

          {/* Tool call activity — friendly labels only, no raw IDs or args */}
          {toolCalls.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {toolCalls.map((t, i) => (
                <span
                  key={t.id ?? i}
                  className="inline-flex items-center gap-1 text-xs bg-white border border-[#e5e5ea] rounded-full px-2.5 py-1 text-[#6e6e73] shadow-sm"
                >
                  <span className="text-purple-400">⚙</span>
                  {friendlyToolName(t.name)}
                </span>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              Error: {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input + suggested prompts — single bottom bar */}
      <div className="border-t border-[#e5e5ea] bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-2">

          {/* Suggested prompts — vertical list, only before first message */}
          {messages.length === 0 && suggestedPrompts.length > 0 && (
            <div className="space-y-0.5">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  disabled={isStreaming}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all duration-150 disabled:opacity-40 flex items-center justify-between gap-2 group"
                >
                  <span className="truncate">{prompt}</span>
                  <span className="shrink-0 text-[#c7c7cc] group-hover:text-[#6e6e73] transition-colors">→</span>
                </button>
              ))}
            </div>
          )}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={placeholder}
            disabled={isStreaming}
            className="flex-1 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-sm text-[#1d1d1f] placeholder-[#6e6e73] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            {isStreaming ? "…" : "Send"}
          </button>
        </div>

        </div>
      </div>
    </div>
  );
}
