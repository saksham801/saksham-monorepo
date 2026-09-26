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

## Quick check

<div class="chapter-quiz">
  <span class="quiz-kicker">🧪 TEST LAB</span>
  <h3>Green build energy.</h3>
  <p>One last check before shipping your Python code.</p>
  <details>
    <summary>Which command checks formatting without changing files?</summary>
    <p><code>ruff format --check .</code>. Use <code>ruff format .</code> when you want to apply the changes.</p>
  </details>
  <details>
    <summary>Why inject external services into application code?</summary>
    <p>It keeps unit tests fast and deterministic because network and database clients can be replaced with fakes.</p>
  </details>
</div>
