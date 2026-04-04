# TokenBase Language — Vision

## Core Thesis

The system exists to solve three problems:

**1. Convolution** — Too many layers between wanting something and getting it. Every hop is latency, every translation is potential corruption. The language compiles direct paths. The MCP is your exact interface, nothing more. Content servers don't interpret, they deliver.

**2. Data invalidity** — Bad data propagates because nothing enforces truth at the source. Every entry is classified (primary/meta/derived). Every piece has Source and Certainty. The ledger is immutable. Zero-knowledge verification confirms without exposing. The system won't accept unvalidated Tokens.

**3. Context loss** — AI works with scraped, partial, stale context. The kit solves this with the repo standard (GOALS, KIT-PLAN, INVENTORY, IMPROVEMENTS), scoped models, classified metadata, and the Improvement pipeline that continuously refines raw data into rules. Context isn't scraped — it's structured, scoped, and always current.

**The workflow:** AI lines it up (composes, queries, transforms, proposes). Humans confirm it (Handshake). Two-way auth on every meaningful action. AI does the volume work with precision because the data is valid and the context is complete. Humans do the judgment work because the options are clear and pre-validated.

**The efficiency goal:** Provide every building block so AI is accurate, efficient, and works with humans on two-way auth. No guessing. No scraping. No stale context. No invalid data. No convolution. Direct paths from intent to result.


TokenBase starts as a shared model library. It becomes the type system for a new language. That language compiles from the lowest possible layer up through every existing language.

## Compilation Stack

```
Layer 0 — Machine primitives
           Bit-level type representations. No runtime. No GC. No assumptions.

Layer 1 — TokenBase Language
           The tightest expression of models, relationships, operations,
           topology, and presentation. This is where efficiency lives.
           Every concept from the model library has a native keyword.

Layer 2 — Target languages (generated, not hand-written)
           TypeScript, Swift, Rust, C, Python, etc.
           Each target inherits Layer 1 efficiency but speaks native.

Layer 3 — Adoption
           Developers write in TokenBase directly → compiles down cleanly.
           Or they consume generated targets in their language of choice.
```

## Why Bottom-Up

If you start at Layer 2 (TypeScript) and push down later, you inherit all of TypeScript's assumptions — object model overhead, GC patterns, runtime costs, serialization conventions. You can never fully squeeze that air out.

If you define primitives at Layer 0-1 first, then *generate* the higher layers, those targets are just views into the real thing. The source of truth stays clean. You only lose efficiency at each compilation boundary, and those losses are known and measurable.

## Core Concepts (Language Primitives)

These become native to the language, not library code:

| Concept | What it is |
|---|---|
| **Entity** | Base CRUD — id, timestamps, soft delete, created by |
| **Context** | Display, scoping, presentation — how things look and where they live |
| **Scope** | Downstream effects — what is affected, hierarchy, regional metadata |
| **Group** | Belonging — these things are together |
| **Unifier** | Variant definition — differences, similarities, identifiers |
| **Identifier** | Detection — barcode, SKU, label, visual, reference to other models |
| **FinancialTerm** | Typed directional monetary operation — 70+ semantic term types |
| **TimeTerm** | Typed directional time operation (planned — same pattern as financial) |
| **Function** | Complete operation — inputs, outputs, transformation, not just CRUD |
| **Relationship** | Typed edge between groups — parent, child, sibling, dependency |
| **Map** | Topology — all relationships in a set, orbital/hierarchical structure |
| **Style** | Presentation template — flatten model data to print/markup/linked/plain |
| **Improvement** | Data refinement pipeline — raw → categorized → summarized → analyzed → rules |
| **AgentFlow** | Processing workflow — chain of agents with pass/loop gates and refresh cadence |
| **FlowAgent** | Agent within a flow — focused role, gate condition, position |
| **Tag** | Classification primitive |
| **Image** | Visual asset with blurhash |

## Architecture Vision

```
TokenRemote App = multi-threaded CLI commander (human interface)
Agents = workers in defined flows (FlowAgent chains)
Improvement pipeline = CLI data → rules (first flow)
Future flows = planning, code writing, context clearing, build uploads

Goal: humans do as little as possible, only after agents
have processed and prepared everything correctly.
```

## Current State

The TypeScript models in `src/models/` are a working draft of the *semantics* — what the types mean, what fields they carry, how they relate. These become the spec for Layer 1, not Layer 1 itself.

## Insights Log

Add observations here as they come up. Anything that refines the model, reveals a missing primitive, or clarifies a compilation boundary.

