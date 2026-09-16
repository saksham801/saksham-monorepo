---
title: Python tooling
description: Formatting, testing, typing, and operational checks for Python.
---

```bash
python -m pytest
ruff check .
ruff format --check .
mypy .
python -m build
```

Use structured logging, never log secrets, and validate untrusted input before it reaches business logic. Prefer dependency injection for external services so unit tests can run without a network or database.
