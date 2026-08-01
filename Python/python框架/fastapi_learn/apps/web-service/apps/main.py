# apps/web-service/apps/main.py

from fastapi import FastAPI
from apps.core.config import base_config, web_config

from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException

from apps.exception.handler.docs import generate_error_docs
from apps.exception.handler.handlers import exception_handler

from apps.core.middleware import register_middleware
from apps.core.openapi import setup_openapi

is_production = base_config.environment == "production"

app = FastAPI(
    title=web_config.title,
    description=generate_error_docs(),
    docs_url=None if is_production else "/docs",
    redoc_url=None if is_production else "/redoc",
    openapi_url=None if is_production else "/openapi.json",
)

# 注册中间件（每一个请求都会先到中间件，包括注册路由其实内部也是由中间件实现的）
register_middleware(app)

# 处理文档schemal的格式
setup_openapi(app)

# 注册全局异常处理器（覆盖 Starlette/FastAPI 内置处理器 + 兜底未知异常）
app.add_exception_handler(RequestValidationError, exception_handler)
app.add_exception_handler(HTTPException, exception_handler)
app.add_exception_handler(Exception, exception_handler)

# 注册路由
from apps.api.products import router as product_router
from apps.api.categories import router as category_router
from apps.api.skus import router as sku_router

app.include_router(product_router)
app.include_router(category_router)
app.include_router(sku_router)
