---
title: C++ memory and lifetime
description: RAII, ownership, references, and avoiding undefined behaviour.
---

Resource Acquisition Is Initialization (RAII) ties a resource's lifetime to an object. Constructors acquire; destructors release:

```cpp
class File {
public:
    explicit File(const char* path);
    ~File(); // closes the handle
    File(const File&) = delete;
    File& operator=(const File&) = delete;
};
```

Prefer the rule of zero: compose types that already manage resources instead of writing special member functions. Use `std::make_unique` and `std::make_shared` when dynamic ownership is required.

Treat raw pointers as observers unless an API explicitly documents ownership. Never return a reference or pointer to a local variable, and run AddressSanitizer and UndefinedBehaviorSanitizer in CI.

