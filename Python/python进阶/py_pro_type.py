from typing import Literal, TypeVar, Generic, Optional, Dict, TypedDict, Optional
def calculate_bmi(weight: float, height: float) -> float:
    """计算 BMI 指数"""
    if height <= 0:
        raise ValueError("身高必须大于0")
    return weight / (height ** 2)


def get_grade(score: float) -> Literal["A", "B", "C", "D", "F"]:
    """根据分数返回等级"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"
    



K = TypeVar("K")
V = TypeVar("V")


class Cache(Generic[K, V]):
    """泛型缓存类"""

    def __init__(self) -> None:
        self._data: Dict[K, V] = {}
    
    def set(self, key: K, value: V) -> None:
        """设置缓存"""
        self._data[key] = value
    
    def get(self, key: K) -> Optional[V]:
        """获取缓存，不存在返回 None"""
        return self._data.get(key)
    
    def clear(self) -> None:
        """清空缓存"""
        self._data.clear()


# 测试
cache: Cache[str, int] = Cache()
cache.set("a", 1)
cache.set("b", 2)
print(cache.get("a"))   # 1
print(cache.get("c"))   # None
cache.clear()





class DatabaseConfig(TypedDict):
    """数据库配置"""
    host: str
    port: int
    username: str
    password: str
    database: str


class AppConfig(TypedDict):
    """应用配置"""
    app_name: str
    debug: bool
    db: DatabaseConfig


def load_config() -> AppConfig:
    """加载默认配置"""
    return {
        "app_name": "MyApp",
        "debug": False,
        "db": {
            "host": "localhost",
            "port": 5432,
            "username": "admin",
            "password": "secret",
            "database": "mydb",
        }
    }


# 测试
config = load_config()
print(config["app_name"])           # MyApp
print(config["db"]["host"])         # localhost
print(config["db"]["port"])         # 5432