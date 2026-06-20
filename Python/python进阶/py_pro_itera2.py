# python中的容器类型都是可迭代对象
my_list = [1,2,3,4,5]
print(hasattr(my_list, "__iter__")) # True
print(hasattr(my_list, "__next__")) # False
# 他是一个可迭代对象

# li = iter(my_list)
# print(next(li))
# print(next(li))
# print(next(li))
# print(next(li))
# print(next(li))
# print(next(li))
# print(next(li))



# 倒数对象
class CountdownIterator:
    """迭代器"""
    def __init__(self, start_num):
        self.start_num = start_num

    def __iter__(self):
        return self

    def __next__(self):
        num = self.start_num
        if num < 0:
            raise StopIteration
        self.start_num -= 1
        return num


class Countdown:
    """可迭代对象"""

    def __init__(self, start_num):
        self.start_num = start_num

    def __iter__(self):
        return CountdownIterator(self.start_num)


# 可迭代对象
cd = Countdown(5)

iterator = iter(cd)
print(next(iterator))  # 5
print(next(iterator))  # 4
print(next(iterator))  # 3
print(next(iterator))  # 2
print(next(iterator))  # 1
print(next(iterator))  # 0
# print(next(iterator))  # StopIteration!