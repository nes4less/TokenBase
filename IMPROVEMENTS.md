> **This file is reference context, not a task.** Patterns noticed, things to refactor, potential base model additions, efficiency gains spotted. Append-only — every session adds observations.

---

## 2026-04-03

### ~~Inconsistent `static collection` across models~~ — RESOLVED

The split is intentional: 31 storable models declare `static collection`, 8 embeddable models don't. Convention now documented in MODELS.md and SCOPE-MODELS.md with a full embeddable/storable table and MCP implications.

**Embeddable models:** Entity, Filter, Identifier, Image, Log, Measurement, Sort, Tag

### ~~Model count drift in KIT-PLAN.md~~ — RESOLVED

All docs now standardized to **39 base model files** (RuleOutcome was added after the initial count). The drift was caused by undercounting (Bandwidth, BugPattern, DesignChoice, RuleOutcome, Unifier were missing from various lists) and ghost entries (Address listed but no file existed, Barcode listed separately but lives in Identifier.ts). Fixed across README, INVENTORY, SCOPE-MODELS, MODELS, and KIT-PLAN.

### ~~Compound models don't extend Entity~~ — RESOLVED (Decision 1: Stay as-is)

Evaluated in DESIGN-PROPOSALS.md. Decision: keep the duplication. It's mechanical, harmless at this scale, and avoids indirection. Entity class remains available if revisited later.

### ~~No runtime validation~~ — RESOLVED (Decision 2: Zod)

Zod schemas will be co-located with models, validated at boundaries (MCP/API), not in constructors. Schemas double as MCP tool input definitions. `z.infer<>` keeps types in sync automatically. See DESIGN-PROPOSALS.md §2.

### ~~`generateHexColor` in utils is unused~~ — RESOLVED

Removed from `src/utils/index.ts`. Was dead code — Tag and Style use hardcoded color defaults.

### ~~Constructor operator inconsistency (`??` vs `||`)~~ — NOT AN ISSUE

Investigated: the mix is intentional and correct. `??` (nullish coalescing) is used for numbers and booleans where `0`/`false` are valid values (e.g., `amount ?? 0`, `taxable ?? true`). `||` (logical OR) is used for strings and null-defaulting where any falsy value should trigger the default. Every model follows this pattern consistently.

### `Validatable` and `Interchangeable` traits are defined but unimplemented — PARKED

Both exist in Traits.ts with full field definitions but no model implements either. They're forward-designed for the MCP/validation layer. Annotated in MODELS.md as "designed, not yet implemented by any model." Decision: leave as forward-designed. No model needs them yet — they'll be implemented when a concrete use case arrives.

### Smoke tests need full coverage expansion

64 smoke tests exist across 5 files covering schemas, encryption round-trips, data service CRUD, MCP generation/registry/bridge/transport, and key lifecycle. These cover the happy path. Full coverage needed for: edge cases, concurrent access, subscription lifecycle, error recovery, large payloads, algorithm switching.
