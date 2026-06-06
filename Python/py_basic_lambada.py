products = [
    {"name": "iPhone 15", "inc": "APPLE", "price": 5999, "stock": 3012},
    {"name": "MacBook Pro", "inc": "APPLE", "price": 14999, "stock": 580},
    {"name": "AirPods Pro", "inc": "APPLE", "price": 1899, "stock": 4500},
    {"name": "iPad Air", "inc": "APPLE", "price": 4799, "stock": 1200},
    {"name": "Apple Watch", "inc": "APPLE", "price": 2999, "stock": 2100},
    {"name": "Galaxy S24", "inc": "SAMSUNG", "price": 5499, "stock": 2800},
    {"name": "Galaxy Tab", "inc": "SAMSUNG", "price": 3999, "stock": 950},
    {"name": "Galaxy Buds", "inc": "SAMSUNG", "price": 899, "stock": 3200},
    {"name": "Galaxy Watch", "inc": "SAMSUNG", "price": 2199, "stock": 1500},
    {"name": "Mate 60 Pro", "inc": "HUAWEI", "price": 14999, "stock": 800},
    {"name": "MatePad Pro", "inc": "HUAWEI", "price": 4299, "stock": 1100},
    {"name": "FreeBuds", "inc": "HUAWEI", "price": 999, "stock": 2600},
    {"name": "MateBook", "inc": "HUAWEI", "price": 6999, "stock": 670},
    {"name": "Watch GT", "inc": "HUAWEI", "price": 1488, "stock": 1800},
    {"name": "Xiaomi 14", "inc": "XIAOMI", "price": 14999, "stock": 3500},
    {"name": "Redmi K70", "inc": "XIAOMI", "price": 2499, "stock": 4200},
    {"name": "Mi Pad 6", "inc": "XIAOMI", "price": 1999, "stock": 2000},
    {"name": "Mi Band 8", "inc": "XIAOMI", "price": 239, "stock": 8000},
    {"name": "Xiaomi Buds", "inc": "XIAOMI", "price": 499, "stock": 5000},
    {"name": "Xiaomi Book", "inc": "XIAOMI", "price": 4999, "stock": 890},
    {"name": "Pixel 8", "inc": "GOOGLE", "price": 4999, "stock": 600},
    {"name": "Pixel Buds", "inc": "GOOGLE", "price": 1299, "stock": 1500},
    {"name": "Pixel Watch", "inc": "GOOGLE", "price": 2599, "stock": 900},
    {"name": "Pixel Tablet", "inc": "GOOGLE", "price": 3499, "stock": 400},
    {"name": "ThinkPad X1", "inc": "LENOVO", "price": 14999, "stock": 720},
    {"name": "Legion Y9000", "inc": "LENOVO", "price": 8999, "stock": 1100},
    {"name": "Tab P12", "inc": "LENOVO", "price": 2499, "stock": 1300},
    {"name": "Dell XPS 13", "inc": "DELL", "price": 10999, "stock": 650},
    {"name": "Dell G15", "inc": "DELL", "price": 6999, "stock": 1400},
    {"name": "Surface Pro", "inc": "MICROSOFT", "price": 8999, "stock": 580},
    {"name": "Surface Laptop", "inc": "MICROSOFT", "price": 7999, "stock": 700},
    {"name": "Surface Go", "inc": "MICROSOFT", "price": 3999, "stock": 1200},
    {"name": "OnePlus 12", "inc": "ONEPLUS", "price": 4299, "stock": 1800},
    {"name": "OnePlus Buds", "inc": "ONEPLUS", "price": 599, "stock": 3000},
    {"name": "OnePlus Watch", "inc": "ONEPLUS", "price": 1499, "stock": 1600},
    {"name": "OPPO Find X7", "inc": "OPPO", "price": 14999, "stock": 2200},
    {"name": "OPPO Pad 2", "inc": "OPPO", "price": 2999, "stock": 1000},
    {"name": "OPPO Enco", "inc": "OPPO", "price": 499, "stock": 3500},
    {"name": "Vivo X100", "inc": "VIVO", "price": 3999, "stock": 2500},
    {"name": "Vivo Pad 2", "inc": "VIVO", "price": 2499, "stock": 900},
    {"name": "Vivo TWS", "inc": "VIVO", "price": 399, "stock": 4000},
]


