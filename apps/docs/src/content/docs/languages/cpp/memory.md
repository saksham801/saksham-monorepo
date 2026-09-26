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

## Quick check

<div class="chapter-quiz">
  <span class="quiz-kicker">🧠 MEMORY MODE</span>
  <h3>Spot the lifetime bug.</h3>
  <p>Think first. The answer is hiding behind the disclosure.</p>
  <details>
    <summary>Why is <code>std::make_unique</code> safer than a raw <code>new</code>?</summary>
    <p>It creates the object directly inside an owning smart pointer, making cleanup automatic even when exceptions occur.</p>
  </details>
  <details>
    <summary>What does RAII connect together?</summary>
    <p>An object's lifetime and the lifetime of the resource it manages: acquire in construction, release in destruction.</p>
  </details>
</div>
