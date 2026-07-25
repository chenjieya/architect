from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)

from apps.core.config import db_config

_engine: AsyncEngine | None = None


def get_engine() -> AsyncEngine:
    global _engine

    if _engine is None:
        url = f"postgresql+asyncpg://{db_config.user}:{db_config.password}@{db_config.ip}:{db_config.port}/{db_config.name}"
        _engine = create_async_engine(
            url, pool_size=10, max_overflow=20, pool_pre_ping=True, echo=False
        )

    return _engine


_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory

    if _session_factory is None:
        _session_factory = async_sessionmaker(
            get_engine(),
            class_=AsyncSession,  # 明确指定使用异步 Session
            expire_on_commit=False,
        )

    return _session_factory


"""
相同点                                                                                                                                   配置验证失败
    FastAPI 默认会缓存依赖（use_cache=True），所以两种写法在整个请求期间确实用的是同一个 session——get_db() 只会被调用一次。                  Context
不同点                                                                                                                                   18% used
    yield 版本（生成器）：
    async def get_db():                                                                                                                      LSPs are disabled
        async with AsyncSession(engine) as session:  # 进入上下文
            yield session                             # 给 handler 用
        # 请求结束后，回到这里，session 自动关闭

    - 请求结束后会回到 yield 之后执行退出逻辑
    - async with 保证 session 被关闭

    return 版本：
     def get_db():
        return get_session_factory()()  # 创建完就返回，没有清理

    - session 永远不关，连接池会被耗尽
    - 没有 async with，数据库连接一直开着
"""


# def get_db() -> AsyncSession:
#     return get_session_factory()()


async def get_db() -> AsyncGenerator[AsyncSession]:
    async with get_session_factory().begin() as session:
        yield session
