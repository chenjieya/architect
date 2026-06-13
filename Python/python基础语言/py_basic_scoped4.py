"""
实现一个函数 `make_multiplier(n)`，返回一个函数。返回的函数接收一个参数 `x`，返回 `n * x`。
要求使用闭包实现，不要使用 `global`。
"""


def make_multiplier(n):

    def test(x):
        return n * x

    return test


triple = make_multiplier(3)
print(triple(5))  # 15
print(triple(10))  # 30

double = make_multiplier(2)
print(double(7))  # 14
