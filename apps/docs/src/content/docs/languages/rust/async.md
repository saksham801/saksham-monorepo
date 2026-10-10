---
title: Async Rust
description: Concurrency without data races — async/await, tasks, and channels in Rust.
---

Async Rust gives you fearless concurrency with compile-time memory safety. This is how to use it without the complexity trap.

## The async/await model

`async fn` returns a `Future`, not a value. The runtime polls that future until it completes.

```rust
async fn fetch_data(url: &str) -> Result<String, reqwest::Error> {
    let response = reqwest::get(url).await?;
    response.text().await
}
```

Under the hood, this is a state machine. The compiler converts your async code into a `Future` implementation.

## Runtimes

Rust doesn't include a runtime in the standard library. Choose one:

| Runtime | Use case |
| --- | --- |
| `tokio` | Most common, full-featured |
| `async-std` | Std-like API |
| `smol` | Minimal, executor-agnostic |

Most production code uses Tokio:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

## Spawning tasks

Spawn when you need concurrent work and don't need the result immediately.

```rust
use tokio::task;

async fn process_items(items: Vec<Item>) {
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

Use `task::spawn_blocking` for CPU-bound work:

```rust
let handle = task::spawn_blocking(|| {
    heavy_computation()
});
```

## Channels

Prefer message passing over shared state.

```rust
use tokio::sync::mpsc;

#[tokio::main]
async fn main() {
    let (tx, mut rx) = mpsc::channel(100);

    tokio::spawn(async move {
        for i in 0..10 {
            tx.send(i).await.unwrap();
        }
    });

    while let Some(value) = rx.recv().await {
        println!("got: {}", value);
    }
}
```

## JoinSet for dynamic workloads

When you don't know how many tasks you'll have:

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

## The select! macro

Race multiple futures and handle the first to complete:

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

## Streams

`Stream` is to async what `Iterator` is to sync.

```rust
use futures::StreamExt;

async fn process_stream(stream: impl Stream<Item = Data>) {
    stream
        .map(|data| process(data))
        .buffer_unordered(10)
        .for_each(|result| async {
            match result {
                Ok(output) => save(output).await,
                Err(e) => log_error(e),
            }
        })
        .await;
}
```

## Error handling

Use `?` to propagate errors, but remember async errors are often I/O-related.

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

## Testing async code

Use `tokio::test` for async tests:

```rust
#[tokio::test]
async fn test_async_function() {
    let result = async_function().await;
    assert_eq!(result, expected);
}
```

## Common patterns

### Parallel execution

```rust
let (a, b) = tokio::join!(
    fetch_a(),
    fetch_b()
);
```

### Bounded concurrency

```rust
use futures::stream::{self, StreamExt};

stream::iter(items)
    .map(|item| async move {
        process(item).await
    })
    .buffer_unordered(10)
    .collect::<Vec<_>>()
    .await
```

### Cancellation

Dropping a future cancels it:

```rust
let handle = tokio::spawn(async {
    loop {
        do_work().await;
    }
});

drop(handle); // Cancels the task
```

## When not to use async

- CPU-bound work (use threads or rayon)
- Simple synchronous I/O (use std)
- When you don't need concurrency

Async adds complexity. Use it when the complexity pays for itself in scalability or responsiveness.
