"""
实现一个函数 `create_account(initial_balance)`，返回两个字典：

- `deposit(amount)`: 存款，返回新余额
- `withdraw(amount)`: 取款，余额不足返回 `"余额不足"`，否则返回新余额

要求使用闭包保存余额状态，不要暴露余额变量。
"""


def create_account(initial_balance):

    balance = initial_balance

    def deposit(amount):

        nonlocal balance
        balance += amount
        return balance

    def withdraw(amount):
        nonlocal balance
        balance -= amount

        if balance < 0:
            return "余额不足"
        return balance

    return deposit, withdraw


deposit, withdraw = create_account(100)
print(deposit(50))  # 150
print(withdraw(30))  # 120
print(withdraw(200))  # 余额不足
