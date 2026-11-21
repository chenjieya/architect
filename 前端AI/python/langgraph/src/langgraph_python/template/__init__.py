from pathlib import Path
from typing import Dict, Any
from langchain_core.utils.mustache import render


def prompt(template: str, data: Dict[str, Any]):
    return render(template, data)


def prompt_from_filename(filename: str, data: Dict[str, Any]):
    template_path = Path(__file__).parent / f"{filename}.mst"
    template = template_path.read_text()
    return prompt(template, data)
