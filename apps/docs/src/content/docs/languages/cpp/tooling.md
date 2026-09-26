---
title: C++ tooling
description: A reliable CMake, compiler, and test workflow.
---

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Debug
cmake --build build --parallel
ctest --test-dir build --output-on-failure
cmake --build build --config Release
```

Use a pinned compiler toolchain, compile with high warnings (`-Wall -Wextra -Wpedantic` for GCC and Clang), run sanitizers in a separate configuration, and export `compile_commands.json` for editor tooling. Keep third-party dependencies reproducible with a lock or package manager manifest.

## Quick check

<div class="chapter-quiz">
  <span class="quiz-kicker">🔧 BUILD ROOM</span>
  <h3>Ready for the red build?</h3>
  <p>Open the answer only after you make your call.</p>
  <details>
    <summary>Which command runs tests through CTest?</summary>
    <p><code>ctest --test-dir build --output-on-failure</code>. The failure output makes CI debugging much less mysterious.</p>
  </details>
  <details>
    <summary>Which sanitizer helps find out-of-bounds memory access?</summary>
    <p>AddressSanitizer, commonly enabled with <code>-fsanitize=address</code>.</p>
  </details>
</div>
