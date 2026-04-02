# TokenBase Kit — Master Plan

> **This file is reference context, not a task.** Documents the complete vision, current state, and execution order for the TokenBase application construction system.

---

## What TokenBase Is

TokenBase is not a code library. It is a **complete application construction system** whose primary consumer is an AI agent, not a human developer.

The kit provides everything needed to build any application from the ground up using composable base models. The goal: describe what you want in terms of base primitives, and the system handles composition, persistence, access control, and transport.

---

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│  Applications (Token Remote, Token Sports)  │
├─────────────────────────────────────────────┤
│  Instruction Set — how to compose models    │
│  into screens, flows, APIs, pipelines       │
├─────────────────────────────────────────────┤
│  MCP Controller — agent interface           │
│  Scoped per-user, generated not filtered    │
├─────────────────────────────────────────────┤
│  Security Layer — Handshake-gated           │
│  Zero-knowledge verification                │
│  MCP destruction on revocation              │
├─────────────────────────────────────────────┤
│  Data Service — Pub/Sub persistence         │
│  Declare models → get storage + realtime    │
│  (Parked until language questions resolved) │
├─────────────────────────────────────────────┤
│  Base Models (30) + Traits (26)             │
│  The vocabulary — what things are           │
├─────────────────────────────────────────────┤
│  Language Layer (future)                    │
│  Models become the type system              │
│  Bottom-up compilation to any target        │
└─────────────────────────────────────────────┘
```

---

## Layer Details

### 1. Models (✅ Done)

30 base models + 26 traits. The irreducible primitives.

**Base Models:**
AgentFlow, Async, Context, Entity, Filter, FinancialTerm, Function, Grid, Group, Handshake, Identifier, Image, Improvement, Instruction, Log, Map, Measurement, Note, Prompt, Protocol, Queue, Relationship, Scope, Set, Sort, Style, Tag, TimeTerm, Traits, Unifier

**Traits:**
Nameable, Subnameable, Describable, Identifiable, Indexable, Rankable, Colorable, Imageable, Statusable, Noteable, Chargeable, Saleable, Addressable, Metadatable (classified entries), Taggable, Polymorphic, Expirable, Attachable, Locatable, Accessible, Sourceable, Validatable, Securable, Interchangeable, Linkable, Typeable

**Compound (domain reference, 8):**
Business, Container, Order, Product, Reader, Till, Timecard, Unit

**Status:** Models locked. Shape shouldn't change, only additions.

### 2. Instruction Set (📋 Needs Writing)

How to compose models into applications. This is the "recipe book" that agents consume.

**What it needs to cover:**
- How to compose a screen from models (a product detail screen = Unifier + Context + Style + Identifier)
- How to compose an API endpoint from models (Function + Filter + Sort + Scope)
- How to compose a workflow from models (AgentFlow + Instruction + Protocol + Prompt)
- How to compose a data pipeline (Improvement + AgentFlow + Queue + Log)
- How to compose a financial flow (FinancialTerm chain + Handshake + Log)
- How to compose a time-based system (TimeTerm + Queue + Async + Instruction)
- Pattern library: common compositions with names (e.g., "Catalog" = Set + Group + Unifier + Style)
- Anti-patterns: what NOT to compose (things that look like they work but break at scale)
- Decision trees: "I need X" → use these models in this pattern

**Format:** Structured markdown that agents can parse. Each recipe has: name, intent, models used, composition pattern, example, gotchas.

### 3. MCP Controller (📋 Needs Architecture)

The interface through which agents access and operate on the system.

**Core design principles:**
- **Master MCP** contains all capabilities across all models
- **Scoped MCPs** are **generated** from the master at account creation — not filtered, not restricted, GENERATED. The scoped MCP literally does not contain code for capabilities outside its scope
- **MCP Registry** — one MCP per user, stored in a database. Revocation = deletion. Nothing to hack because nothing exists
- **No runtime permission checks** — the MCP either has the capability or it doesn't. Security is structural, not conditional

**MCP capabilities per model:**
- CRUD operations (create, read, update, soft-delete)
- Query (Filter + Sort + pagination)
- Subscribe (realtime changes)
- Compose (create compound structures from base models)
- Validate (check constraints, Handshake status)
- Transform (apply Style, compute FinancialTerm chains)

**Scoping dimensions:**
- By role (human, agent, CLI, agent-group)
- By scope (org, project, environment)
- By model (which models this MCP can access)
- By operation (read-only, read-write, admin)
- By field (which fields within a model)

**Stamped at account creation:**
- User signs up → Handshake established → scope determined → MCP generated → stored in registry
- User's relationship changes → old MCP destroyed → new MCP generated (or nothing)
- Handshake breaks → MCP destroyed. No revocation dance. Just gone.

### 4. Security Layer (📋 Needs Design)

Handshake-gated, zero-knowledge verification.

**Encryption granularity:**
- Field level — individual values encrypted, decrypted only by the party that needs that field
- Row level — whole records encrypted per-scope
- Scope level — entire scope's data under one key
- Verification level — validate data you can't read ("is this value X?" → yes/no without seeing the value)

**Zero-knowledge pattern:**
- Each party holds an encrypted fragment
- Validation requests return booleans, not data
- No party holds enough information to compromise the system
- The Handshake IS the key exchange — when it breaks, keys are gone (not revoked, GONE)

**Practical implications:**
- Fired employee: their MCP is destroyed, their Handshake is broken, their keys no longer exist. They have nothing.
- Stolen credentials: the MCP is scoped, so the blast radius is limited to what that MCP could do. And if the Handshake is broken (detected breach), even that goes away.
- Blind verification: payment processing where merchant doesn't see card number, bank doesn't see purchase, network doesn't see either. Each validates their piece.

### 5. Data Service (⏸ Parked)

Pub/Sub persistence layer. Declare models, get storage + realtime + sync.

**Parked because:** The language design may influence database choice. If TokenBase compiles to a language with its own type system, the persistence layer should be native to that language, not bolted on.

**What we know it needs:**
- Realtime subscriptions (already using Supabase for this)
- Model-aware storage (not generic tables — the DB understands the model structure)
- Scope-aware queries (data is partitioned by scope)
- Log integration (every mutation is a LogEntry)
- Encrypted at rest (ties to security layer)

**Decision point:** After language questions are resolved in LANGUAGE.md

### 6. Language Layer (⏸ Parked, Long-term)

Models become the type system for a compiled language.

Documented in LANGUAGE.md. The cavemen-to-AI arc. Layer 0 machine primitives → Layer 1 TokenBase language → Layer 2 generated targets → Layer 3 adoption.

---

## Execution Order

```
Phase 1: Stabilize (NOW)
├── ✅ Models locked (30 base + 26 traits)
├── ✅ Compound models separated
├── ✅ INVENTORY.md — complete model list
├── 📋 MODELS.md — full contextual docs with tests/use cases
├── 📋 Instruction set — composition recipes
└── 📋 MCP architecture doc