"""
1. 按照价格升序排序
2. 按照价格降序排序
3. 按照库存总额升序排序（库存总额 = 价格 × 库存数量）
4. 找出XIAOMI的所有产品，得到一个字符串列表
5. 找出价格最高的产品所属的公司列表（字符串列表）
6. 得到每家公司产品的平均价格 结果示例：
    [
       {"inc": "HUAWEI", "avg_price": 4156.8},
       {"inc": "GOOGLE", "avg_price": 3099.0},
       {"inc": "MICROSOFT", "avg_price": 6999.0},
       {"inc": "ONEPLUS", "avg_price": 2132.3333333333335},
       {"inc": "VIVO", "avg_price": 2299.0},
       {"inc": "XIAOMI", "avg_price": 2372.3333333333335},
       {"inc": "SAMSUNG", "avg_price": 3149.0},
       {"inc": "OPPO", "avg_price": 2499.0},
       {"inc": "DELL", "avg_price": 8999.0},
       {"inc": "APPLE", "avg_price": 6139.0},
       {"inc": "LENOVO", "avg_price": 7165.666666666667},
   ]
"""


# 1. 按照价格升序排序
sorted_list = sorted(products, key=lambda item: item.get("price"))
# print(sorted_list)

# 2. 按照价格降序排序
sorted_list_reverse = sorted(sorted_list, key=lambda item: item["price"], reverse=True)
# print(sorted_list_reverse)

# 3. 按照库存总额升序排序（库存总额 = 价格 × 库存数量）
sorted_price = sorted(products, key=lambda item: item["price"] * item["stock"])
# print(sorted_price)

# 4. 找出XIAOMI的所有产品，得到一个字符串列表
# filter_apple = filter(lambda item: item["inc"] == "APPLE", products)
# apple_name_iter = map(lambda item: item["name"], filter_apple)

apple_name_iter = map(
    lambda item: item["name"], filter(lambda item: item["inc"] == "APPLE", products)
)
# print(list(apple_name_iter))


# 5. 找出价格最高的产品所属的公司列表（字符串列表）
max_price = max(products, key=lambda item: item["price"])["price"]
res = set(
    map(
        lambda item: item["inc"],
        filter(lambda item: item["price"] == max_price, products),
    )
)
# print(res)


"""
6. 得到每家公司产品的平均价格 结果示例：
    [
       {"inc": "HUAWEI", "avg_price": 4156.8},
       {"inc": "GOOGLE", "avg_price": 3099.0},
       {"inc": "MICROSOFT", "avg_price": 6999.0},
       {"inc": "ONEPLUS", "avg_price": 2132.3333333333335},
       {"inc": "VIVO", "avg_price": 2299.0},
       {"inc": "XIAOMI", "avg_price": 2372.3333333333335},
       {"inc": "SAMSUNG", "avg_price": 3149.0},
       {"inc": "OPPO", "avg_price": 2499.0},
       {"inc": "DELL", "avg_price": 8999.0},
       {"inc": "APPLE", "avg_price": 6139.0},
       {"inc": "LENOVO", "avg_price": 7165.666666666667},
   ]
"""


def avg(inc):
    # 公司所有的产品信息
    inc_product = filter(lambda item: item["inc"] == inc, products)
    inc_prices = list(map(lambda item: item["price"], inc_product))

    return sum(inc_prices) / len(inc_prices)


companies = set(map(lambda item: item["inc"], products))

result = map(lambda inc: {"inc": inc, "avg_price": avg(inc)}, companies)
print(list(result), sep="\n")
