.PHONY: dev install debugger

install:
	uv sync

dev:
	uv run --package web-service fastapi dev ./apps/web-service//apps/main.py --port 8080


debugger:
	uv run --package web-service python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m fastapi dev apps/web-service/apps/main.py --port 8000

# 数据库迁移
db-migrate:
	uv run --package web-service alembic -c apps/web-service/alembic.ini revision --autogenerate -m "$(message)"

# 数据库同步
db-upgrade:
	uv run --package web-service alembic -c apps/web-service/alembic.ini upgrade head

# 数据库回滚
db-downgrade:
	uv run --package web-service alembic -c apps/web-service/alembic.ini downgrade $(version)