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

# 注册路由
from apps.api.products import router as product_router
from apps.api.categories import router as category_router
from apps.api.skus import router as sku_router

app.include_router(product_router)
app.include_router(category_router)
app.include_router(sku_router)
