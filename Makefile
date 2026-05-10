.PHONY: setup setup-backend setup-frontend dev dev-backend dev-frontend install

# ── Setup ──────────────────────────────────────────────────────────────────────

setup: setup-backend setup-frontend
	@echo "\n✅ Setup complete. Copy backend/.env.example → backend/.env and fill in your API keys.\n"

setup-backend:
	@echo "→ Setting up Python backend..."
	cd backend && uv sync

setup-frontend:
	@echo "→ Setting up Next.js frontend..."
	cd frontend && pnpm install

# ── Dev servers ────────────────────────────────────────────────────────────────

dev:
	@echo "Starting backend on :9000 and frontend on :3000 ..."
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend:
	cd backend && uv run uvicorn main:app --host 0.0.0.0 --port 9000 --reload

dev-frontend:
	cd frontend && pnpm dev

# ── Env setup helper ───────────────────────────────────────────────────────────

env:
	@if [ ! -f backend/.env ]; then \
		cp backend/.env.example backend/.env; \
		echo "Created backend/.env — add your API keys."; \
	else \
		echo "backend/.env already exists."; \
	fi
