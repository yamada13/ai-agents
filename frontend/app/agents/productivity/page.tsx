"use client";

import { useCallback, useState } from "react";
import AgentPageShell from "@/components/AgentPageShell";
import AgentChat from "@/components/AgentChat";
import TaskList from "@/components/TaskList";
import { useAgentStream } from "@/hooks/useAgentStream";
import { AGENTS } from "@/lib/agents";
import { AGENT_CONTENT } from "@/lib/agentContent";

const agent = AGENTS.find((a) => a.id === "productivity")!;
const prompts = AGENT_CONTENT.productivity.prompts.map((p) => p.text);;

interface TaskListState {
  tasks: {
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "todo" | "in_progress" | "done";
    due_date: string;
  }[];
}

export default function ProductivityAgentPage() {
  const [taskState, setTaskState] = useState<TaskListState>({ tasks: [] });

  const handleSnapshot = useCallback((snapshot: unknown) => {
    if (snapshot && typeof snapshot === "object" && "tasks" in snapshot) {
      setTaskState(snapshot as TaskListState);
    }
  }, []);

  const { messages, toolCalls, isStreaming, error, sendMessage } = useAgentStream({
    agentPath: "/api/agents/productivity",
    onStateSnapshot: handleSnapshot,
  });

  return (
    <AgentPageShell agent={agent}>
      <div className="flex h-full">
        {/* Live task board */}
        <div className="w-80 shrink-0 border-r border-[#e5e5ea] bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-[#e5e5ea]">
            <h2 className="text-sm font-semibold text-[#1d1d1f]">Task Board</h2>
            <p className="text-xs text-[#6e6e73] mt-0.5">
              {taskState.tasks.length} task{taskState.tasks.length !== 1 ? "s" : ""} — updates live
            </p>
          </div>
          <div className="flex-1 overflow-hidden bg-[#fafafa]">
            <TaskList tasks={taskState.tasks} />
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <AgentChat
            messages={messages}
            toolCalls={toolCalls}
            isStreaming={isStreaming}
            error={error}
            onSend={sendMessage}
            suggestedPrompts={prompts}
            placeholder="e.g. 'Add a high-priority task to review the Q2 report by Friday'"
            initialMessage="I'm your AI task manager! Create, update, or delete tasks by chatting — the board on the left updates live. Try: 'Add a high-priority task to review the Q2 report by Friday'"
          />
        </div>
      </div>
    </AgentPageShell>
  );
}