- The model set has a "cavemen to AI age" arc — from raw physical primitives (Locatable, Measurement, Container) through human abstractions (Nameable, Group, Relationship, FinancialTerm) to automation (AgentFlow, Improvement, Async). The language could reflect this evolutionary layering — each era builds on the last. Develop this theme later.
- **Typeable** as root classification: Person, Place, Thing, Idea, Event, Location, Result, Action, State, Quantity, Rule, Signal. Every entity IS one of these at root. This may reorganize the entire model list into tiered compound base models (Tier 0: types, Tier 1: traits, Tier 2: structural, Tier 3: operational, Tier 4: compound).
- **Context might absorb Typeable** — Context already carries identity, display, scope, params, metadata. If it also carries the root type, it becomes the universal identity card for any entity. The entity is just data, Context is everything ABOUT it. Design session needed.
- **Private blockchain pattern.** What we described IS a blockchain — distributed encrypted fragments, zero-knowledge verification, Handshake as key exchange, immutable Log, destruction on revocation. But without public consensus overhead. Only Handshake parties validate. Every Handshake is a contract. Every Log entry is a block. Every MCP is a wallet. Scope hierarchy is the chain of custody. Handshake breaks → chain forks → their branch becomes unreadable. This is the universal currency — not just money, but trust, access, and data itself are the transactable assets.
- **Token is the unit of exchange.** Everything in the system is a Token — data, access, money, trust, identity, capability. The language compiles Tokens. The blockchain tracks Tokens. The MCP controls Tokens. Token isn't a product name, it's the primitive.
- **Stable currency model.** User buys in with fiat (USD, EUR, etc.) → pegged Tokens. Everything inside transacts in Tokens. Cash out → Tokens convert back to fiat. Stable peg, not speculative. This is infrastructure, not a casino.
- **Third-party validators.** Established entities (Amazon, eBay, banks, registrars) serve as proof-of-existence anchors. They don't run the chain — they attest. "Yes, this entity exists. Yes, this transaction happened." Their track record IS the trust. External Handshake parties with read-only verification MCPs.
- **The full stack rebuild.** Language (how things are defined) → Models (what things are) → Token layer (how things move) → MCP (who can do what) → Validators (who confirms what's real). Every Token project builds a piece. Token Remote = control surface. Token Sports = proof of concept. CashierFu = commerce proof. TokenBase = foundation.

## The Three Missing Infrastructure Pieces

### 1. The Language

The TokenBase language. Optimized for the Token from the ground up. Not a general-purpose language — a language purpose-built for defining, composing, transacting, and verifying Tokens.

**What it compiles:**
- Model definitions → type-safe structures
- Compositions → compound models from base primitives
- Transactions → Token movements with Handshake verification
- Protocols → enforceable rules with zero-knowledge validation
- Instructions → executable sequences with gate conditions
- Styles → output transformations to any target format

**Compilation targets:**
- Layer 0: Machine primitives (bare metal efficiency)
- Layer 1: Token language (the tightest expression, where efficiency lives)
- Layer 2: Generated targets (TypeScript, Swift, Rust, C, SQL, etc.)
- Layer 3: Adoption (developers write Token directly)

**Key design requirements:**
- Every base model is a native keyword, not a library import
- Transactions are first-class (like async/await in JS, but for Token operations)
- Handshake verification is built into the type system (you can't compile a transaction without a valid Handshake type)
- Zero-knowledge proofs are a language primitive, not a library
- The compiler enforces security structurally — insecure patterns don't compile

**Status:** Design phase. The TypeScript models are the working spec for the type system.

### 2. Content Servers

The delivery layer. How Tokens (data, assets, media, compiled output) get served to consumers.

**What they serve:**
- Compiled application bundles (generated from Token language)
- Media assets (images, video, documents — through Style transformations)
- API responses (model data, filtered/sorted/scoped per MCP)
- Realtime streams (Pub/Sub for live Token movements)
- Static exports (print-ready, CSV, PDF — Style target outputs)
- Verification endpoints (zero-knowledge yes/no responses)

**Architecture:**
- Edge-distributed (content close to consumer)
- Scope-aware (each server instance only has data for its scope)
- MCP-gated (requests authenticated against the user's generated MCP)
- Encrypted in transit and at rest
- Cache-aware (immutable Tokens can be cached forever, mutable ones invalidate on Log entry)

**Key requirement:** Content servers don't interpret data. They serve Tokens. The MCP determines what a user can request. The Style determines how it's formatted. The server just moves bytes.

### 3. The Databases

Where Tokens live at rest. Not one database — a layered persistence system optimized for different Token types.

**Layers:**
- **Token ledger** — the blockchain. Immutable. Every Token movement, every Handshake, every Log entry. Append-only. This is the source of truth.
- **State store** — current state of all entities. Derived from the ledger but optimized for queries. Rebuilt from ledger if corrupted. Think of it as a materialized view of the chain.
- **Asset store** — binary data (images, files, media). Content-addressed (hash = address). Deduplicated. Encrypted per-scope.
- **Index store** — search and filter indexes. Generated from state store. Disposable and rebuildable. Optimized for Filter + Sort operations.
- **Cache layer** — hot data for content servers. Scope-partitioned. Invalidated by Log entries.

**Key design requirements:**
- The ledger is the only thing that MUST survive. Everything else is derived.
- The state store is the primary read target (not the ledger — that's too slow for queries)
- Scope-level encryption means one compromised key only exposes one scope
- The database understands the model structure natively (not generic tables with JSON columns)
- Schema is defined by the Token language, not by migration files

**Relationship to language:** The database schema IS the compiled output of Token model definitions. You define a model in the language, the compiler generates the persistence schema. No ORM, no mapping layer, no impedance mismatch.

**Status:** Parked until language design solidifies. The language dictates the database, not the other way around.
