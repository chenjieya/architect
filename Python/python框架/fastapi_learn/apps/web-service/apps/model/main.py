import asyncio
from sqlalchemy import text
from apps.model.engine import getEngine


async def test_connection():
    engine = getEngine()

    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            # 获取结果(第一行第一列)
            value = result.scalar()
            print(f"✅ 异步连接 PostgreSQL 成功！查询结果: {value}")
    except Exception as e:
        print(f"❌ 连接失败: {e}")
    finally:
        # 关闭引擎，释放资源
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_connection())
