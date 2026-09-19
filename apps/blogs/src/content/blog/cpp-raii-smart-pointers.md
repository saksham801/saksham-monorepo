---
title: "Modern C++ Ownership with RAII and Smart Pointers"
description: "How RAII, unique_ptr, and shared_ptr keep C++ resource management predictable without sacrificing performance."
pubDate: "Sep 12 2026"
topic: "cpp"
tags: ["c++", "raii", "smart-pointers", "memory"]
---

Resource mismanagement is still one of the most expensive classes of bugs in native code. Modern C++ gives you a clear model: **bind every resource to an object's lifetime**.

## RAII in one sentence

When construction acquires a resource, destruction must release it — automatically, even during stack unwinding.

```cpp
class FileHandle {
public:
  explicit FileHandle(const char* path) : handle_(std::fopen(path, "rb")) {
    if (!handle_) throw std::runtime_error("open failed");
  }
  ~FileHandle() {
    if (handle_) std::fclose(handle_);
  }
  FileHandle(const FileHandle&) = delete;
  FileHandle& operator=(const FileHandle&) = delete;
private:
  FILE* handle_;
};
```

## Prefer `unique_ptr` by default

`std::unique_ptr` expresses exclusive ownership and zero runtime cost beyond the pointer itself.

```cpp
auto buffer = std::make_unique<std::array<std::byte, 4096>>();
process(*buffer);
```

Reach for `std::shared_ptr` only when ownership must be shared across asynchronous or multi-owner graphs. Shared ownership is a design choice, not a default.

## Practical rules

1. No naked `new` / `delete` in application code.
2. Prefer values and `unique_ptr` over `shared_ptr`.
3. Make copy/move intent explicit with `= delete`, `= default`, or custom special members.
4. Treat raw pointers as non-owning views.

RAII is not ceremony — it is how C++ turns lifetimes into compiler-checked contracts.
