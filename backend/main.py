"""FastAPI entry point — mounts each agent as an AG-UI sub-application."""
from __future__ import annotations

import os

from dotenv import load_dotenv

# Must load .env BEFORE importing agents — they read os.getenv() at import time
load_dotenv()

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from agents.pydantic_agent import app as pydantic_app
from agents.crawler_agent import app as crawler_app
from agents.harness_agent import app as harness_app
from agents.productivity_agent import app as productivity_app

app = FastAPI(title="AI Agents Platform")

# ── CORS ───────────────────────────────────────────────────────────────────────
_origins_raw = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origins = [o.strip() for o in _origins_raw.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount agents ───────────────────────────────────────────────────────────────
# Each agent.to_ag_ui() returns a Starlette ASGI app that handles AG-UI
# streaming via SSE at its mount path.
app.mount("/agents/pydantic", pydantic_app)
app.mount("/agents/crawler", crawler_app)
app.mount("/agents/harness", harness_app)
app.mount("/agents/productivity", productivity_app)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.getenv("PORT", "9000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
