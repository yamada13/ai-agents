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
}

export default function AgentChat({
  messages,
  toolCalls,
  isStreaming,
  error,
  onSend,
  placeholder = "Type a message...",
  initialMessage,
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
                {m.content || (isStreaming ? <span className="animate-pulse text-[#6e6e73]">●●●</span> : "")}
              </div>
            </div>
          ))}

          {/* Tool call activity */}
          {toolCalls.length > 0 && (
            <div className="space-y-1.5">
              {toolCalls.map((t) => (
                <div
                  key={t.id}
                  className="text-xs font-mono bg-white border border-[#e5e5ea] rounded-xl px-3 py-2 text-[#6e6e73] shadow-sm"
                >
                  <span className="text-purple-500 font-medium">⚙ {t.name}</span>
                  {t.args && (
                    <span className="ml-2 text-[#6e6e73]">
                      {t.args.length > 60 ? t.args.slice(0, 60) + "…" : t.args}
                    </span>
                  )}
                  {t.result && (
                    <div className="mt-1 text-green-600">
                      ↳ {t.result.length > 80 ? t.result.slice(0, 80) + "…" : t.result}
                    </div>
                  )}
                </div>
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

      {/* Input — also constrained + centered */}
      <div className="border-t border-[#e5e5ea] bg-white px-4 py-3">
        <div className="max-w-2xl mx-auto flex gap-2">
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
  );
}
