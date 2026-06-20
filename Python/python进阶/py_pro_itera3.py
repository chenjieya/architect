# 推导

# 列表推导式
li = []
for num in range(5):
    li.append(num**2)

print(li) # [0, 1, 4, 9, 16]

# 等效于
lis = [x**2 for x in range(5)]
# print(lis) # [0, 1, 4, 9, 16]


# 过滤掉偶数
lis = [x for x in range(5) if x % 2 == 0]
# print(lis) # [0, 2, 4]

# 返回“偶数” “奇数”
lis = [{"val": x, "type": "偶数"} if x % 2 == 0 else {"val": x, "type": "奇数"} for x in range(5) if x != 0]
# print(lis)  # [{'val': 1, 'type': '奇数'}, {'val': 2, 'type': '偶数'}, {'val': 3, 'type': '奇数'}, {'val': 4, 'type': '偶数'}]



# 注意⚠️：元祖不能进行推到

# 嵌套推导
matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

lis = [x for row in matrix for x in row]
print(lis) # [1, 2, 3, 4, 5, 6, 7, 8, 9]



# 生成器(其实就是一个迭代器)
def myGenerator():
    print("开始")
    yield 1
    print("继续")
    yield 2
    print("结束")
    yield 3


test = myGenerator() # 函数并不会进行执行

print(next(test))
print(next(test))
print(next(test))
# print(next(test))


# 链式生成器
def sub_generator():
    yield 1
    yield 2


def main_generator():
    yield "开始"
    for value in sub_generator():
        yield value
    yield "结束"


for value in main_generator():
    print(value)
# 开始
# 1
# 2
# 结束

# 样式模版 简单写法
def main_generator():
    yield "开始"
    yield from sub_generator()
    yield "结束"
for value in main_generator():
    print(value)



# 生成器表达式
# 生成器表达式 —— 惰性计算，节省内存
squares_gen = (x**2 for x in range(1000000))

print(type(squares_gen))   # <class 'generator'>

# 按需获取值
print(next(squares_gen))   # 0
print(next(squares_gen))   # 1
print(next(squares_gen))   # 4