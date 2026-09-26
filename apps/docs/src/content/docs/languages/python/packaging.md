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

## Quick check

<div class="chapter-quiz">
  <span class="quiz-kicker">📦 PACKAGE QUEST</span>
  <h3>Can your app travel?</h3>
  <p>Reveal the answer and keep your environment reproducible.</p>
  <details>
    <summary>Why use an editable install with <code>-e</code> during development?</summary>
    <p>Changes to the local package are immediately available without reinstalling after every edit.</p>
  </details>
  <details>
    <summary>What should a production service pin?</summary>
    <p>Its dependency versions and interpreter version, so builds remain repeatable across machines.</p>
  </details>
</div>
