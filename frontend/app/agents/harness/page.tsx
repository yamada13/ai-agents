"use client";

import AgentPageShell from "@/components/AgentPageShell";
import AgentChat from "@/components/AgentChat";
import { useAgentStream } from "@/hooks/useAgentStream";
import { AGENTS } from "@/lib/agents";

const agent = AGENTS.find((a) => a.id === "harness")!;

export default function HarnessAgentPage() {
  const { messages, toolCalls, isStreaming, error, sendMessage } = useAgentStream({
    agentPath: "/api/agents/harness",
  });

  return (
    <AgentPageShell agent={agent}>
      <AgentChat
        messages={messages}
        toolCalls={toolCalls}
        isStreaming={isStreaming}
        error={error}
        onSend={sendMessage}
        placeholder="Ask me to compute something — e.g. 'Calculate the first 15 fibonacci numbers'"
        initialMessage="I can write and execute Python to answer your questions. Try: 'Calculate the first 15 fibonacci numbers' or 'What is 17 to the power of 13?'"
      />
    </AgentPageShell>
  );
}
