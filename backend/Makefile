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
	uv run pytest

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +

db-up:
	docker compose -f ../docker/local/docker-compose.yml --env-file ../docker/local/.env up -d

db-down:
	docker compose -f ../docker/local/docker-compose.yml --env-file ../docker/local/.env down

db-reset:
	docker compose -f ../docker/local/docker-compose.yml --env-file ../docker/local/.env down -v
	docker compose -f ../docker/local/docker-compose.yml --env-file ../docker/local/.env up -d

create-admin:
	uv run --env-file .env python scripts/create_admin.py