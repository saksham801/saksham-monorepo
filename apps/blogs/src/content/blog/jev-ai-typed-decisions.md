---
title: "Jev AI: Decisions at Machine Speed"
description: "How Jev's System One model replaces chatty LLMs with typed, probabilistic decisions in 70-500ms."
pubDate: "Oct 11 2026"
topic: "ai"
tags: ["ai", "jev", "machine-learning", "decisions", "type-safe"]
---

Most AI use cases don't need a chatbot. They need a decision. Jev is the first System One model — built for machines, not conversations.

## What makes Jev different

Traditional LLMs generate text token by token. Jev evaluates state and returns structured decisions in a single round trip.

| Feature | Traditional LLM | Jev |
| --- | --- | --- |
| Latency | 3-30 seconds | 70-500ms |
| Output | Free-form text | Type-safe values |
| Hallucinations | Possible | Impossible |
| Confidence | Inconsistent | Calibrated |
| Type errors | Possible | Mathematically impossible |

## Three decision primitives

Jev returns one of three typed structures:

### Choice
Select from up to 255 options with calibrated probabilities.

```typescript
const response = await jev.decide({
  state: "User message: 'I need help with billing'",
  questions: [{
    id: "intent",
    choice: {
      options: ["billing", "technical", "sales", "general"],
      instruction: "Select the primary intent"
    }
  }]
});

// Returns: { choice: "billing", probabilities: {...}, confidence: 0.92 }
```

### Score
Evaluate on a 2-10 scale with expected value and per-level probabilities.

```typescript
const response = await jev.decide({
  state: "Customer feedback: 'The product is okay but slow'",
  questions: [{
    id: "satisfaction",
    score: {
      levels: 10,
      instruction: "Rate overall satisfaction"
    }
  }]
});

// Returns: { score: 6.2, probabilities: {...}, legend: {...}, confidence: 0.78 }
```

### Noul
Binary yes/no with a single probability.

```typescript
const response = await jev.decide({
  state: "File upload: executable.exe",
  questions: [{
    id: "malicious",
    noul: {
      instruction: "Is this file likely malicious?"
    }
  }]
});

// Returns: { noul: 0.87 } // 87% probability of yes
```

## Where Jev fits

Jev isn't for content generation. It's for the small, fast decisions that happen millions of times:

- **Routing**: Send requests to the right team or service
- **Scoring**: Evaluate urgency, risk, or quality
- **Guardrails**: Check conditions before sensitive operations
- **Classification**: Label documents, tickets, or events

## The probability advantage

Every Jev response ships with a calibrated probability. High confidence means high accuracy, consistently.

```typescript
if (response.confidence > 0.9) {
  // Auto-execute — 90%+ chance it's right
  executeDecision(response);
} else if (response.confidence > 0.7) {
  // Log and proceed with human oversight
  executeWithMonitoring(response);
} else {
  // Escalate to human review
  escalateToHuman(response);
}
```

## Integration patterns

### Routing layer

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

### Risk scoring

```typescript
async function checkRisk(input: string) {
  const decision = await jev.decide({
    state: input,
    questions: [{
      id: "risk",
      score: {
        levels: 5,
        instruction: "Rate risk level from 1 (safe) to 5 (dangerous)"
      }
    }]
  });

  if (decision.score > 3) {
    requireApproval(input);
  }
}
```

### Conditional automation

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
  } else {
    ticket.escalate();
  }
}
```

## Pricing and limits

- **Input**: $0.042 per million tokens
- **Output**: Free
- **Context**: 64k tokens
- **Options per choice**: Up to 255
- **Score levels**: 2-10

Jev is faster and cheaper for structured decisions because it doesn't generate text. It evaluates and returns.

## Getting started

1. Get an API key from [jevtypesafeai.com](https://jevtypesafeai.com/)
2. Install the SDK: `npm install @typesafe/jev`
3. Make your first decision

```typescript
import { Jev } from '@typesafe/jev';

const jev = new Jev({ apiKey: process.env.JEV_API_KEY });

const result = await jev.decide({
  state: "Your application state here",
  questions: [{
    id: "decision-id",
    choice: {
      options: ["option-a", "option-b"],
      instruction: "What should we do?"
    }
  }]
});
```

## When to use Jev

Use Jev when:
- You need a decision, not a conversation
- Latency matters (70-500ms)
- You want type-safe, structured output
- You need calibrated probabilities
- You're doing high-volume decisions

Don't use Jev when:
- You need text generation
- You need reasoning steps visible
- You're doing content creation
- You need creative output

Jev is a decision engine. Use it where decisions matter, speed matters, and reliability matters.
