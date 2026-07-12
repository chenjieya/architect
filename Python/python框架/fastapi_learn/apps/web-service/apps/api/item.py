from fastapi import APIRouter
from apps.schema.item import Item

router = APIRouter()


@router.get("/items/{item_id}")
def read_item(item_id: int, q: str | None = None):
    print("sdhakhsdkj")
    return {"item_id": item_id, "q": q}


@router.put("/items/{item_id}")
def update_item(item_id: int, item: Item):
    return {"item_name": item.name, "item_id": item_id}
