# TokenBase Phase 2+ — Design Proposals

> **Decisions are locked.** All five architecture proposals have been reviewed and decided. This document is now the authoritative reference for Phase 2+ implementation.

---

## 1. Entity Base Class Extension

**Problem:** Every model duplicates 5 Entity fields (id, createdAt, updatedAt, createdBy, deletedAt) and their constructor logic. That's ~10 lines × 43 models = 430 lines of boilerplate. More importantly, if Entity gains a field (e.g., `version` for optimistic locking), every model needs manual updates.

**Current state:**
```ts
// Entity.ts — already exists as a class
export class Entity implements IEntity {
  id: string
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  updatedAt: string
  constructor(data?: Partial<Entity>) { ... }
}

// Product.ts — duplicates Entity fields instead of extending
export class Product {
  id: string           // ← duplicate
  createdAt: string    // ← duplicate
  createdBy: string | null  // ← duplicate
  ...
}
```

### Option A: `extends Entity` (Recommended)

Models extend Entity. Each constructor calls `super(data)` to initialize the 5 base fields, then initializes its own fields.

```ts
export class Product extends Entity {
  static collection: string = 'products'
  identifiers: Identifier[]
  catalogId: string | null
  // ... domain fields only, no Entity fields
  constructor(data?: Partial<Product>) {
    super(data)
    this.identifiers = data?.identifiers?.map(i => new Identifier(i)) || []
    this.catalogId = data?.catalogId || null
    // ... domain fields only
  }
}
```

