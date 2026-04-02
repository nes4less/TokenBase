# TokenBase Language — Vision

## The Idea

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
