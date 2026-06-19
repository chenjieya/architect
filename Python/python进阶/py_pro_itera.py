# 迭代器是返回__next__且该函数返回的也是迭代器， 另外迭代器还需要返回__next__
# 迭代对象是需要返回__next__且该函数返回的是迭代器，由此可知迭代器一定是可迭代对象

class FibonacciIterator:

    def __init__(self):
        self.a = 1
        self.b = 1

    def __next__(self):
        current = self.a
        self.a, self.b = self.b, self.a + self.b
        return current
    
    def __iter__(self):
        return self
    
# fib = FibonacciIterator()

# print(next(fib)) # next()相当于是 fib.__next__()
# print(next(fib)) # next()相当于是 fib.__next__()
# print(next(fib)) # next()相当于是 fib.__next__()
# print(next(fib)) # next()相当于是 fib.__next__()
# print(next(fib)) # next()相当于是 fib.__next__()
# print(next(fib)) # next()相当于是 fib.__next__()
# print(next(fib)) # next()相当于是 fib.__next__()

# 迭代器是没有办法走回头路的，除非重新声明
class MyItera:
    def __iter__(self):
        return FibonacciIterator()
    

iter_obj = MyItera()
fib = iter(iter_obj)  # 相当于 MyItera().__iter__()

print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()


fib = iter(iter_obj)  # 相当于 MyItera().__iter__()

print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()
print(next(fib)) # next()相当于是 fib.__next__()