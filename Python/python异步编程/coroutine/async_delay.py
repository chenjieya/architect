import asyncio


def async_delay(duration: int) -> asyncio.Future:
    loop = asyncio.get_event_loop()
    fut = loop.create_future()

    loop.call_later(duration, fut.set_result, None)

    return fut
