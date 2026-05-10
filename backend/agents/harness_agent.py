"""Harness Agent — code execution + tool search via Pydantic AI Harness.

Demonstrates:
- pydantic-ai-harness CodeMode: wraps all tools into a single run_code call,
  letting the model write Python that calls tools in loops/conditionals
- ToolSearch capability (built into pydantic-ai core)
- AG-UI streaming of code execution results

CodeMode docs: https://github.com/pydantic/pydantic-ai-harness
"""
from __future__ import annotations

import os

from pydantic_ai import Agent
from pydantic_ai_harness import CodeMode  # pip: pydantic-ai-harness[code-mode]

MODEL = os.getenv("DEFAULT_MODEL", "anthropic:claude-sonnet-4-6")

agent = Agent(
    MODEL,
    name="harness",
    instructions="""You are a data analysis and coding agent.
You can write and execute Python code to analyse data, do calculations, transform
datasets, and answer quantitative questions. When given a task:
1. Think through what code would solve it.
2. Use run_code to execute the Python.
3. Interpret the output and explain it clearly.
Be precise — show your work.""",
    capabilities=[
        # CodeMode wraps every tool into a single run_code sandbox call.
        # The model writes Python; Monty executes it safely.
        CodeMode(),
    ],
)


# Tools below are available INSIDE the CodeMode sandbox as Python functions.
# The model writes code that calls them — no direct tool calls needed.

@agent.tool_plain
async def fetch_url_text(url: str) -> str:
    """Fetch plain text from a URL (usable inside run_code).

    Args:
        url: The URL to fetch.
    """
    import httpx  # noqa: PLC0415

    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        return resp.text[:5000]


@agent.tool_plain
async def run_python(code: str) -> str:
    """Execute arbitrary Python and return stdout + result.

    This is a lightweight fallback used when CodeMode's Monty sandbox is
    unavailable. CodeMode's run_code takes priority when enabled.

    Args:
        code: Python source code to execute.
    """
    import io
    import sys
    import traceback

    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    try:
        local_ns: dict = {}
        exec(compile(code, "<agent>", "exec"), local_ns)  # noqa: S102
        result = local_ns.get("result", "")
        output = buf.getvalue()
        return f"{output}\n{result}".strip()
    except Exception:
        return f"Error:\n{traceback.format_exc()}"
    finally:
        sys.stdout = old_stdout


app = agent.to_ag_ui()
