> **This file is reference context, not a task.** Patterns noticed, things to refactor, potential base model additions, efficiency gains spotted. Append-only — every session adds observations.

---

## 2026-04-03

### Inconsistent `static collection` across models

Some models have `static collection: string = 'collectionName'` (e.g., Group, Unifier, Scope, Context) while others don't (Entity, Filter, Tag, Sort, Identifier, Image, Log, Measurement). The split seems intentional — models without `collection` are embeddable primitives, not top-level storable records. But there's no formal marker for this distinction. When the MCP controller generates CRUD operations, it needs to know which models are independently storable vs embedded. Worth formalizing — either a `static embeddable = true` marker, a trait, or documented convention in MODELS.md.

**Models missing `static collection`:** Entity, Filter, Identifier, Image, Log, Measurement, Sort, Tag

### ~~Model count drift in KIT-PLAN.md~~ — RESOLVED

All docs now standardized to **38 base model files**. The drift was caused by undercounting (Bandwidth, BugPattern, DesignChoice, Unifier were missing from various lists) and ghost entries (Address listed but no file existed, Barcode listed separately but lives in Identifier.ts). Fixed across README, INVENTORY, SCOPE-MODELS, MODELS, and KIT-PLAN.

### Compound models don't extend Entity

Base models like Group, Context, Scope all independently declare `id`, `createdAt`, `createdBy`, `deletedAt`, `updatedAt` with the same defaults. Entity exists as a base class for exactly this purpose, but no model extends it. The compound models (Business, Product, Order, etc.) also duplicate these fields. This means every model is ~10 lines of boilerplate that Entity already provides. Not urgent — the current pattern is explicit and consistent — but if a new timestamp field is needed system-wide (e.g., `archivedAt`), it has to be added to 43 files instead of 1.

### No runtime validation

Constructors accept `Partial<T>` and default everything to null/empty. There's no validation — you can create a Filter with `operator: 'between'` and no `valueTo`, a FinancialTerm with `amount: 0` and `currency: null`, a Handshake with no parties. This is fine for the current "models as vocabulary" phase, but the MCP layer will need validation rules per model. Worth designing as a trait (Validatable exists but isn't implemented on any model) or as MCP-layer middleware rather than baking it into constructors.

### `generateHexColor` in utils is unused

Defined in `src/utils/index.ts` but grep shows no imports outside the file itself. Probably leftover from an earlier color-handling approach — Tag and Style use hardcoded defaults instead.
