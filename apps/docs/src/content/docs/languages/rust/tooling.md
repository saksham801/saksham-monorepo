---
title: Rust tooling
description: Cargo commands and production defaults for Rust projects.
---

```bash
cargo new service
cargo check
cargo test
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
```

Keep dependencies in `Cargo.toml`, commit `Cargo.lock` for applications, and use workspaces when several crates share a repository. Prefer `Result` propagation with `?`, explicit error context, and integration tests for public behaviour.

Useful ecosystem tools include `rust-analyzer`, `cargo-nextest`, `cargo-audit`, and `cargo-deny`. Review their output in CI rather than relying only on local checks.

