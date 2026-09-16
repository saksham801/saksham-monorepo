---
title: Python packaging
description: Reproducible environments, modules, and application entry points.
---

Start each application with an isolated environment:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
```

A modern project should declare metadata and dependencies in `pyproject.toml`. Keep application code in a package, expose a small entry point, and avoid relying on the current working directory for imports or configuration.

For libraries, define a stable public API and build wheels. For services, pin production dependencies, record the interpreter version, and make configuration explicit through environment variables or a typed settings object.

