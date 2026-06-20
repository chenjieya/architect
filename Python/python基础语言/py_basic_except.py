"""
6.1 实现安全的除法函数
"""

def safe_divide(a, b):
    """
    安全除法，要求：
    1. 捕获 ZeroDivisionError，返回 0
    2. 捕获 TypeError，打印"参数类型错误"并返回 None
    """
    try:
        return a / b
    except ZeroDivisionError:
        return 0
    except TypeError:
        print("参数类型错误")
        return None




print(safe_divide(10, 2))      # 5.0
print(safe_divide(10, 0))      # 0
print(safe_divide("10", 2))    # 参数类型错误，None


"""
### 6.2 实现重试装饰器
"""

import time

def retry(max_attempts, delay=1):
    """
    失败重试装饰器
    如果函数抛出异常，等待 delay 秒后重试，最多重试 max_attempts 次
    """
    def descrption(func):
        def wrapper(*args, **kargs):
            i = 0
            while i < max_attempts:
                try:
                    return func(*args, **kargs)
                except ConnectionError as c:
                    i += 1
                    if i == max_attempts:
                        return c
                    time.sleep(delay)


        return wrapper

    return descrption

@retry(max_attempts=3, delay=1)
def unstable_function():
    """模拟不稳定的操作"""
    import random
    c = random.random()
    print(c)
    if c < 0.7:  # 70% 概率失败
        raise ConnectionError("连接失败")
    return "成功"

# 应该能处理失败并重试，最终返回"成功"或抛出最后一次异常
# print(unstable_function())


"""
### 6.3 自定义异常与验证
"""
class InsufficientFundsError(Exception):
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

class AccountFrozenError(Exception):
    def __init__(self, *args):
        super().__init__(*args)

class BankAccount:
    def __init__(self, balance=0, frozen=False):
        self.balance = balance
        self.frozen = frozen

    def withdraw(self, amount):
        """
        取款，要求：
        1. 如果 frozen=True，抛出 AccountFrozenError
        2. 如果 amount > balance，抛出 InsufficientFundsError
        3. 如果 amount <= 0，抛出 ValueError
        """
        if self.frozen:
            raise AccountFrozenError("账户已冻结")
        elif amount > self.balance:
            raise InsufficientFundsError("余额不足")
        elif amount <= 0:
            raise ValueError
        self.balance -= amount
        print(self.balance)

    def deposit(self, amount):
        """
        存款，要求：
        4. 如果 frozen=True，抛出 AccountFrozenError
        5. 如果 amount <= 0，抛出 ValueError
        """
        if self.frozen:
            raise AccountFrozenError("账户已冻结, 无法存款")
        elif amount <= 0:
            raise ValueError("存款金额必须大于0")
        self.balance += amount
        print(self.balance)

# 测试
account = BankAccount(100)
account.deposit(50)           # balance = 150
account.withdraw(130)          # balance = 20

# account.withdraw(200)       # InsufficientFundsError
# account.deposit(-10)        # ValueError

frozen_account = BankAccount(100, frozen=True)
# frozen_account.withdraw(10)  # AccountFrozenError



"""
### 6.4 异常转换
实现一个函数，将各种异常转换为统一的 APIException：
"""
import random
class APIException(Exception):
    def __init__(self, code, message):
        self.code = code
        self.message = message
        super().__init__(message)

def call_api():
    """模拟API调用，可能抛出各种异常"""
    errors = [
        ValueError("参数错误"),
        ConnectionError("连接超时"),
        TimeoutError("请求超时"),
        RuntimeError("服务器内部错误")
    ]
    raise random.choice(errors)

def robust_api_call():
    """
    调用 call_api()，将各种异常转换为 APIException：
    - ValueError → APIException(400, "参数错误")
    - ConnectionError/TimeoutError → APIException(503, "服务不可用")
    - 其他异常 → APIException(500, "服务器内部错误")
    """
    try:
        call_api()
    except ValueError as e:
        raise APIException(400, "参数错误") from e
    except (ConnectionError, TimeoutError) as e:
        raise APIException(503, "服务不可用") from e
    except Exception as e:
        raise APIException(500, "服务器内部错误") from e


# 测试
try:
    robust_api_call()
except APIException as e:
    print(f"API 异常 [{e.code}]: {e.message}")