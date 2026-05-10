"""Pydantic AI Agent — general-purpose assistant with tools.

Demonstrates:
- Basic Pydantic AI agent setup
- Tool definition with @agent.tool_plain
- AG-UI streaming via agent.to_ag_ui()
"""
from __future__ import annotations

import os
from datetime import datetime
from zoneinfo import ZoneInfo

import httpx
from pydantic_ai import Agent

MODEL = os.getenv("DEFAULT_MODEL", "anthropic:claude-sonnet-4-6")

agent = Agent(
    MODEL,
    name="pydantic",
    instructions="""You are a helpful AI assistant with two tools:
- current_time(timezone): use this for ANY question about the current time or date. \
Pass the IANA timezone string (e.g. 'Asia/Kolkata' for India, 'America/New_York' for New York, \
'Asia/Tokyo' for Japan). Never fetch external URLs to get the time.
- fetch_url(url): use this to read web pages when the user asks about a specific URL or \
wants information from the web.

Be concise and accurate.""",
)


@agent.tool_plain
async def current_time(timezone: str = "UTC") -> str:
    """Get the current time in ISO format.

    Args:
        timezone: IANA timezone string, e.g. 'America/New_York'.
    """
    tz = ZoneInfo(timezone)
    return datetime.now(tz=tz).isoformat()


@agent.tool_plain
async def fetch_url(url: str) -> str:
    """Fetch the text content of a URL.

    Args:
        url: The URL to fetch.

    Returns:
        Plain text of the page (first 4000 chars).
    """
    async with httpx.AsyncClient(follow_redirects=True, timeout=15) as client:
        resp = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        return resp.text[:4000]


# Expose as AG-UI ASGI app — mounted at /agents/pydantic in main.py
app = agent.to_ag_ui()
