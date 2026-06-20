class Animal:
    kingdom = "Animalia"

    def __init__(self, name):
        self.name = name


class Dog(Animal):
    count = 0

    def __init__(self, name, age):
        super().__init__(name)
        self.age = age
        Dog.count += 1

    def bark(self):
        return f"{self.name} says Woof!"


dog1 = Dog("Buddy", 3)
dog2 = Dog("Max", 5)

print(type(dog1))  # <class __main__.Dog>
print(type(Dog))  # <class type>
print(isinstance(dog1, Animal))  # True
print(isinstance(dog1, (int, Dog)))  # True
print(issubclass(Dog, object))  # True
print(dog1.__class__.__name__)  # Dog
print(Dog.__base__.__name__)  # Animal
print(hasattr(dog1, "kingdom"))  # True
print(getattr(dog1, "age"))  # 3
print(getattr(dog2, "color", "brown"))  # brown
setattr(dog1, "color", "golden")
print(dog1.color)  # golden
# dir 返回所有的属性和方法，包括继承来的
print("bark" in dir(dog1))  # True
# 返回当前内容的__dict__
print(vars(dog2))  # { name: "Max", age: 5 }
delattr(dog1, "color")
print(hasattr(dog1, "color"))  # False
print(Dog.count)  # 2
