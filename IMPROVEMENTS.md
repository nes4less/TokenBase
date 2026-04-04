> **This file is reference context, not a task.** Patterns noticed, things to refactor, potential base model additions, efficiency gains spotted. Append-only — every session adds observations.

---

## 2026-04-03

### ~~Inconsistent `static collection` across models~~ — RESOLVED

The split is intentional: 30 storable models declare `static collection`, 8 embeddable models don't. Convention now documented in MODELS.md and SCOPE-MODELS.md with a full embeddable/storable table and MCP implications.

**Embeddable models:** Entity, Filter, Identifier, Image, Log, Measurement, Sort, Tag

### ~~Model count drift in KIT-PLAN.md~~ — RESOLVED

All docs now standardized to **38 base model files**. The drift was caused by undercounting (Bandwidth, BugPattern, DesignChoice, Unifier were missing from various lists) and ghost entries (Address listed but no file existed, Barcode listed separately but lives in Identifier.ts). Fixed across README, INVENTORY, SCOPE-MODELS, MODELS, and KIT-PLAN.

### Compound models don't extend Entity

Base models like Group, Context, Scope all independently declare `id`, `createdAt`, `createdBy`, `deletedAt`, `updatedAt` with the same defaults. Entity exists as a base class for exactly this purpose, but no model extends it. The compound models (Business, Product, Order, etc.) also duplicate these fields. This means every model is ~10 lines of boilerplate that Entity already provides. Not urgent — the current pattern is explicit and consistent — but if a new timestamp field is needed system-wide (e.g., `archivedAt`), it has to be added to 43 files instead of 1.

### No runtime validation

Constructors accept `Partial<T>` and default everything to null/empty. There's no validation — you can create a Filter with `operator: 'between'` and no `valueTo`, a FinancialTerm with `amount: 0` and `currency: null`, a Handshake with no parties. This is fine for the current "models as vocabulary" phase, but the MCP layer will need validation rules per model. Worth designing as a trait (Validatable exists but isn't implemented on any model) or as MCP-layer middleware rather than baking it into constructors.

### ~~`generateHexColor` in utils is unused~~ — RESOLVED

Removed from `src/utils/index.ts`. Was dead code — Tag and Style use hardcoded color defaults.

### ~~Constructor operator inconsistency (`??` vs `||`)~~ — NOT AN ISSUE

Investigated: the mix is intentional and correct. `??` (nullish coalescing) is used for numbers and booleans where `0`/`false` are valid values (e.g., `amount ?? 0`, `taxable ?? true`). `||` (logical OR) is used for strings and null-defaulting where any falsy value should trigger the default. Every model follows this pattern consistently.

### `Validatable` and `Interchangeable` traits are defined but unimplemented

Both exist in Traits.ts with full field definitions but no model implements either. They're forward-designed for the MCP/validation layer. Annotated in MODELS.md as "designed, not yet implemented by any model." Not dead code — they define the contract for future work.
