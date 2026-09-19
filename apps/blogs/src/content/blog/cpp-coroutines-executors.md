---
title: "C++20 Coroutines Without Losing Control"
description: "A practical mental model for C++ coroutines: suspension, ownership, cancellation, and the executor decisions hidden behind async syntax."
pubDate: "Sep 19 2026"
topic: "cpp"
tags: ["c++", "coroutines", "async", "c++20", "concurrency"]
---

C++20 coroutines are a language mechanism, not an async runtime. The compiler transforms a coroutine into a state machine, but your return type decides where that state lives, who resumes it, and how errors propagate.

## Suspension is not a thread

`co_await` suspends the current coroutine when its awaiter says the operation is not ready. It does not create a thread and it does not guarantee that execution resumes on another thread. The awaiter or executor owns that policy.

```cpp
task<std::string> read_name(Database& db, UserId id) {
  auto row = co_await db.query("select name from users where id = ?", id);
  if (!row) {
    throw not_found{id};
  }
  co_return row->get<std::string>("name");
}
```

The `task` type is part of the design. A lazy task may not start until awaited; a detached task may run immediately but needs an explicit lifetime and error sink. Avoid a “fire and forget” API unless ownership and failure reporting are obvious.

## Keep coroutine frames alive

Local variables that cross a suspension point live in the coroutine frame. That frame must outlive every asynchronous operation that can resume it. Never capture a reference to a stack object when the operation can outlive the calling scope.

Prefer value captures or shared ownership for state that must survive:

```cpp
task<void> publish(std::shared_ptr<Queue> queue, Message message) {
  co_await queue->send(std::move(message));
}
```

This is not a reason to make everything `shared_ptr`. A clear owner, a value, or a cancellation-aware scope is usually better than an unbounded shared lifetime.

## Cancellation is a contract

Destruction of a task is not automatically cancellation of the socket, timer, or database query it started. Pass a cancellation token through every layer that can block, and make the awaited operation observe it.

Cancellation should be:

1. Prompt enough to release resources.
2. Idempotent so cleanup can run more than once.
3. Visible to the caller instead of being reported as a generic failure.

## Pick an executor explicitly

An executor answers where continuations run and how much work can be in flight. Bound queues, keep blocking calls off event-loop threads, and measure queue depth as well as request latency. Coroutines make asynchronous code look sequential; they do not remove scheduling, backpressure, or shutdown problems.

Use coroutines to express control flow, RAII to own resources, and an explicit runtime to define execution. That combination gives modern C++ async code a model you can reason about.
