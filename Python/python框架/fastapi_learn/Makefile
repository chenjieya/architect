.PHONY: dev install debugger

install:
	uv sync

dev:
	uv run --package web-service fastapi dev ./apps/web-service//apps/main.py --port 8080


debugger:
	uv run --package web-service python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m fastapi dev apps/web-service/apps/main.py --port 8000