"""FastAPI entry point — mounts each agent as an AG-UI sub-application."""
from __future__ import annotations

import os
import time
from collections import defaultdict

from dotenv import load_dotenv

# Must load .env BEFORE importing agents — they read os.getenv() at import time
load_dotenv()

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

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

# ── Site token — blocks direct curl calls to Railway ──────────────────────────
# Set SITE_SECRET to the same random string on Railway and Vercel.
# Leave unset (or empty) in local dev so it's ignored.
SITE_SECRET = os.getenv("SITE_SECRET", "")


class SiteTokenMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)
        if SITE_SECRET:
            token = request.headers.get("X-Site-Token", "")
            if token != SITE_SECRET:
                return JSONResponse({"error": "Unauthorized"}, status_code=401)
        return await call_next(request)


app.add_middleware(SiteTokenMiddleware)

# ── IP rate limiter — max requests per minute per IP ──────────────────────────
RATE_LIMIT_RPM = int(os.getenv("RATE_LIMIT_RPM", "20"))  # requests per minute


class _RateLimiter:
    def __init__(self, rpm: int):
        self.rpm = rpm
        self._log: dict[str, list[float]] = defaultdict(list)

    def is_allowed(self, ip: str) -> bool:
        now = time.monotonic()
        window = now - 60.0
        timestamps = self._log[ip]
        # Evict old timestamps
        self._log[ip] = [t for t in timestamps if t > window]
        if len(self._log[ip]) >= self.rpm:
            return False
        self._log[ip].append(now)
        return True


_limiter = _RateLimiter(RATE_LIMIT_RPM)


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/health":
            return await call_next(request)
        # Prefer the real client IP when behind Railway's proxy
        forwarded = request.headers.get("X-Forwarded-For", "")
        ip = forwarded.split(",")[0].strip() if forwarded else (
            request.client.host if request.client else "unknown"
        )
        if not _limiter.is_allowed(ip):
            return JSONResponse(
                {"error": "Rate limit exceeded — please wait a moment before trying again."},
                status_code=429,
            )
        return await call_next(request)


app.add_middleware(RateLimitMiddleware)

# ── Mount agents ───────────────────────────────────────────────────────────────
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