**Impact:**
- Remove ~10 lines per model (field declarations + constructor assignments)
- `instanceof Entity` works for type guards
- Adding a field to Entity propagates automatically
- `Partial<Product>` still works (inherits Entity fields)
- `static collection` is unaffected (static members don't participate in inheritance)

**Risk:** Low. TypeScript class inheritance is well-understood. The `Partial<T>` pattern and `data?.field` idiom work identically with `super()`. No behavioral change to consumers — just less code.

**Migration:** Mechanical. For each model: remove the 5 Entity field declarations, remove the 5 constructor assignments, add `extends Entity`, add `super(data)` as first constructor line. Embeddable models (Filter, Sort, Tag, etc.) that lack some Entity fields stay as-is or get a lighter base.

### Option B: Composition (Entity as a field)

```ts
export class Product {
  entity: Entity
  identifiers: Identifier[]
  ...
}
```

**Tradeoff:** Breaks the flat field access pattern (`product.id` becomes `product.entity.id`). Every consumer changes. Not worth it.

### Option C: Stay as-is

Keep duplicating. Accept the boilerplate.

**Tradeoff:** Every new Entity field requires touching 43 files. Tolerable now, painful as the system grows.

**DECISION: Option C — Stay as-is.** The duplication is mechanical and harmless at this scale. Not worth the indirection cost. Entity class remains available if this is revisited later.

---

## 2. Runtime Validation

**Problem:** Constructors accept `Partial<T>` with no validation. A `Product` with no title, no SKU, and `taxable: "yes"` (string, not boolean) is perfectly legal at construction time. The MCP layer will need to enforce validity — the question is where the schemas live.

**Current state:** Zero validation. Constructors default missing fields to null/empty/generated. Type safety exists at compile time only.

### Option A: Zod Schemas Co-located with Models (Recommended)

Each model gets a Zod schema that lives alongside its class definition. The schema defines what's valid for creation, update, and query operations separately.

```ts
// Product.schema.ts (or inline in Product.ts)
import { z } from 'zod'

export const ProductCreateSchema = z.object({
  title: z.string().min(1),
  sku: z.string().nullable().optional(),
  taxable: z.boolean().default(true),
  catalogId: z.string().uuid().nullable().optional(),
  identifiers: z.array(IdentifierSchema).default([]),
  // ... only fields the caller should provide
})

export const ProductUpdateSchema = ProductCreateSchema.partial()

export const ProductQuerySchema = z.object({
  // filter-relevant fields
})

export type ProductCreateInput = z.infer<typeof ProductCreateSchema>
```

**Where validation runs:**
- **Not in constructors.** Constructors stay permissive for internal hydration (loading from DB, cloning, testing).
- **At MCP boundaries.** When an agent creates/updates via MCP, the schema validates the input before the constructor is called.
- **Optionally at API boundaries.** Route handlers can reuse the same schemas.

**Impact:**
- One new dependency: `zod` (mature, zero runtime deps, ~50KB)
- Each model gains 1 schema file (~20-40 lines)
- Schemas are the single source of truth for "what's valid input" — MCP, API, and UI can all use them
- `z.infer<>` generates TypeScript types automatically — no drift between schema and type

**Migration:** Additive. Models don't change. Schemas are new files. Nothing breaks.

### Option B: Decorators + reflect-metadata

Class decorators like `@MinLength(1)` on fields. Requires `experimentalDecorators`, `reflect-metadata`, and a validation runner.

**Tradeoff:** Heavier setup, decorators are still technically stage 3, metadata reflection adds runtime overhead, and the schemas aren't extractable as standalone objects (harder for MCP to use).

### Option C: JSON Schema

Write `.json` schema files per model. Use `ajv` for validation.

**Tradeoff:** JSON Schema is verbose, doesn't compose as well, and doesn't generate TypeScript types. You'd maintain schemas and types separately.

### Option D: Build validation into the constructors

```ts
constructor(data: ProductCreateInput) {
  const validated = ProductCreateSchema.parse(data)
  ...
}
```

**Tradeoff:** Breaks internal hydration. Loading a Product from the database would need to bypass validation (the DB record is already valid). You'd need a separate `fromDB()` static method. Messy.

**DECISION: Option A — Zod.** Schemas co-located with models, validated at boundaries (MCP/API), not in constructors. Schemas double as MCP tool input definitions. `z.infer<>` keeps types in sync automatically.

---

## 3. MCP Controller Layer

**Problem:** The MCP is the agent interface to TokenBase. KIT-PLAN defines the architecture (instruction-driven, scoped instances generated not filtered), but no code exists. This proposal covers the actual mechanics.

**Current state:** INSTRUCTIONS.md has 28+ composition recipes. The MCP reads these to determine capabilities. Scoping = which recipes are in scope.

### Architecture

The MCP has three layers:

```
┌──────────────────────────────────────┐
│  Scoped MCP Instance                 │
│  (generated per user/role)           │
│  Only contains granted capabilities  │
├──────────────────────────────────────┤
│  MCP Registry                        │
│  (stores generated instances)        │
│  Keyed by Handshake ID              │
├──────────────────────────────────────┤
│  Master MCP Definition               │
│  (all capabilities, all models)      │
│  Source of truth for generation      │
└──────────────────────────────────────┘
```

### Master MCP Definition

A declarative manifest that maps every model to its available operations, grouped by capability domain.

```ts
// mcp/master.ts
export const MasterMCP: MCPDefinition = {
  models: {
    Product: {
      operations: ['create', 'read', 'update', 'softDelete', 'query', 'subscribe'],
      queryCapabilities: {
        filters: ['eq', 'neq', 'contains', 'in', 'between'],
        sort: true,
        pagination: true,
      },
      compositions: ['catalog-screen', 'product-detail', 'inventory-check'],
      validationSchema: 'ProductCreateSchema',  // links to Zod schema
      fieldAccess: {
        public: ['id', 'title', 'sku', 'description', 'images', 'tags'],
        internal: ['catalogId', 'metadata', 'dimensions'],
        system: ['createdAt', 'updatedAt', 'createdBy', 'deletedAt'],
      },
    },
    // ... every model
  },
  recipes: {
    'catalog-screen': { /* links to INSTRUCTIONS.md recipe */ },
    'product-detail': { ... },
    // ... every recipe
  },
}
```

### Scoped Instance Generation

When a user's Handshake is established, a scoped MCP is generated from the master:

```ts
// mcp/generate.ts
function generateScopedMCP(
  master: MCPDefinition,
  scope: MCPScope
): ScopedMCP {
  // 1. Filter models to only those in scope
  // 2. Filter operations per model to only those granted
  // 3. Filter fields per model to only those visible
  // 4. Filter recipes to only those that use in-scope models
  // 5. Attach validation schemas for granted operations
  // 6. Return a self-contained MCP instance
}
```

The generated MCP is a **static artifact** — a JSON document or compiled TypeScript module. It doesn't reference the master. It doesn't know what it's missing. Unauthorized capabilities don't exist in the output.

### MCPScope Definition

```ts
interface MCPScope {
  handshakeId: string
  role: 'human' | 'agent' | 'cli' | 'agent-group'
  scopeType: 'org' | 'project' | 'environment'
  scopeId: string
  models: {
    [modelName: string]: {
      operations: string[]
      fields: string[]      // empty = all visible fields
    }
  }
  recipes: string[]          // which composition recipes are available
}
```

### MCP Registry

```
Handshake established → generateScopedMCP() → store in registry
Handshake broken → delete from registry → MCP is gone
Handshake modified → delete old → generate new → store
```

The registry is a key-value store keyed by Handshake ID. The value is the generated MCP instance. When a Handshake breaks (revocation, expiry, breach), the MCP is deleted. There's nothing to "hack" because the artifact no longer exists.

### Transport

The MCP exposes capabilities as tool definitions (aligned with the MCP protocol spec):

```ts
// Each model operation becomes a tool
{
  name: 'product.create',
  description: 'Create a new Product',
  inputSchema: ProductCreateSchema,  // Zod → JSON Schema
  outputSchema: ProductSchema,
}
```

This makes the MCP compatible with AI SDK tool calling, Claude MCP, and any MCP-compatible client.

### What This Depends On

| Dependency | Status |
|---|---|
| Validation schemas (Proposal #2) | Needed for input validation |
| Entity base class (Proposal #1) | Nice-to-have, not blocking |
| Security layer (Proposal #4) | Needed for Handshake integration |
| Data service (Proposal #5) | Needed for actual persistence |

**The MCP definition and generation logic can be built now.** The registry and transport layer need the security and data layers.

### Implementation Order

1. Define `MCPDefinition` type and `MasterMCP` manifest
2. Write `generateScopedMCP()` — pure function, testable in isolation
3. Write MCP-to-tool-definition serializer (JSON Schema output from Zod)
4. Build the registry (after security layer)
5. Build the transport (after data service)

---

## 4. Security / Key Management Layer

**Problem:** The security model is designed (Handshake-gated, zero-knowledge, structural absence) but no implementation exists. The core question: where do encryption keys live and how does the Handshake lifecycle manage them?

**Current state:** Handshake model exists with status, parties, agreedBy, rejectedBy, changes, metadata. No encryption or key fields.

### Key Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Handshake (existing model, extended)                   │
│  + keyFingerprint: string (public identifier of the key)│
│  + encryptedKeyFragment: string (this party's fragment) │
│  + keyAlgorithm: 'aes-256-gcm' | 'xchacha20-poly1305'  │
│  + keyRotatedAt: string                                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Key Vault (new model — per-scope key store)            │
│  scopeId, encryptedMasterKey, keyFingerprint,           │
│  algorithm, createdAt, rotatedAt                         │
│  Master key encrypted with Handshake-derived key        │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Encryption Service (new, stateless)                     │
│  encrypt(data, scopeKey) → ciphertext                   │
│  decrypt(ciphertext, scopeKey) → data                    │
│  verify(ciphertext, question) → boolean (ZK)            │
│  deriveKey(handshake) → scopeKey                         │
└─────────────────────────────────────────────────────────┘
```

### Option A: Handshake-Derived Keys (Recommended)

Each Handshake generates a shared secret using key agreement (ECDH or X25519). The shared secret derives scope-level encryption keys. No party holds the full key — each holds their private key + the shared derivation.

**Flow:**
1. Handshake initiated → each party generates an ephemeral key pair
2. Public keys exchanged via Handshake `changes` field
3. Handshake approved → shared secret derived (ECDH)
4. Shared secret → KDF (HKDF-SHA256) → scope master key
5. Scope master key encrypts data at rest
6. Handshake broken → parties' private keys deleted → shared secret is unrecoverable → data is unreadable

**Key storage:**
- Private keys: device-local keychain (macOS Keychain, Android Keystore, etc.)
- Public keys: stored in Handshake record (not secret)
- Scope master key: never stored. Re-derived from private + peer public key on each session
- Key fingerprint: SHA-256 of the public key, stored in Handshake for verification

**Zero-knowledge verification:**
```ts
// Party A wants to verify Party B's field without seeing it
async function verifyField(
  ciphertext: Buffer,
  question: { operator: 'eq' | 'gt' | 'lt', value: unknown }
): Promise<boolean> {
  // Homomorphic comparison or commitment scheme
  // Returns boolean without decrypting
}
```

**Practical ZK:** For the near term, use commitment schemes (hash-based) rather than full homomorphic encryption. Party B commits `hash(value + salt)` → Party A can verify `hash(candidate + salt) === commitment` without seeing the value. This covers the "blind verification" use case from KIT-PLAN.

### Option B: HSM-Managed Keys

Use a hardware security module (AWS CloudHSM, Azure Dedicated HSM) for all key operations.

**Tradeoff:** Expensive ($1-5K/month), adds cloud dependency, doesn't work offline. Better for enterprise tier, not for the base system.

### Option C: Per-User Encrypted Vault

Each user gets an encrypted vault (like 1Password's architecture). Master password → PBKDF2 → vault key → encrypts all user keys.

**Tradeoff:** Requires users to manage a master password. Doesn't align with the Handshake model where key lifetime is tied to relationship lifetime, not user memory.

### Handshake Model Extensions

```ts
// New fields on Handshake
export class Handshake extends Entity {
  // ... existing fields ...

  /** Public key of the initiator (ephemeral, per-handshake) */
  initiatorPublicKey: string | null
  /** Public keys of each party (map: partyId → publicKey) */
  partyPublicKeys: Record<string, string>
  /** SHA-256 fingerprint of the derived shared key */
  keyFingerprint: string | null
  /** Encryption algorithm for this handshake's scope */
  keyAlgorithm: 'aes-256-gcm' | 'xchacha20-poly1305'
  /** When the derived key was last rotated */
  keyRotatedAt: string | null
}
```

### New Model: KeyVault

```ts
export class KeyVault extends Entity {
  static collection: string = 'key_vaults'
  /** Which scope this vault protects */
  scopeId: string
  /** The scope master key, encrypted with the Handshake-derived key */
  encryptedMasterKey: string
  /** Fingerprint for quick lookup */
  keyFingerprint: string
  algorithm: 'aes-256-gcm' | 'xchacha20-poly1305'
  /** Key rotation history (append-only) */
  rotations: { rotatedAt: string; reason: string; fingerprint: string }[]
}
```

### Encryption Granularity (from KIT-PLAN)

| Level | How It Works |
|---|---|
| Field | Individual values encrypted with scope key + field-specific salt |
| Row | Entire record encrypted as a blob |
| Scope | All records in a scope under one key |
| Verification | Hash commitments for ZK yes/no queries |

The encryption service handles all four. The caller specifies granularity per operation. Default is scope-level (simplest). Field-level is opt-in for sensitive data.

### What This Depends On

| Dependency | Status |
|---|---|
| Handshake model (existing) | Needs extension (new fields) |
| Data service (Proposal #5) | Needed for vault storage |
| MCP controller (Proposal #3) | Needs encryption for scoped instances |
| `@noble/*` | Runtime dependency for crypto (Decision 3) |

### Implementation Order

1. Extend Handshake with key fields
2. Create KeyVault model
3. Build EncryptionService (stateless, pure functions: encrypt/decrypt/verify/deriveKey)
4. Build key derivation flow (Handshake approved → derive → store vault)
5. Build destruction flow (Handshake broken → delete vault → keys gone)
6. Integrate with MCP generation (scoped MCP encrypted at rest)

**DECISION: Option A — Noble (`@noble/ciphers` + `@noble/curves` + `@noble/hashes`).** Handshake-derived keys using ECDH + HKDF. Pure JS, audited, zero deps, works everywhere TokenBase gets imported.

**DECISION (ZK): Hash-based commitments as default + server-mediated ZK as opt-in provider.**
- Layer A (local): `commit(secret, nonce) → hash` using `@noble/hashes`. Always available, no server needed. Covers Handshake commitments, ownership proofs, integrity checks.
- Layer B (server-mediated, opt-in): Both parties send encrypted inputs to a ZK prover service. Server runs circuit, returns proof + public signals, discards raw data. Neither party sees the other's data.
- `src/security/proofs/IProofProvider.ts` defines the interface. Models declare `static proofLevel = 'commitment' | 'zk'` to opt in.

---

## 5. Data Service

**Problem:** The persistence layer. KIT-PLAN says "parked until language questions resolved" — but the language (Proposal #6 in LANGUAGE.md) is a long-term vision. The system needs persistence now for Phases 2-4 (Token Remote, Token Sports). The question is: what serves current needs without blocking the language future?

**Current state:** The ecosystem is deployed on Supabase (Postgres). No shared data service. Each app rolls its own persistence.

### Design Principle

Build a **data service interface** that current apps consume. The implementation behind the interface is swappable. When the language layer arrives, it generates a new implementation — the interface stays.

```
┌──────────────────────────────────┐
│  Application Code                │
│  (Token Remote, Token Sports)    │
├──────────────────────────────────┤
│  TokenData Interface             │
│  declare(model) → collection     │
│  collection.create/read/update/  │
│  delete/query/subscribe          │
├──────────────────────────────────┤
│  Adapter (swappable)             │
│  MongoAdapter | SupabaseAdapter  │
│  | PostgresAdapter | FutureAdapter│
└──────────────────────────────────┘
```

### TokenData Interface

```ts
interface TokenData {
  /** Register a model — creates storage if it doesn't exist */
  declare<T extends Entity>(model: ModelDefinition<T>): Collection<T>
}

interface Collection<T extends Entity> {
  create(input: CreateInput<T>): Promise<T>
  read(id: string): Promise<T | null>
  update(id: string, input: UpdateInput<T>): Promise<T>
  softDelete(id: string): Promise<void>
  query(filter: Filter[], sort?: Sort[], pagination?: Pagination): Promise<QueryResult<T>>
  subscribe(filter?: Filter[]): AsyncIterable<ChangeEvent<T>>
  /** Every mutation produces a Log entry automatically */
}

interface ModelDefinition<T> {
  name: string
  collection: string
  schema: ZodSchema<T>           // from Proposal #2
  indexes?: IndexDefinition[]
  encryption?: EncryptionConfig  // from Proposal #4
}
```

### Key Behaviors

1. **Model-aware storage.** The data service understands the model structure — not generic tables with JSON columns. Indexes, queries, and subscriptions are typed.

2. **Automatic logging.** Every mutation produces a Log entry. The Log is append-only. This is the audit trail that KIT-PLAN describes as "the ledger."

3. **Scope-aware queries.** Data is partitioned by scope. A query from a scoped MCP only sees data in its scope. The data service enforces this, not the application.

4. **Encrypted at rest.** Ties into the security layer (Proposal #4). The adapter encrypts using the scope's KeyVault.

5. **Realtime subscriptions.** `subscribe()` returns an `AsyncIterable` of change events. Adapters implement this via their native mechanism (Mongo change streams, Supabase realtime, Postgres LISTEN/NOTIFY).

### Adapter: Supabase/Postgres (Primary)

The ecosystem is already deployed on Supabase. Build the first adapter for Postgres via Supabase client.

```ts
class SupabaseAdapter implements TokenData {
  declare<T extends Entity>(model: ModelDefinition<T>): Collection<T> {
    // Map model to Supabase table
    // Nested types (Tags, MetadataEntries) stored as JSONB columns
    // Return a Collection implementation backed by Supabase
  }
}
```

**Why Supabase:**
- Ecosystem is already deployed there — Postgres is the primary database
- Realtime built-in via Supabase subscriptions (no change streams setup)
- Row-level security for scope enforcement at the database level
- JSONB columns handle nested types (Tags, MetadataEntries, OrderItems)
- `static collection` maps to table names

**Nested type strategy:** Models with arrays of sub-objects (e.g., `tags: Tag[]`, `metadata: MetadataEntry[]`) use JSONB columns. Postgres JSONB supports indexing, querying into arrays, and partial updates — no need to normalize into join tables.

### Adapter: Future (Post-Language)

When the language layer arrives, it generates persistence schemas from model definitions. A new adapter wraps whatever that persistence engine is. The `TokenData` interface doesn't change. Applications don't notice.

### What This Depends On

| Dependency | Status |
|---|---|
| Entity base class (Proposal #1) | `T extends Entity` constraint (staying as-is, still works) |
| Validation schemas (Proposal #2) | `ModelDefinition.schema` |
| Security layer (Proposal #4) | Encryption at rest |
| MCP controller (Proposal #3) | Scope enforcement |
| Supabase client | `@supabase/supabase-js` |

### Implementation Order

1. Define `TokenData`, `Collection`, `ModelDefinition` interfaces
2. Build `SupabaseAdapter` implementing `TokenData`
3. Add automatic Log entry on every mutation
4. Add scope partitioning (scopeId on every query, RLS policies)
5. Add encryption at rest (via EncryptionService from Proposal #4)
6. Add realtime subscriptions (Supabase realtime channels)
7. Migrate TokenSports to use the data service instead of raw database calls

---

## Dependency Graph & Execution Order

```
                ┌──────────────┐
                │ 2. Runtime   │  ← First. No blocking dependencies.
                │    Validation│     Entity stays as-is (Decision 1).
                └──────┬───────┘
                       │
          ┌────────────┼────────────┐
          │                         │
   ┌──────▼───────┐       ┌────────▼─────┐
   │ 3. MCP       │       │ 4. Security  │  ← Can build in parallel
   │    Controller│       │    Layer     │
   └──────┬───────┘       └────────┬─────┘
          │                         │
          └────────────┬────────────┘
                       │
                ┌──────▼───────┐
                │ 5. Data      │  ← Needs validation + security + MCP
                │    Service   │     Supabase/Postgres adapter
                └──────────────┘
```

**Suggested phasing:**

| Phase | Work | Estimated Scope |
|---|---|---|
| 2a | Zod validation schemas for all models | ~38 schema files, co-located |
| 2b | MCP definition + Security layer (parallel) | New modules, Handshake extensions, commitment/ZK interfaces |
| 2c | Data service interface + Supabase adapter | New module, JSONB strategy for nested types |
| 2d | Integration (MCP ↔ Security ↔ Data) | Wiring, end-to-end testing |

---

## Decisions — Locked

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Entity extension | **Stay as-is (C)** | Duplication is mechanical and harmless at this scale |
| 2 | Validation library | **Zod (A)** | Boundary validation, schemas double as MCP tool input, `z.infer<>` keeps types in sync |
| 3 | Security crypto | **Noble (A)** | `@noble/ciphers` + `@noble/curves` + `@noble/hashes` — audited, pure JS, zero deps, portable |
| 4 | Zero-knowledge | **Hash commitments + opt-in ZK server** | Layer A (local hashes) default, Layer B (server-mediated ZK prover) for models that need double-blind |
| 5 | Data service adapter | **Supabase/Postgres (B)** | Ecosystem is already deployed on Supabase, Postgres is primary |
