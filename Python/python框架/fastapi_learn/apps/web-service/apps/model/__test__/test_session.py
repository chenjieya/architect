# model/main.py
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select, insert
from engine import getEngine
from apps.model.base import Base
from apps.model.product import Product
import apps.model.category  # noqa: F401
import apps.model.sku  # noqa: F401

session_factory = async_sessionmaker(
    getEngine(),
    class_=AsyncSession,  # 明确指定使用异步 Session
    expire_on_commit=False,
)


async def init_db():
    engine = getEngine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ 数据库表创建完成")


async def insert_with_session():
    session = session_factory()
    try:
        stmt = insert(Product).values(
            name="iPhone 16",
            description="最新款智能手机",
            brand="Apple",
        )
        await session.execute(stmt)
        await session.commit()
    except:
        await session.rollback()
        raise
    finally:
        await session.close()
    print("✅ 提交完成")


async def insert_with_manual_commit():
    """手动提交"""
    async with session_factory() as session:
        try:
            stmt = insert(Product).values(
                name="iPhone 16",
                description="最新款智能手机",
                brand="Apple",
            )
            await session.execute(stmt)
            await session.commit()
        except:
            await session.rollback()
            raise
    print("✅ 手动提交完成")


async def insert_with_auto_commit():
    """自动提交"""
    async with session_factory.begin() as session:
        stmt = insert(Product).values(
            name="iPhone 15",
            description="上一代旗舰",
            brand="Apple",
        )
        await session.execute(stmt)
    print("✅ 自动提交完成")


async def main():
    await init_db()
    await insert_with_session()
    await insert_with_manual_commit()
    await insert_with_auto_commit()


if __name__ == "__main__":
    asyncio.run(main())
