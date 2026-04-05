# TokenBase

Universal base models for the Token ecosystem.

Composable primitives that form the foundation for TokenRemote, TokenSports, CashierFu, and any application built on the Token stack. TokenBase is an application construction system — AI agents and developers use these models to build apps from the ground up.

## Install

```bash
npm install @cruba/core
```

## Usage

```typescript
import { Entity, Group, View, Filter, Sort, Style } from '@cruba/core'
```

All base models, traits, and compound models are exported from the package root.

## What's Included

- **39 base models** — irreducible primitives (Entity, Context, Group, Scope, Function, View, Queue, Filter, Sort, Log, Bandwidth, DesignChoice, BugPattern, RuleOutcome, Unifier, etc.)
- **27 traits** — composable interfaces (Nameable, Statusable, Chargeable, Expirable, Locatable, Typeable, etc.)
- **8 compound models** — domain-specific compositions (Business, Order, Product, Till, etc.)
- **utils/** — UUID generation, date strings

## Model Categories

| Category | Models |
|---|---|
| **Base** | Entity |
| **Primitives** | Image, Measurement, Note, Tag |
| **Identity** | Identifier (includes Barcode) |
| **Structure** | Context, Grid, Group, Map, Queue, Relationship, Scope, Set, Style, Thread, Unifier |
| **Data Operations** | Filter, Log, Sort |
| **Operations** | Async, Function, Handshake, Instruction, Interaction, Prompt, Protocol |
| **Financial** | FinancialTerm (70+ typed operations) |
| **Time** | TimeTerm (deadline, duration, buffer, sprint, etc.) |
| **Views & Nav** | Navigation, View, ViewGroup, ViewState |
| **Agent** | AgentFlow, Improvement |
| **Design Knowledge** | BugPattern, DesignChoice, RuleOutcome |
| **Cost & Certainty** | Bandwidth |
| **Compound** | Business, Container, Order, Product, Reader, Till, Timecard, Unit |

## Design Principles

- Flat models by default — inheritance reserved for security primitives
- Compose through references, not nesting
- Context handles display/scoping, models handle logic
- Every model gets base CRUD properties (id, timestamps, createdBy, soft-delete)
- If it can be composed from existing primitives, it's a recipe — not a new base model

## Build

```bash
npm run build       # TypeScript → dist/ (CJS + ESM)
npm run test        # Run test suite
npm run clean       # Remove dist/
```

## License

[MIT](LICENSE)
