function = type(lambda: None)

# type
print("type(type)", type(type))  # <class type>
print("isinstance(type, type)", isinstance(type, type))  # True
print("isinstance(type, function)", isinstance(type, function))  # False
print("isinstance(type, object)", isinstance(type, object))  # True  继承关系
print("\n")

# object
print("type(object)", type(object))  # <class type>
print("isinstance(object, type)", isinstance(object, type))  # True
print("isinstance(object, function)", isinstance(object, function))  # False
print("\n")

# function
print("type(function)", type(function))  # <class type>
print("isinstance(function, object)", isinstance(function, object))  # True
print("isinstance(function, type)", isinstance(function, type))  # True
print("isinstance(function, function)", isinstance(function, function))  # False
print("\n")


# 普通对象和类
class A:
    pass


a = A()
print("type(a)", type(a))  # <class __main__.A>
print("type(A)", type(A))  # <class type>
print("isinstance(A, A)", isinstance(A, A))  # False
print("isinstance(A, object)", isinstance(A, object))  # True
print("isinstance(A, type)", isinstance(A, type))  # True
print("isinstance(A, function)", isinstance(A, function))  # False
print("isinstance(a, A)", isinstance(a, A))  # True
print("isinstance(a, object)", isinstance(a, object))  # True
print("isinstance(a, type)", isinstance(a, type))  # False
print("isinstance(a, function)", isinstance(a, function))  # False
print("\n")


# 普通函数
def func():
    pass


print("type(func)", type(func))  # <class function>
print("isinstance(func, object)", isinstance(func, object))  # True
print("isinstance(func, type)", isinstance(func, type))  # False
print("isinstance(func, function)", isinstance(func, function))  # True
print("\n")
