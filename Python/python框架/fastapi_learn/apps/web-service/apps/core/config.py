from pydantic_settings import BaseSettings


class _CommonConfig(BaseSettings):
    """
    extra允许额外的字段，当我使用baseconfig的时候，他会读取env校验environment字段
    但是当我使用webconfig的时候，他也会读取env文件，校验env里面的其他字段，这个时候webconfig没有这些默认值配置
    所以要忽略这些额外字段
    """

    model_config = {"env_file": ".env", "extra": "ignore"}


# 通用基础配置
class _BaseConfig(_CommonConfig):
    environment: str = "production"


# web相关配置
class _WebConfig(_CommonConfig):
    title: str = "Python Service API"

    model_config = {
        "env_prefix": "WEB_",  # 配置会和父类的model_config一起合并（按道理讲是会按照子类的配置进行，但是框架自定义了元类，做了一些操作让他们进行合并）
    }


# 数据库相关配置
class _DbConfig(_CommonConfig):
    user: str = ""
    password: str = ""
    ip: str = ""
    port: str = ""
    name: str = ""

    model_config = {"env_prefix": "DB_"}


base_config = _BaseConfig()
web_config = _WebConfig()
db_config = _DbConfig()
