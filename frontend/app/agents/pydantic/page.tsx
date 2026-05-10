"use client";

import AgentPageShell from "@/components/AgentPageShell";
import AgentChat from "@/components/AgentChat";
import { useAgentStream } from "@/hooks/useAgentStream";
import { AGENTS } from "@/lib/agents";

const agent = AGENTS.find((a) => a.id === "pydantic")!;

export default function PydanticAgentPage() {
  const { messages, toolCalls, isStreaming, error, sendMessage } = useAgentStream({
    agentPath: "/api/agents/pydantic",
  });

  return (
    <AgentPageShell agent={agent}>
      <AgentChat
        messages={messages}
        toolCalls={toolCalls}
        isStreaming={isStreaming}
        error={error}
        onSend={sendMessage}
        placeholder="Ask me anything — e.g. 'What time is it in Tokyo?'"
        initialMessage="Hello! I'm your Pydantic AI assistant. I can answer questions, check the time in any timezone, and fetch web pages. What would you like to know?"
      />
    </AgentPageShell>
  );
}
