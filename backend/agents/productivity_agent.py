"""Productivity Agent — task manager with AG-UI shared state."""
from __future__ import annotations

import os
import re
from datetime import datetime
from uuid import uuid4

from ag_ui.core import StateSnapshotEvent
from pydantic import BaseModel
from pydantic_ai import Agent, RunContext
from pydantic_ai.messages import ToolReturn
from pydantic_ai.ui import StateDeps

MODEL = os.getenv("DEFAULT_MODEL", "anthropic:claude-sonnet-4-6")


# ── State ──────────────────────────────────────────────────────────────────────

class Task(BaseModel):
    id: str
    title: str
    description: str = ""
    priority: str = "medium"
    status: str = "todo"
    created_at: str = ""
    due_date: str = ""


class TaskListState(BaseModel):
    tasks: list[Task] = []


# ── Agent ──────────────────────────────────────────────────────────────────────

agent = Agent(
    MODEL,
    name="productivity",
    deps_type=StateDeps[TaskListState],
    instructions="""You are a productivity assistant that manages a task board.

Tools:
  • create_task(title, priority, due_date) — add one task. Call once per task.
  • update_task(task_id, field, value) — update one field of a task.
  • delete_task(task_id) — delete a task.
  • list_tasks() — read all tasks with short IDs.

Use task short IDs (8 chars) shown in the board below. Do NOT add brackets or prefixes.
Call create_task once for each new task, only for tasks NOT already on the board.
priority: low | medium | high    status: todo | in_progress | done
Reply with one short sentence after acting.""",
)


@agent.system_prompt
async def board_state(ctx: RunContext[StateDeps[TaskListState]]) -> str:
    """Inject the current task list so the model never re-adds existing tasks."""
    tasks = ctx.deps.state.tasks
    if not tasks:
        return "Board is empty."
    lines = []
    for t in tasks:
        due = f", due {t.due_date}" if t.due_date else ""
        lines.append(f"  {t.id[:8]} | {t.title} | {t.priority} | {t.status}{due}")
    return (
        "Current board (tasks that ALREADY EXIST — do NOT recreate these):\n"
        "  shortID  | title | priority | status\n"
        + "\n".join(lines)
    )


def _snapshot(ctx: RunContext[StateDeps[TaskListState]]) -> StateSnapshotEvent:
    return StateSnapshotEvent(snapshot=ctx.deps.state.model_dump())


def _clean_str(v: str | None) -> str:
    if not v or v.strip().lower() in ("null", "none", "undefined", ""):
        return ""
    return v.strip()


def _clean_id(task_id: str) -> str:
    """Strip any brackets/prefixes the model adds: [id:abc] → abc, id:abc → abc."""
    tid = task_id.strip().strip("[]")
    tid = re.sub(r"^id\s*[:=]\s*", "", tid, flags=re.IGNORECASE)
    return tid.strip()


def _find_task(tasks: list[Task], task_id: str) -> Task | None:
    tid = _clean_id(task_id)
    for t in tasks:
        if t.id == tid or t.id.startswith(tid):
            return t
    return None


# strict=True tells Groq to reject any fields not in the schema at the API level,
# preventing the model from sending stray fields like "$", "done", etc.

@agent.tool(strict=True)
async def list_tasks(ctx: RunContext[StateDeps[TaskListState]]) -> str:
    """Read all tasks. Use the shortID (first 8 chars of the id column) for update/delete."""
    tasks = ctx.deps.state.tasks
    if not tasks:
        return "Board is empty."
    lines = []
    for t in tasks:
        due = f", due:{t.due_date}" if t.due_date else ""
        lines.append(f"{t.id[:8]} | {t.title} | {t.priority} | {t.status}{due}")
    return "\n".join(lines)


@agent.tool(strict=True)
async def create_task(
    ctx: RunContext[StateDeps[TaskListState]],
    title: str,
    priority: str,
    due_date: str,
) -> ToolReturn:
    """Add one new task. Call once per task.

    Args:
        title: Task title.
        priority: Must be exactly: low, medium, or high.
        due_date: Due date string, or empty string if none.
    """
    task = Task(
        id=str(uuid4()),
        title=title,
        priority=_clean_str(priority) or "medium",
        status="todo",
        created_at=datetime.utcnow().isoformat(),
        due_date=_clean_str(due_date),
    )
    ctx.deps.state.tasks.append(task)
    return ToolReturn(
        return_value=f"Created '{title}' shortID={task.id[:8]}",
        metadata=_snapshot(ctx),
    )


@agent.tool(strict=True)
async def update_task(
    ctx: RunContext[StateDeps[TaskListState]],
    task_id: str,
    field: str,
    value: str,
) -> ToolReturn:
    """Update one field of a task. Use the shortID from list_tasks or the board.

    Args:
        task_id: Short ID (8 chars) of the task to update.
        field: Field to change: title | priority | status | due_date
        value: New value for the field.
    """
    task = _find_task(ctx.deps.state.tasks, task_id)
    if not task:
        return ToolReturn(
            return_value=f"Task '{task_id}' not found. Call list_tasks to see valid IDs.",
            metadata=_snapshot(ctx),
        )
    field = field.lower().strip()
    if field == "title":
        task.title = value
    elif field == "priority":
        task.priority = _clean_str(value) or task.priority
    elif field == "status":
        task.status = value
    elif field == "due_date":
        task.due_date = _clean_str(value)
    return ToolReturn(
        return_value=f"Updated {field} of '{task.title}' to '{value}'",
        metadata=_snapshot(ctx),
    )


@agent.tool(strict=True)
async def delete_task(
    ctx: RunContext[StateDeps[TaskListState]],
    task_id: str,
) -> ToolReturn:
    """Delete a task. Use the shortID from list_tasks or the board.

    Args:
        task_id: Short ID (8 chars) of the task to delete.
    """
    tid = _clean_id(task_id)
    before = len(ctx.deps.state.tasks)
    ctx.deps.state.tasks = [t for t in ctx.deps.state.tasks if not t.id.startswith(tid)]
    removed = before - len(ctx.deps.state.tasks)
    return ToolReturn(
        return_value=f"Deleted {removed} task(s).",
        metadata=_snapshot(ctx),
    )


app = agent.to_ag_ui(deps=StateDeps(TaskListState()))
