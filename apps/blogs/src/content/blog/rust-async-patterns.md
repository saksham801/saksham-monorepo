---
title: "Async Rust Without The Spaghetti"
description: "Practical patterns for async code in Rust — from spawning tasks to error handling, without the complexity trap."
pubDate: "Oct 11 2026"
topic: "rust"
tags: ["rust", "async", "concurrency", "patterns"]
---

Async Rust gives you fearless concurrency, but it also gives you new ways to shoot yourself in the foot. Here's how to use it without the pain.

## The async/await mental model

`async fn` returns a `Future`, not a value. The runtime polls that future until it completes. You don't write the runtime; you write the future.

```rust
async fn fetch_data(url: &str) -> Result<String, reqwest::Error> {
    let response = reqwest::get(url).await?;
    response.text().await
}
```

This is sugar for:

```rust
fn fetch_data(url: &str) -> impl Future<Output = Result<String, reqwest::Error>> {
    async move {
        let response = reqwest::get(url).await?;
        response.text().await
    }
}
```

## When to spawn a task

Spawn when you need work to happen concurrently **and** you don't need the result immediately.

```rust
use tokio::task;

async fn process_batch(items: Vec<Item>) {
    let handles: Vec<_> = items
        .into_iter()
        .map(|item| task::spawn(async move {
            process_item(item).await
        }))
        .collect();

    for handle in handles {
        let _ = handle.await;
    }
}
```

Don't spawn when:
- You need the result in the next line (use `await` instead)
- The work is CPU-bound (use `rayon` instead)
- You're already inside a spawned task (you're just adding overhead)

## JoinSet for dynamic workloads

When you don't know how many tasks you'll have until runtime, `JoinSet` is your friend.

```rust
use tokio::task::JoinSet;

async fn process_stream(stream: Stream<Item = Request>) {
    let mut set = JoinSet::new();

    while let Some(request) = stream.next().await {
        set.spawn(async move {
            handle_request(request).await
        });
    }

    while let Some(result) = set.join_next().await {
        match result {
            Ok(response) => log_response(response),
            Err(e) => log_error(e),
        }
    }
}
```

## Error handling across async boundaries

`?` works, but remember that async errors are likely I/O or network-related, not logic bugs.

```rust
async fn service() -> Result<Response, ServiceError> {
    let data = fetch_data()
        .await
        .map_err(ServiceError::Network)?;

    let processed = process(data)
        .await
        .map_err(ServiceError::Processing)?;

    Ok(Response::new(processed))
}
```

Consider using `anyhow` for application code and `thiserror` for library code.

## The select! macro for racing futures

When you need the first of several futures to complete, `tokio::select!` is cleaner than manual polling.

```rust
use tokio::select;

async fn with_timeout() {
    let result = select! {
        _ = tokio::time::sleep(Duration::from_secs(5)) => {
            Err(TimeoutError)
        }
        result = long_operation() => {
            result.map_err(|e| OperationError(e))
        }
    };
}
```

## Channels over shared state

Prefer message passing over `Arc<Mutex<T>>` when possible. Channels force you to think about ownership.

```rust
use tokio::sync::mpsc;

async fn producer(tx: mpsc::Sender<Item>) {
    for item in items {
        if tx.send(item).await.is_err() {
            break; // Receiver dropped
        }
    }
}

async fn consumer(mut rx: mpsc::Receiver<Item>) {
    while let Some(item) = rx.recv().await {
        process(item).await;
    }
}
```

## Pinning and streams

You don't need to understand `Pin` deeply to use async Rust, but you do need to know that `Stream` is to async what `Iterator` is to sync.

```rust
use futures::StreamExt;

async fn process_stream(stream: impl Stream<Item = Data>) {
    stream
        .map(|data| process(data))
        .buffer_unordered(10) // Process up to 10 concurrently
        .for_each(|result| async {
            match result {
                Ok(output) => save(output).await,
                Err(e) => log_error(e),
            }
        })
        .await;
}
```

## Habits that help

- Use `tokio::spawn` for fire-and-forget work, `await` for sequential work
- Prefer structured concurrency (scopes, join sets) over manual task management
- Let the runtime handle scheduling — don't manually sleep or yield
- Use channels to communicate, shared state only when you have to

Async Rust is complex, but that complexity is the price of memory-safe concurrency. Pay it once, use it everywhere.
