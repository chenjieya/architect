from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from apps.core.config import db_config

_engine: AsyncEngine | None = None


def getEngine():
    global _engine

    if _engine is None:
        url = f"postgresql+asyncpg://{db_config.user}:{db_config.password}@{db_config.ip}:{db_config.port}/{db_config.name}"
        config = {
            "pool_size": 10,  # 连接池维持的连接数
            "max_overflow": 20,  # 池满后额外可创建的连接数
            "pool_pre_ping": True,  # 每次连接前检查是否存活
            "echo": True,  # 是否打印 SQL 日志
        }
        _engine = create_async_engine(url, **config)
    return _engine
