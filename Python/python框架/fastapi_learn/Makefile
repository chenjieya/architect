.PHONY: dev install

install:
	uv sync

dev:
	uv run --package web-service fastapi dev ./apps/web-service/main.py --port 8080