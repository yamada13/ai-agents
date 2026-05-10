"""Productivity Agent — task manager with AG-UI shared state.

Demonstrates:
- StateDeps: agent and frontend share a live task list
- StateSnapshotEvent in ToolReturn.metadata: pushes state updates to the UI
- AG-UI shared state pattern (agent.to_ag_ui with deps)

The frontend receives TaskListState snapshots in real-time and renders them
without polling — the agent pushes updates as it creates/edits/deletes tasks.
"""
from __future__ import annotations

import os
from datetime import datetime
from uuid import uuid4

from ag_ui.core import StateSnapshotEvent
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from pydantic_ai.messages import ToolReturn
from pydantic_ai.ui import StateDeps

MODEL = os.getenv("DEFAULT_MODEL", "anthropic:claude-sonnet-4-6")


# ── State models ───────────────────────────────────────────────────────────────

class Task(BaseModel):
    id: str
    title: str
    description: str = ""
    priority: str = "medium"   # low | medium | high
    status: str = "todo"       # todo | in_progress | done
    created_at: str = ""
    due_date: str = ""


class TaskListState(BaseModel):
    tasks: list[Task] = []


# ── Agent ──────────────────────────────────────────────────────────────────────

agent = Agent(
    MODEL,
    name="productivity",
    deps_type=StateDeps[TaskListState],
    instructions="""You are a productivity assistant that helps manage tasks.
You can create, update, list, and delete tasks. After every task mutation, the
updated list is automatically synced to the user's UI.

When creating tasks, infer a sensible priority (low/medium/high) from the
user's language. Always confirm what you did in a short, friendly message.""",
)


def _snapshot(ctx: RunContext[StateDeps[TaskListState]]) -> StateSnapshotEvent:
    """Build a state snapshot event from current task list."""
    return StateSnapshotEvent(snapshot=ctx.deps.state.model_dump())


@agent.tool
async def create_task(
    ctx: RunContext[StateDeps[TaskListState]],
    title: str,
    description: str = "",
    priority: str = "medium",
    due_date: str = "",
) -> ToolReturn:
    """Add a new task to the list.

    Args:
        title: Short task title.
        description: Optional longer description.
        priority: low | medium | high
        due_date: Optional due date string.
    """
    task = Task(
        id=str(uuid4()),
        title=title,
        description=description,
        priority=priority,
        status="todo",
        created_at=datetime.utcnow().isoformat(),
        due_date=due_date,
    )
    ctx.deps.state.tasks.append(task)
    return ToolReturn(return_value=f"Created task '{title}'", metadata=_snapshot(ctx))


@agent.tool
async def update_task(
    ctx: RunContext[StateDeps[TaskListState]],
    task_id: str,
    title: str | None = None,
    description: str | None = None,
    priority: str | None = None,
    status: str | None = None,
    due_date: str | None = None,
) -> ToolReturn:
    """Update fields on an existing task.

    Args:
        task_id: The task's id.
        title: New title (optional).
        description: New description (optional).
        priority: New priority (optional).
        status: New status: todo | in_progress | done (optional).
        due_date: New due date (optional).
    """
    for task in ctx.deps.state.tasks:
        if task.id == task_id:
            if title is not None:
                task.title = title
            if description is not None:
                task.description = description
            if priority is not None:
                task.priority = priority
            if status is not None:
                task.status = status
            if due_date is not None:
                task.due_date = due_date
            return ToolReturn(return_value=f"Updated task '{task.title}'", metadata=_snapshot(ctx))
    return ToolReturn(return_value=f"Task {task_id} not found", metadata=_snapshot(ctx))


@agent.tool
async def delete_task(
    ctx: RunContext[StateDeps[TaskListState]],
    task_id: str,
) -> ToolReturn:
    """Delete a task by id.

    Args:
        task_id: The task's id.
    """
    before = len(ctx.deps.state.tasks)
    ctx.deps.state.tasks = [t for t in ctx.deps.state.tasks if t.id != task_id]
    removed = before - len(ctx.deps.state.tasks)
    return ToolReturn(return_value=f"Deleted {removed} task(s)", metadata=_snapshot(ctx))


@agent.tool_plain
async def list_tasks_text(tasks: list[Task]) -> str:
    """Format the task list as readable text for the agent to include in its reply."""
    if not tasks:
        return "No tasks yet."
    lines = []
    for t in tasks:
        due = f" (due {t.due_date})" if t.due_date else ""
        lines.append(f"- [{t.status}] {t.title} [{t.priority}]{due} — {t.id[:8]}")
    return "\n".join(lines)


# Shared state initialised empty; frontend receives snapshots on each mutation
app = agent.to_ag_ui(deps=StateDeps(TaskListState()))
