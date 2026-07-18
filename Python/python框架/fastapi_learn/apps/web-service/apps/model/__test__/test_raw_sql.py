# model/main.py
import asyncio
from sqlalchemy import text
from engine import getEngine
from apps.model.base import Base
import apps.model.category  # noqa: F401
import apps.model.product  # noqa: F401
import apps.model.sku  # noqa: F401


async def init_db():
    engine = getEngine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("✅ 数据库表创建完成")


async def raw_sql_insert():
    """直接用 SQL 字符串插入数据"""
    engine = getEngine()
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "INSERT INTO product (name, description, brand) VALUES ('iPhone 16', '最新款智能手机', 'Apple')"
            )
        )
        await conn.execute(
            text(
                "INSERT INTO product (name, description, brand) VALUES ('iPhone 15', '上一代旗舰', 'Apple')"
            )
        )
        await conn.execute(
            text(
                "INSERT INTO product (name, description, brand) VALUES ('Galaxy S25', '三星旗舰', 'Samsung')"
            )
        )
        await conn.execute(
            text(
                "INSERT INTO product (name, description, brand) VALUES ('Xiaomi 15', '性价比之选', 'Xiaomi')"
            )
        )
    print("✅ 数据插入完成")


async def search_products(keyword: str):
    """按关键字搜索商品——接受用户输入，拼接 SQL"""
    engine = getEngine()
    async with engine.connect() as conn:
        # sql = f"SELECT * FROM product WHERE name LIKE '%{keyword}%'"
        # 参数话绑定，防止sql注入
        sql = f"SELECT * FROM product WHERE name LIKE :keyword"
        result = await conn.execute(text(sql), {"keyword": f"%{keyword}%"})
        rows = result.fetchall()
        for row in rows:
            print(f"  [{row.id}] {row.name} - {row.brand}")


async def delete_product_by_id(product_id: str):
    """按 ID 删除商品——接受用户输入，拼接 SQL"""
    engine = getEngine()
    async with engine.begin() as conn:
        sql = f"DELETE FROM product WHERE id = {product_id}"
        await conn.execute(text(sql))
    print(f"✅ 删除完成，id={product_id}")


async def main():
    await init_db()
    await raw_sql_insert()
    # 正常查询
    print("=== 搜索 'iPhone' ===")
    await search_products("iPhone")
    # 正常删除
    print("=== 删除 id=1 ===")
    await delete_product_by_id("1")
    print("=== 再次搜索 'iPhone' ===")
    await search_products("iPhone")


if __name__ == "__main__":
    asyncio.run(main())
