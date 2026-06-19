"""
编写一个生成器函数 `flatten`，将嵌套的列表扁平化：
"""

def flatten(nested_list):
    for row in nested_list:
        if isinstance(row, list):
            yield from flatten(row)
        else:
            yield row




nested = [1, [2, [3, 4], 5], 6, [7, 8]]
print(list(flatten(nested))) # [1, 2, 3, 4, 5, 6, 7, 8]


"""
编写一个生成器，模拟从数据库分页读取数据：
"""
def paginated_query(total_items, page_size):
    """
    模拟分页查询
    total_items: 总数据量
    page_size: 每页大小
    每次 yield 返回一页数据（列表）
    """
    for start in range(0, total_items, page_size):
        end = min(start + page_size, total_items)
        yield list(range(start, end))


for page in paginated_query(25, 10):
    print(page)
# [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
# [10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
# [20, 21, 22, 23, 24]




def generator():
    print("准备 yield 1")
    yield 1
    print("准备 yield 2")
    yield 2
    print("准备 yield 3")
    yield 3
    print("生成器结束")


g = generator()
print("生成器已创建")
print(next(g))
print("---")
print(next(g))
print("---")
g.close()
print("生成器已关闭")
print(next(g))
"""
生成器已创建
准备yield1
1
---
准备yield2
2
---
生成器已关闭
报错
"""