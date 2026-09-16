---
title: Rust
description: A practical Rust learning path, from ownership to production services.
---

Rust is a compiled systems language focused on speed, memory safety, and fearless concurrency. This section is a practical map of the language and its ecosystem.

## Learning path

1. Install Rust with [rustup](https://rustup.rs/) and create a project with `cargo new app`.
2. Learn expressions, structs, enums, pattern matching, and traits.
3. Practice ownership, borrowing, lifetimes, and error handling.
4. Add modules, tests, documentation, iterators, and async code.
5. Ship with Cargo profiles, clippy, formatting, cross-compilation, and observability.

## First program

```rust
fn main() {
    let name = "world";
    println!("hello, {name}");
}
```

## Core vocabulary

| Concept | Use it for |
| --- | --- |
| `struct` | Data with named fields |
| `enum` | A value with one of several variants |
| `trait` | Shared behaviour and generic constraints |
| `Option<T>` | A value that may be absent |
| `Result<T, E>` | An operation that may fail |
| `Vec<T>` | Growable contiguous collection |

For exhaustive language and standard-library coverage, use the [Rust Book](https://doc.rust-lang.org/book/), [Rust Reference](https://doc.rust-lang.org/reference/), and [standard library docs](https://doc.rust-lang.org/std/).

