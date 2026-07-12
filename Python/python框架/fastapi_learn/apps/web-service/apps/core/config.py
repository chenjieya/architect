from pydantic_settings import BaseSettings


class WebSettings(BaseSettings):
    title: str = "Python Service API"
    environment: str = "production"

    model_config = {
        "env_file": ".env",  # env文件的位置
        "env_prefix": "WEB_",  # 当前类中的字段使用的前缀
    }


base_settings = WebSettings()
