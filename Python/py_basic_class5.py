# 单列模式
class Database:

    _instance = None

    def __new__(cls, *args, **kargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls, *args, **kargs)
        return cls._instance


data1 = Database()
data2 = Database()

print(data1 is data2)
