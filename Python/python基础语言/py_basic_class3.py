"""
请实现一个单链表类 `LinkedList`，支持以下操作：

**需要实现的方法：**

| 方法                     | 说明                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `__init__(data=None)`    | 初始化空链表；`data` 可以是列表、元组或集合，其中的值会被初始化为链表的节点 |
| `traverse(callback)`     | 遍历链表，对每个节点值调用 `callback(index, value)`                         |
| `__str__()`              | 返回链表的字符串表示，如 `"1 -> 2 -> 3"`                                    |
| `to_list()`              | 将链表转换为 Python 列表并返回                                              |
| `append(value)`          | 在链表尾部添加一个新节点                                                    |
| `prepend(value)`         | 在链表头部添加一个新节点                                                    |
| `insert(index, value)`   | 在指定索引位置插入新节点，索引从 0 开始                                     |
| `delete_by_value(value)` | 删除第一个值等于 `value` 的节点，返回是否删除成功                           |
| `delete_by_index(index)` | 删除指定索引位置的节点，返回被删除的值，索引越界时返回 `None`               |
| `find(value)`            | 查找值等于 `value` 的节点，返回其索引，不存在返回 -1                        |
| `get(index)`             | 获取指定索引位置的值，索引越界时返回 `None`                                 |
| `get_length()`           | 返回链表长度                                                                |
| `is_empty()`             | 判断链表是否为空                                                            |

**提示：** 你可能需要先定义一个 `Node` 类来表示链表节点。
"""


class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


class LinkedList:
    def __init__(self, data=None):
        if data is None or len(data) == 0:
            return

        self.head = None
        for val in data:
            self.append(val)

    def append(self, val):
        # 在链表的尾部添加一个新的节点

        new_node = Node(val)

        if self.head is None:
            self.head = new_node
        else:
            current = self.head

            while current.next is not None:
                current = current.next
            current.next = new_node

    def prepend(self, value):
        new_node = Node(value)

        new_node.next = self.head
        self.head = new_node

    def insert(self, index, value):
        new_node = Node(value)
        current = self.head
        num = 0

        while current.next is not None:
            if num == index:
                after_node = current.next
                current.next = new_node
                new_node.next = after_node
                break
            current = current.next
            num += 1
        # 不在范围内的数字，统一按照修改最后一个索引vlaue
        current.next = new_node

    def traverse(self, callback):
        # 遍历链表，对每个节点值调用 callback(index, value)
        current = self.head
        index = 0
        while current.next is not None:
            callback(index, current.value)
            current = current.next
            index += 1

        callback(index, current.value)

    def to_list(self):
        result = []
        current = self.head

        while current.next is not None:
            result.append(current.value)
            current = current.next
        result.append(current.value)
        return result

    def __str__(self):
        # 返回链表的字符串表示，如 "1 -> 2 -> 3"
        result = self.to_list()
        return " -> ".join(str(value) for value in result)


a = LinkedList([1, 2, 3])
# print(a)
# print(a.to_list())

# a.insert(0, 3)

print(a)


def callback(index, value):
    print(index, value)


a.traverse(callback)
