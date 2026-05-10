"use client";

import AgentPageShell from "@/components/AgentPageShell";
import AgentChat from "@/components/AgentChat";
import { useAgentStream } from "@/hooks/useAgentStream";
import { AGENTS } from "@/lib/agents";
import { AGENT_CONTENT } from "@/lib/agentContent";

const agent = AGENTS.find((a) => a.id === "crawler")!;
const prompts = AGENT_CONTENT.crawler.prompts.map((p) => p.text);;

export default function CrawlerAgentPage() {
  const { messages, toolCalls, isStreaming, error, sendMessage } = useAgentStream({
    agentPath: "/api/agents/crawler",
  });

  return (
    <AgentPageShell agent={agent}>
      <AgentChat
        messages={messages}
        toolCalls={toolCalls}
        isStreaming={isStreaming}
        error={error}
        onSend={sendMessage}
        suggestedPrompts={prompts}
        placeholder="Give me a URL and a question — e.g. 'What does https://pydantic.dev do?'"
        initialMessage="Give me a URL and a question, and I'll crawl the page to find your answer. Try: 'What is https://pydantic.dev about?'"
      />
    </AgentPageShell>
  );
}
