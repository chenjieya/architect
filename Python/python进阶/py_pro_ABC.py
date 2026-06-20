"""
编写一个抽象基类 `Cache`，定义缓存的基本接口，然后实现 `MemoryCache` 和 `FileCache`：
"""
from abc import ABC, abstractmethod
import os
import json

class Cache(ABC):
    @abstractmethod
    def get(self, key):
        pass

    @abstractmethod
    def set(self, key, value):
        pass

    @abstractmethod
    def delete(self, key):
        pass

# 实现 MemoryCache（使用字典存储）
class MemoryCache(Cache):

    def __init__(self):
        self._cache = {}

    def get(self, key):
        return self._cache.get(key)
    
    def set(self, key, value):
        self._cache[key] = value
        return self._cache
    
    def delete(self, key):
        if key in self._cache:
            del self._cache[key]
            return True
        return False
    
# 使用
memory_cache = MemoryCache()
memory_cache.set("name", "Alice")
print(memory_cache.get("name"))  # Alice
memory_cache.delete("name")
print(memory_cache.get("name"))  # None


    

# 实现 FileCache（使用文件存储）
class FileCache(Cache):

    def __init__(self, directory = 'cache'):
        self._directory = directory
        os.makedirs(directory, exist_ok=True)

    def _get_path(self, key):
        return os.path.join(self._directory, f"{key}.json")

    def get(self, key):
        path = self._get_path(key)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return None
    
    def set(self, key, value):
        path = self._get_path(key)
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(value, f)

    
    def delete(self, key):
        path = self._get_path(key)
        if os.path.exists(path):
            os.remove(path)

file_cache = FileCache()
file_cache.set("name", "Bob")
print(file_cache.get("name"))  # Bob
file_cache.delete("name")
print(file_cache.get("name"))  # None