---
title: Jev AI
description: Type-safe probabilistic decisions at machine speed with the Jev System One model.
---

Jev is TypeSafe's System One model — it reads text and returns typed decisions. No text generation, no hallucinations, just calibrated answers in 70-500ms.

## What Jev returns

Jev doesn't write replies, code, or explanations. It returns one of three typed structures:

### Choice

Select from up to 255 options with probabilities.

```typescript
{
  choice: "billing",
  probabilities: {
    "billing": 0.92,
    "technical": 0.05,
    "sales": 0.02,
    "general": 0.01
  },
  confidence: 0.92
}
```

### Score

Evaluate on a 2-10 scale with expected value.

```typescript
{
  score: 6.2,
  probabilities: {
    "1": 0.05,
    "2": 0.10,
    "3": 0.15,
    "4": 0.20,
    "5": 0.20,
    "6": 0.15,
    "7": 0.10,
    "8": 0.03,
    "9": 0.01,
    "10": 0.01
  },
  legend: { "1": "very poor", "10": "excellent" },
  confidence: 0.78
}
```

### Noul

Binary yes/no with a single probability.

```typescript
{
  noul: 0.87
}
```

## Limits and pricing

| Property | Value |
| --- | --- |
| Input price | $0.042 per million tokens |
| Output price | Free |
| Context window | 64k tokens |
| Choice options | Up to 255 |
| Score levels | 2-10 |
| Latency | 70-500ms |

## API usage

### Installation

```bash
npm install @typesafe/jev
```

### Basic usage

```typescript
import { Jev } from '@typesafe/jev';

const jev = new Jev({ apiKey: process.env.JEV_API_KEY });

const result = await jev.decide({
  state: "User message: 'I need help with billing'",
  questions: [{
    id: "intent",
    choice: {
      options: ["billing", "technical", "sales", "general"],
      instruction: "Select the primary intent"
    }
  }]
});
```

### Multiple questions

Ask multiple questions in a single request:

```typescript
const result = await jev.decide({
  state: document,
  questions: [
    {
      id: "category",
      choice: {
        options: ["invoice", "contract", "email", "other"],
        instruction: "What type of document is this?"
      }
    },
    {
      id: "urgency",
      score: {
        levels: 5,
        instruction: "Rate urgency from 1 (low) to 5 (critical)"
      }
    },
    {
      id: "needs-review",
      noul: {
        instruction: "Does this document need human review?"
      }
    }
  ]
});
```

## Integration patterns

### Request routing

```typescript
async function routeRequest(request: Request) {
  const decision = await jev.decide({
    state: request.body,
    questions: [{
      id: "route",
      choice: {
        options: ["support", "sales", "engineering"],
        instruction: "Where should this request go?"
      }
    }]
  });

  return services[decision.choice].handle(request);
}
```

### Risk-based automation

```typescript
async function processPayment(amount: number, context: string) {
  const decision = await jev.decide({
    state: context,
    questions: [{
      id: "risk",
      score: {
        levels: 5,
        instruction: "Rate fraud risk from 1 (safe) to 5 (dangerous)"
      }
    }]
  });

  if (decision.score > 3) {
    return requireManualReview(amount, context);
  }

  return processPayment(amount);
}
```

### Conditional approval

```typescript
async function autoApprove(ticket: Ticket) {
  const decision = await jev.decide({
    state: ticket.description,
    questions: [{
      id: "approve",
      noul: {
        instruction: "Should this be auto-approved?"
      }
    }]
  });

  if (decision.noul > 0.85) {
    ticket.approve();
  } else if (decision.noul > 0.5) {
    ticket.flagForReview();
  } else {
    ticket.reject();
  }
}
```

## Best practices

### State construction

Include relevant context without including secrets:

```typescript
const state = `
  User: ${user.name}
  Account type: ${user.tier}
  Request: ${request.description}
  History: ${user.historyCount} previous requests
`;
```

### Question design

Be specific about what you want:

```typescript
// Good
instruction: "Select the department that handles this issue"

// Bad
instruction: "Where should this go?"
```

### Probability thresholds

Use confidence to gate automation:

```typescript
if (response.confidence > 0.9) {
  // Auto-execute
} else if (response.confidence > 0.7) {
  // Execute with monitoring
} else {
  // Escalate to human
}
```

### Error handling

```typescript
try {
  const result = await jev.decide(request);
  // Handle result
} catch (error) {
  if (error instanceof JevApiError) {
    // API error — retry or fallback
  } else {
    // Other error
  }
}
```

## When to use Jev

**Use Jev when:**
- You need a decision, not a conversation
- Latency matters (70-500ms)
- You want type-safe, structured output
- You need calibrated probabilities
- You're doing high-volume decisions

**Don't use Jev when:**
- You need text generation
- You need reasoning steps visible
- You're doing content creation
- You need creative output

## Getting an API key

Visit [jevtypesafe.ai](https://jevtypesafe.ai/) to get an API key. You can also use:

- Vercel AI Gateway
- OpenRouter
- Instant hosted key from TypeSafe

## Learn more

- [Official docs](https://docs.typesafe.ai/)
- [Playground](https://jevai.me/)
- [GitHub](https://github.com/typesafeai/jev)
