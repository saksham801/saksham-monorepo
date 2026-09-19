---
title: "Rust Error Handling for Production Services"
description: "Design error types, propagation, and recovery paths that keep Rust services observable without hiding the failures that matter."
pubDate: "Sep 19 2026"
topic: "rust"
tags: ["rust", "error-handling", "thiserror", "anyhow", "reliability"]
---

Rust makes failure part of a function's type, but a `Result<T, E>` alone does not make an error strategy. Production code needs to distinguish an invalid request, a dependency outage, a retryable timeout, and a programmer bug.

## Separate recoverable failures from bugs

Use `Result` for failures the caller can reasonably handle. Use `panic!` only for violated invariants that indicate a programming error. At an application boundary, convert lower-level errors into a small, stable domain vocabulary.

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum UserError {
    #[error("user {0} was not found")]
    NotFound(String),
    #[error("user store is unavailable")]
    Store(#[from] sqlx::Error),
}

pub async fn find_user(id: &str, db: &sqlx::PgPool) -> Result<User, UserError> {
    sqlx::query_as("select id, email from users where id = $1")
        .bind(id)
        .fetch_optional(db)
        .await?
        .ok_or_else(|| UserError::NotFound(id.to_owned()))
}
```

The public error says what the service can do next. The source error remains attached for logs and diagnostics.

## Add context at boundaries

The `?` operator keeps the happy path readable, while `.context(...)` from `anyhow` adds the operation that failed in a binary or one-off service:

```rust
let config = std::fs::read_to_string("service.toml")
    .context("reading service configuration")?;
```

Do not add context that merely repeats the error message. Include identifiers, operation names, and safe metadata that will help someone find the failing request.

## Decide retries deliberately

Retry only transient failures, with a deadline and exponential backoff. Never retry validation errors or a request that is not idempotent unless it carries an idempotency key. A bounded retry loop should preserve the original cause when it gives up.

```rust
for attempt in 0..3 {
    match call_dependency().await {
        Ok(value) => return Ok(value),
        Err(error) if error.is_transient() && attempt < 2 => {
            tokio::time::sleep(backoff(attempt)).await;
        }
        Err(error) => return Err(error.into()),
    }
}
unreachable!("the retry loop returns on every iteration")
```

## Make errors observable

Log errors once at the boundary that owns the request, attach a request or trace ID, and record a metric by stable error class rather than by raw message. Internal sources should be inspectable in structured fields, while client responses should avoid leaking SQL, tokens, or filesystem paths.

Error handling is architecture expressed through types: callers should know which failures are expected, operators should know why they happened, and neither should need to guess.
