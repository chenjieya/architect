from pydantic import BaseModel, Field


class PromptContext(BaseModel):
    system_prompt: str = Field(description="系统提示词", default="")

