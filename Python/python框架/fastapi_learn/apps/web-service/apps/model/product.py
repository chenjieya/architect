# model/product.py
from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from apps.model.association import product_category
from apps.model.base import Base, IDMixin, TimestampMixin

if TYPE_CHECKING:
    from apps.model.category import Category
    from apps.model.sku import Sku


class Product(Base, IDMixin, TimestampMixin):

    name: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    brand: Mapped[str | None] = mapped_column(String(100))

    categories: Mapped[list["Category"]] = relationship(
        secondary=product_category, back_populates="products"
    )
    skus: Mapped[list["Sku"]] = relationship(back_populates="product")
