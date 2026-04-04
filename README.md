# TokenBase

Universal base models for the Token ecosystem.

Shared foundation for TokenRemote, TokenSports, CashierFu, and future Token projects. TokenBase is an application construction system — composable primitives that AI agents use to build any app from the ground up.

## What's In Here

- **34 base models** — the irreducible primitives (Entity, Context, Group, Scope, Function, View, Queue, Filter, Sort, Log, etc.)
- **27 traits** — composable interfaces (Nameable, Statusable, Chargeable, Expirable, Locatable, Typeable, etc.)
- **8 compound models** — domain-specific compositions from CashierFu/GameroomKit (Business, Order, Product, Till, etc.)
- **utils/** — UUID generation, date strings

## Install

```bash
npm install tokenbase
```

## Usage

```typescript
import { Entity, Group, View, Filter, Sort, Style } from 'tokenbase'
```

All base models, traits, and compound models are exported from the package root.

## Design Principles

- Flat models, no inheritance hierarchies
- Compose through references, not nesting
- Context handles display/scoping, models handle logic
- Every model gets base CRUD properties (id, timestamps, createdBy, soft-delete)
- If it can be composed from existing primitives, it's a recipe — not a new base model

## Model Categories

| Category | Models |
|---|---|
| **Base** | Entity |
| **Primitives** | Address, Image, Measurement, Note, Tag |
| **Identity** | Barcode, Identifier |
| **Structure** | Context, Grid, Group, Map, Queue, Relationship, Scope, Set, Style, Thread, Unifier |
| **Data Operations** | Filter, Log, Sort |
| **Operations** | Async, Function, Handshake, Instruction, Interaction, Prompt, Protocol |
| **Financial** | FinancialTerm (70+ typed operations) |
| **Time** | TimeTerm (deadline, duration, buffer, sprint, etc.) |
| **Views & Nav** | Navigation, View, ViewGroup, ViewState |
| **Agent** | AgentFlow, Improvement |
| **Compound** | Business, Container, Order, Product, Reader, Till, Timecard, Unit |

## Project Files

| File | Purpose |
|---|---|
| `GOALS.md` | End-state vision |
| `KIT-PLAN.md` | Architecture, decisions, execution order |
| `INVENTORY.md` | Complete model list with counts |
| `SCOPE-MODELS.md` | Every exported class/interface/type with purpose and origin |
| `LANGUAGE.md` | Long-term language/compiler vision |

## Build

```bash
npm run build    # TypeScript → dist/
```
