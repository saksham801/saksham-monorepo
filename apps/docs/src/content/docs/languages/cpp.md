---
title: C++
description: A practical C++ path covering modern language fundamentals and safe production patterns.
---

C++ combines low-level control with high-level abstractions. Prefer modern, standard-library-first C++: clear ownership, RAII, value semantics, and small interfaces.

## Learning path

1. Learn expressions, functions, classes, templates, and the standard library.
2. Understand references, const-correctness, object lifetime, and move semantics.
3. Use containers, algorithms, ranges, smart pointers, and error strategies.
4. Build with CMake, test with sanitizers, and enforce formatting and warnings.
5. Separate interfaces from implementation and measure before optimizing.

```cpp
#include <iostream>
#include <string>

int main() {
    const std::string name{"world"};
    std::cout << "hello, " << name << '\n';
}
```

## Modern defaults

- Prefer `std::vector`, `std::string`, and algorithms over raw arrays.
- Use `std::unique_ptr` for exclusive ownership and references for non-owning access.
- Make values `const` by default.
- Enable warnings and sanitizers early.

For exhaustive details, use [cppreference](https://en.cppreference.com/w/) and the [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines).

