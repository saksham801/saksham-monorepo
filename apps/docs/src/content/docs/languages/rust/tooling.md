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

## Quick check

<div class="chapter-quiz">
  <span class="quiz-kicker">🛠️ TOOLCHAIN ARCADE</span>
  <h3>Ship it or skip it?</h3>
  <p>Two tiny questions before your next deploy.</p>
  <details>
    <summary>Which command catches compile errors without producing a binary?</summary>
    <p><code>cargo check</code>. It is faster than a full build and ideal for tight feedback loops.</p>
  </details>
  <details>
    <summary>What should CI do with Clippy warnings?</summary>
    <p>Run Clippy and treat warnings as errors when the project is ready for a strict production gate.</p>
  </details>
</div>
