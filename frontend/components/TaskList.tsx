"use client";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  status: "todo" | "in_progress" | "done";
  due_date?: string;
}

const priorityDot: Record<string, string> = {
  high:   "bg-red-400",
  medium: "bg-yellow-400",
  low:    "bg-green-400",
};

const statusBadge: Record<string, string> = {
  todo:        "bg-gray-100 text-gray-500",
  in_progress: "bg-blue-50 text-blue-600",
  done:        "bg-green-50 text-green-600",
};

const statusLabel: Record<string, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export default function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#6e6e73] text-sm gap-2 p-6 text-center">
        <span className="text-3xl">📋</span>
        <p>No tasks yet</p>
        <p className="text-xs">Ask the agent to create some!</p>
      </div>
    );
  }

  const grouped: Record<string, Task[]> = {
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    todo:        tasks.filter((t) => t.status === "todo"),
    done:        tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="p-3 space-y-4 overflow-y-auto h-full">
      {Object.entries(grouped).map(([status, items]) =>
        items.length === 0 ? null : (
          <div key={status}>
            <p className="text-xs font-medium text-[#6e6e73] uppercase tracking-wider mb-2 px-1">
              {statusLabel[status]} · {items.length}
            </p>
            <div className="space-y-2">
              {items.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl border border-[#e5e5ea] p-3 shadow-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${priorityDot[task.priority]}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1d1d1f] leading-snug">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-[#6e6e73] mt-0.5 leading-relaxed">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${statusBadge[task.status]}`}>
                          {statusLabel[task.status]}
                        </span>
                        {task.due_date && (
                          <span className="text-xs text-[#6e6e73]">Due {task.due_date}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
