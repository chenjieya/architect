def calculator():
    total = 0
    while True:
        x = yield total  # yield 返回当前总数，并接收新值
        if x is None:
            break
        total += x


calc = calculator()
print(next(calc))  # 输出: 0 (启动)
print(calc.send(10))  # 输出: 10 (发送10，累加后返回)
print(calc.send(20))  # 输出: 30
print(calc.send(5))  # 输出: 35
