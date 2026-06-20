from abc import ABC, abstractmethod

class Sequence(ABC):
    @abstractmethod
    def append(self, item):
        pass

    @abstractmethod
    def get(self, index):
        pass

    @abstractmethod
    def length(self):
        pass

    @abstractmethod
    def __iter__(self):
        pass

    def is_empty(self):
        return self.length() == 0

# 实现 ListSequence（基于 Python 列表）
class ListSequence(Sequence):
    def __init__(self):
        self._list = []

    def append(self, item):
        self._list.append(item)
    
    def get(self, index):
        return self._list[index]
    
    def length(self):
        return len(self._list)
    
    def __iter__(self):
        return iter(self._list)
    



# 使用
list_seq = ListSequence()
list_seq.append(1)
list_seq.append(2)
list_seq.append(3)
print(list_seq.get(1))  # 2
print(list_seq.length())  # 3
print(list(list_seq))  # [1, 2, 3]
# print(list_seq.is_empty())  # False


# 实现 LinkedListSequence（基于链表）