import inspect
from typing import cast

from fastapi import FastAPI

from apps.core.middleware import response, process_time, cors

MIDDLEWARES = [process_time.MIDDLEWARE, cors.MIDDLEWARE, response.MIDDLEWARE]


def register_middleware(app: FastAPI) -> None:
    for callable_obj, kwargs in MIDDLEWARES:
        if inspect.isclass(callable_obj):
            app.add_middleware(cast(type, callable_obj), **kwargs)
        else:
            app.middleware("http")(callable_obj, **kwargs)
