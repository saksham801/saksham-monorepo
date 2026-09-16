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

