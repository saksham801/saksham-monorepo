---
title: Ownership and borrowing
description: The rules that make Rust memory-safe without a garbage collector.
---

Every value in Rust has one owner. When the owner leaves scope, the value is dropped. Assigning a non-`Copy` value moves it:

```rust
let original = String::from("hello");
let moved = original;
// original is no longer usable here.
```

Borrow instead of moving when a function only needs to inspect data:

```rust
fn length(value: &str) -> usize {
    value.len()
}

let message = String::from("hello");
assert_eq!(length(&message), 5);
```

## Borrowing rules

- Any number of immutable references, or one mutable reference.
- References must always be valid.
- Keep borrows as short as possible.

These rules make data races impossible in safe code. When the compiler rejects a borrow, first reduce the lifetime of the reference or move the operation into a smaller scope instead of reaching for a clone.

