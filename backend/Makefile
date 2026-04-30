.PHONY: help install run-prod dev test clean db-up db-down db-reset

help:
	@echo "Available commands:"
	@echo "  make install          - Install dependencies"
	@echo "  make run-prod         - Start server (production mode)"
	@echo "  make dev              - Start server with auto-reload"
	@echo "  make test             - Test if everything works"
	@echo "  make clean            - Remove cache files"

install:
	uv sync

run-prod:
	uv run gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8001

dev:
	uv run uvicorn app.main:app --reload --port 8001

test:
	@uv run python -c "import fastapi; import alembic; print('All packages installed!')"
	@curl -s http://localhost:8001/health || echo "Server not running"

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

db-up:
	docker compose up -d

db-down:
	docker compose down

db-reset:
	docker compose down -v
	docker compose up -d