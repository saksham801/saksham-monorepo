---
title: Python
description: A practical Python path for scripts, services, and maintainable applications.
---

Python is a readable, high-level language with a large standard library and ecosystem. This section focuses on maintainable Python 3 applications.

## Learning path

1. Learn values, control flow, functions, modules, and exceptions.
2. Use collections, comprehensions, iterators, generators, and context managers.
3. Add type hints, tests, logging, configuration, and packaging.
4. Build services with explicit boundaries and validated inputs.
5. Profile before optimizing and understand the runtime's concurrency models.

```python
def greeting(name: str) -> str:
    return f"hello, {name}"


if __name__ == "__main__":
    print(greeting("world"))
```

## Production defaults

- Create an isolated environment with `python -m venv .venv`.
- Pin dependencies and separate development dependencies.
- Format with Ruff, type-check with mypy or basedpyright, and test with pytest.
- Raise specific exceptions and add context at application boundaries.

Use the [Python documentation](https://docs.python.org/3/) for the complete language and standard-library reference.

## Quick check

<div class="chapter-quiz">
  <span class="quiz-kicker">🐍 CHECKPOINT / PYTHON</span>
  <h3>Python power-up round.</h3>
  <p>Two quick wins before you close this chapter.</p>
  <details>
    <summary>What creates an isolated Python environment?</summary>
    <p><code>python -m venv .venv</code>. It keeps project dependencies separate from the system interpreter.</p>
  </details>
  <details>
    <summary>Where should application dependencies be declared?</summary>
    <p>In <code>pyproject.toml</code>, so tools and deployment systems have one explicit source of truth.</p>
  </details>
</div>
