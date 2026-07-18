# apps/web-service/apps/main.py

from fastapi import FastAPI
from apps.core.config import base_config, web_config

is_production = base_config.environment == "production"

app = FastAPI(
    title=web_config.title,
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

from apps.api.item import router as item_router
from apps.api.welcome import router as welcome_router

app.include_router(item_router)
app.include_router(welcome_router)