Phase 2: Build Token Remote (NEXT)
├── Use kit vocabulary for all new features
├── Finish messaging (compose modal — done via OTA)
├── Tasks tab verification
├── OTA update flow working
├── Two-machine workflow operational
└── MessageCenter cleanup complete

Phase 3: Stabilize Token Remote
├── Bug-free, feature-complete
├── All views working
├── Agent flows operational
├── Desktop companion solid
└── Refactor to TokenBase models where practical

Phase 4: Token Sports (proof of concept)
├── Build using TokenBase models
├── Validates the kit works for real products
├── Identifies missing models or patterns
└── Feeds back into kit improvements

Phase 5: Re-abstract Everything
├── All projects consuming TokenBase
├── MCP controller built
├── Security layer implemented
├── Data service designed (post-language decisions)
├── Project builder framework
└── Kill busywork
```

---

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Kit consumer | AI agents, not human developers | Humans don't write code anymore. The kit is an agent instruction set. |
| MCP scoping | Generated, not filtered | Filtered MCPs are inherently insecure — disabled code still exists. Generated MCPs contain only what's granted. |
| MCP lifecycle | One per user, stamped at creation, destroyed on revocation | No permission tables, no runtime checks. Structural security. |
| Encryption | All granularities (field/row/scope/verification) | Granular is always more useful than coarse. Build fine, use coarse when appropriate. |
| Security model | Zero-knowledge verification | Nobody sees the full picture. Each party validates their fragment. Handshake = key exchange. |
| Data service | Parked | Language design may influence DB. Don't lock in a persistence layer before the type system is decided. |
| Metadata | Self-classifying entries | Every piece of data declares: primary, meta, extended, derived, or system. No guessing. |
| Compound models | Separate from base | Base models are primitives. Compounds are recipes. Different layer. |
| What's a base model | If it can't be composed from existing primitives | Only add when composition fails. If it can be composed, document the recipe instead. |

---

## Open Questions

1. **Language design** — what does the TokenBase language look like? How does the type system map to compilation targets? (LANGUAGE.md)
2. **Database** — what persistence engine serves the language natively? (Blocked on #1)
3. **MCP generation** — what's the compilation step from master → scoped? Template engine? AST transformation? Code generation?
4. **Key management** — where do Handshake keys live? HSM? Per-user encrypted vault? Ephemeral?
5. **Typeable + Context** — does Typeable live on Context (making Context the universal identity card) or is it a standalone root? (Design session needed)
6. **Trait composition** — in the language, are traits mixins, protocols, or something else? How does the compiler enforce trait requirements?
