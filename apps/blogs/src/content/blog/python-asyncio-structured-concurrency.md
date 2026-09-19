---
title: "Python Asyncio: Structured Concurrency That Scales"
description: "Write clearer concurrent Python with asyncio tasks, timeouts, and TaskGroup — without turning your codebase into callback soup."
pubDate: "Sep 18 2026"
topic: "python"
tags: ["python", "asyncio", "concurrency", "backend"]
---

`asyncio` is powerful, but unstructured `create_task` calls can leak work and swallow errors. Prefer **structured concurrency**: start work in a scope, wait for it, and cancel cleanly when the scope exits.

## A focused example

```python
import asyncio
import aiohttp

async def fetch_json(session: aiohttp.ClientSession, url: str) -> dict:
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
        response.raise_for_status()
        return await response.json()

async def load_dashboard(urls: list[str]) -> list[dict]:
    async with aiohttp.ClientSession() as session:
        async with asyncio.TaskGroup() as group:
            tasks = [group.create_task(fetch_json(session, url)) for url in urls]
        return [task.result() for task in tasks]

async def main() -> None:
    data = await load_dashboard([
        "https://httpbin.org/json",
        "https://httpbin.org/uuid",
    ])
    print(f"loaded {len(data)} payloads")

if __name__ == "__main__":
    asyncio.run(main())
```

## Why `TaskGroup` matters

If one task fails, the group cancels siblings and raises an exception group. That is usually what you want for request fan-out: fail fast, free resources, and surface the root cause.

## Practical guidelines

1. Never block the event loop with heavy CPU work — offload to processes or threads.
2. Always set timeouts on network calls.
3. Keep coroutine functions small and typed.
4. Log cancellation and cleanup paths; they are part of production behavior.

Async Python shines when I/O waits dominate. Structure the waiting, and the rest of the system stays readable.
