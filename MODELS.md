# MODELS.md

Complete reference for every model in TokenBase. Organized by category with descriptions, fields, relationships, and use cases.

---

## Entity (Base Class)

**`src/models/Entity.ts`** — Universal base for all storable records. Provides identity, soft-delete, and audit timestamps.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID, auto-generated |
| `createdAt` | `string` | ISO timestamp, auto-set |
| `createdBy` | `string \| null` | Actor who created |
| `deletedAt` | `string \| null` | Soft-delete timestamp |
| `updatedAt` | `string` | ISO timestamp, auto-set |

**Use case:** Not used directly. Every storable model duplicates these fields rather than extending Entity (see IMPROVEMENTS.md #3).

---

## Traits

**`src/models/Traits.ts`** — 27 composable interfaces that add capabilities to models. Models implement traits by including their fields.

### Identity & Description

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Nameable** | `name: string \| null` | Anything with a display name |
| **Subnameable** | `subname: string \| null` | Secondary name (subtitle, alt name) |
| **Describable** | `description: string \| null` | Anything needing a text description |
| **Identifiable** | `identifier: string \| null` | External ID, slug, or code |

### Ordering & Position

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Indexable** | `index: number` | Array position within a collection |
| **Rankable** | `rank: number` | Priority/weight independent of position |

### Presentation

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Colorable** | `color: string \| null` | Hex color for UI rendering |
| **Imageable** | `images: Image[]` | Anything with photos or icons |

### State

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Statusable** | `status: string` | Lifecycle state tracking |
| **Noteable** | `notes: string[]` | Quick annotations |

### Commerce

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Chargeable** | `amount: number` | Anything with a price (cents) |
| **Saleable** | `amount: number`, `taxable: boolean` | Chargeable + tax awareness |
| **Addressable** | `address1`, `address2`, `city`, `state`, `zip` | Physical address |

### Metadata & Classification

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Metadatable** | `metadata: MetadataEntry[]` | Key-value pairs with data classification |
| **Taggable** | `tags: { id, title }[]` | Categorization labels |
| **Typeable** | `entityClassification: EntityType \| null` | Semantic classification (person, place, thing, idea, event, location, result, action, state, quantity, rule, signal) |

`MetadataEntry`: `{ key: string, value: string, classification: DataClassification }`
`DataClassification`: `'primary' | 'meta' | 'extended' | 'derived' | 'system'`

### Polymorphic Reference

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Polymorphic** | `entityId: string \| null`, `entityType: string \| null` | Attach to any entity without foreign keys |

### Lifespan

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Expirable** | `expiresAt`, `maxUses`, `currentUses`, `consumeOnRead`, `ttl` | Time-limited or usage-limited resources |

### Files

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Attachable** | `attachments: { id, url, name, type, size? }[]` | File attachments |

### Geography

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Locatable** | `latitude`, `longitude`, `altitude`, `accuracy`, `address` | GPS-positioned entities |

### Permissions

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Accessible** | `access: 'public' \| 'private' \| 'restricted' \| 'shared'`, `accessConditions: string \| null` | Visibility/permission control |

### Provenance

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Sourceable** | `sourceType`, `sourceId`, `sourceParty` | Data lineage — where it came from |
| **Validatable** | `validity`, `confidence`, `validFrom`, `validUntil`, `verifiedBy` | Trust/accuracy tracking |

### Security

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Securable** | `hash`, `locked: boolean`, `signedBy`, `signatureKey` | Integrity verification, tamper detection |

### Substitution

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Interchangeable** | `substitutes: { entityId, entityType, compatibility, bidirectional }[]` | Product alternatives, fallback options |

### Navigation

| Trait | Fields | Use Case |
|-------|--------|----------|
| **Linkable** | `url`, `deepLink`, `shortLink`, `apiPath` | External/internal URI references |

---

## Primitives

Small, self-contained models used as building blocks inside larger models.

### Tag

**`src/models/Tag.ts`** — Simple categorization label. Ubiquitous — imported by 30+ models.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `color` | `string` | Hex, default `#6b7280` |
| `title` | `string \| null` | Display text |

**Collection:** `tags`

### Image

**`src/models/Image.ts`** — Photo or icon reference with blurhash for progressive loading.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `value` | `string \| null` | URL |
| `blurhash` | `string \| null` | Blurhash encoding for placeholder |
| `position` | `number` | Display order |

**Used by:** Business, Product, Unit, Container, Context, Unifier, and any model implementing Imageable.

### Measurement

**`src/models/Measurement.ts`** — Physical dimensions with typed units.

**Types:**
- `Measure<U>` — generic `{ value: number, unit: U }`
- `LengthUnit`: mm, cm, m, in, ft
- `WeightUnit`: g, kg, oz, lb
- `VolumeUnit`: ml, l, floz, gal

**Dimensions class:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `width` | `Measure<LengthUnit> \| null` | |
| `height` | `Measure<LengthUnit> \| null` | |
| `depth` | `Measure<LengthUnit> \| null` | |
| `weight` | `Measure<WeightUnit> \| null` | |

**Used by:** Product, Unit.

### Note

**`src/models/Note.ts`** — Polymorphic annotation attached to any entity. Has its own audit timestamps and metadata.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `info` | `string \| null` | Content |
| `noteableId` | `string \| null` | Entity being annotated |
| `noteableType` | `string \| null` | Entity type |
| `userId` | `string \| null` | Author |
| `metadata` | `MetadataEntry[]` | |
| `createdAt`, `createdBy`, `updatedAt`, `deletedAt` | `string \| null` | Audit fields |

**Collection:** `notes`
**Use case:** Comments, annotations, internal memos on any record.

### Identifier

**`src/models/Identifier.ts`** — A way to distinguish entities — barcodes, QR codes, SKUs, RFID tags.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `type` | `string` | barcode, qr, rfid, sku, label, visual, description, reference |
| `value` | `string \| null` | The code/value |
| `symbology` | `BarcodeSymbology \| null` | AZTEC, CODE128, EAN13, QR, UPC_A, etc. (13 total) |
| `referenceType` | `string \| null` | Model being referenced |
| `referenceId` | `string \| null` | |
| `detectable` | `boolean` | Can be scanned/detected |
| `position` | `number` | Display order |

**Used by:** Product, Unit, Unifier.

---

## Structure & Topology

Models that organize entities into hierarchies, graphs, and spatial layouts.

### Scope

**`src/models/Scope.ts`** — Defines what is affected downstream. The boundary model — controls regional, linguistic, and access constraints.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `parentId` | `string \| null` | Hierarchy |
| `children` | `string[]` | Child scope IDs |
| `country` | `string \| null` | Regional |
| `regionCode` | `string \| null` | |
| `language` | `string \| null` | |
| `timezone` | `string \| null` | |
| `currency` | `string \| null` | |
| `access` | `string \| null` | |
| `entityId`, `entityType` | `string \| null` | Polymorphic ref |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `scopes`
**Relationships:** Referenced by View, ViewGroup, Navigation, Protocol, Set, AgentFlow, and any scoped model via `scopeId`.
**Use case:** Multi-tenant boundaries, regional catalogs, language-specific content, franchise scoping.

### Context

**`src/models/Context.ts`** — Display, scoping, and presentation metadata. The "lens" through which data is viewed.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `key` | `string \| null` | Lookup key |
| `description` | `string \| null` | |
| `parentId` | `string \| null` | Hierarchy |
| `images` | `Image[]` | |
| `params` | `Record<string, string>` | Custom parameters |
| `position` | `number` | |
| `public` | `boolean` | |
| `approval` | `string \| null` | |
| `implications` | `string \| null` | Side effects description |
| `questions` | `string[]` | Outstanding questions |
| `filter` | `string \| null` | Filter definition |
| `sort` | `string \| null` | Sort definition |
| `scope`, `scopeId` | `string \| null` | |
| `language` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `contexts`
**Relationships:** Referenced by View, Navigation, Protocol, FinancialTerm, TimeTerm, AgentFlow, and any context-aware model via `contextId`.
**Use case:** Menu contexts (dine-in vs takeout), catalog views (wholesale vs retail), app screens that filter/sort differently.

### Group

**`src/models/Group.ts`** — Declares that things belong together. Lightweight grouping without the boundary semantics of Scope.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `parentId` | `string \| null` | Hierarchy |
| `entityId`, `entityType` | `string \| null` | Polymorphic ref |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `groups`
**Relationships:** Referenced by Unifier via `groupIds`.
**Use case:** Product categories, department groupings, logical bundles.

### Set

**`src/models/Set.ts`** — Bounded, complete collection within a scope. Unlike Group, a Set is definitive — it says "this is ALL of them."

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `scopeId` | `string \| null` | Bounded to scope |
| `complete` | `boolean` | Is this the exhaustive list? |
| `maxSize` | `number \| null` | Unlimited if null |
| `closed` | `boolean` | No more additions allowed |
| `members` | `string[]` | Entity IDs |
| `memberType` | `string \| null` | Type of entities in set |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `sets`
**Use case:** "All registers in store #5", "Complete size run for SKU X", "All payment methods accepted."

### Unifier

**`src/models/Unifier.ts`** — Defines what makes a variant distinct from its siblings. The model that says "these are the same thing, except..."

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `groupIds` | `string[]` | Groups this variant belongs to |
| `scopeIds` | `string[]` | Scopes affected |
| `identifiers` | `Identifier[]` | How to tell apart |
| `differences` | `Record<string, string>` | Unique properties |
| `similarities` | `Record<string, string>` | Shared properties |
| `images` | `Image[]` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |
| `contextId` | `string \| null` | |

**Collection:** `unifiers`
**Use case:** Color/size variants of a product, regional versions of a menu item, localized editions.

### Relationship

**`src/models/Relationship.ts`** — Typed edge between any two entities. The explicit graph connector.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `sourceId` | `string` | Origin entity |
| `sourceType` | `string \| null` | |
| `targetId` | `string` | Destination entity |
| `targetType` | `string \| null` | |
| `type` | `RelationshipType` | parent, child, sibling, dependency, composition, association, reference, sequence, alternative, extension, override, mirror |
| `description` | `string \| null` | |
| `weight` | `number \| null` | 0-1 strength |
| `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `relationships`
**Relationships:** Referenced by Map via `relationshipIds`.
**Use case:** Product → ingredient dependencies, menu item → add-on associations, recipe → step sequences.

### Map

**`src/models/Map.ts`** — Topology of relationships. A positioned graph with a gravitational center and orbital layers (galaxy model).

**MapNode** (positioned entity):

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `entityId` | `string` | What entity |
| `entityType` | `string \| null` | |
| `layer` | `number` | Orbital distance from center |
| `position` | `number` | Position within layer |
| `label` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |

**Map** (the topology):

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `centerId` | `string \| null` | Gravitational anchor |
| `centerType` | `string \| null` | |
| `nodes` | `MapNode[]` | Positioned entities |
| `relationshipIds` | `string[]` | Edge definitions |
| `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `maps`
**Use case:** Ingredient relationship maps, supply chain topologies, org charts, knowledge graphs.

### Grid

**`src/models/Grid.ts`** — Spatial layout system. Fixed-position slots for entities.

**GridSlot:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `index` | `number` | Position |
| `productId` | `string \| null` | What product occupies this slot |
| `metadata` | `MetadataEntry[]` | |

**Grid:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title` | `string \| null` | |
| `slots` | `GridSlot[]` | |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `grids`
**Use case:** POS button layouts, warehouse bin maps, planograms, seating charts.

### Queue

**`src/models/Queue.ts`** — Ordered waiting line with FIFO, LIFO, or priority ordering.

**QueueItem:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `entityId` | `string` | What's waiting |
| `entityType` | `string \| null` | |
| `priority` | `number` | For priority ordering |
| `metadata` | `MetadataEntry[]` | |
| `enqueuedAt` | `string` | When added |
| `dequeuedAt` | `string \| null` | When removed |

**Queue:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `order` | `QueueOrder` | fifo, lifo, priority |
| `items` | `QueueItem[]` | |
| `maxSize` | `number \| null` | |
| `processingId` | `string \| null` | Currently processing |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `queues`
**Use case:** Order preparation queues, print job queues, approval workflows, customer wait lists.

### Thread

**`src/models/Thread.ts`** — Conversation chain. First-class entity for messaging between people, agents, and systems.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title` | `string \| null` | |
| `participantIds` | `string[]` | All parties |
| `rootMessageId` | `string \| null` | First message |
| `latestMessageId` | `string \| null` | For preview |
| `messageCount` | `number` | |
| `unreadCounts` | `Record<string, number>` | Per participant |
| `state` | `'active' \| 'archived' \| 'closed'` | |
| `participantTypes` | `string[]` | person, agent, cli, system |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `threads`
**Use case:** Support conversations, agent-human chat, internal notes threads, audit discussion chains.

---

## Data Operations

Models that describe how to query, sort, and audit data.

### Filter

**`src/models/Filter.ts`** — Selection rule. One field + one operator + one value.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `field` | `string` | Field path to filter on |
| `operator` | `FilterOperator` | eq, neq, gt, gte, lt, lte, contains, startsWith, endsWith, in, notIn, between, isNull, isNotNull, exists, regex |
| `value` | `string \| null` | Comparison value |
| `valueTo` | `string \| null` | Upper bound for `between` |

**Used by:** View (via `filterIds`), Context (via `filter`).
**Use case:** "Show only active products", "Price between 10-50", "Name contains 'organic'".

### Sort

**`src/models/Sort.ts`** — Ordering rule. Chain multiple for multi-column sorting.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `field` | `string` | Field to sort by |
| `direction` | `SortDirection` | asc, desc |
| `priority` | `number` | Lower runs first when chained |

**Used by:** View (via `sortIds`), Context (via `sort`).
**Use case:** "Sort by price ascending, then name", "Most recent first".

### Log

**`src/models/Log.ts`** — Immutable append-only change record. Audit trail for any entity.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `entityId` | `string` | What changed |
| `entityType` | `string \| null` | |
| `level` | `LogLevel` | field, entity, access, derivation, system, status |
| `actorId` | `string \| null` | Who made the change |
| `actorType` | `string \| null` | |
| `field` | `string \| null` | Which field |
| `fromValue` | `string \| null` | Previous value |
| `toValue` | `string \| null` | New value |
| `action` | `string` | create, update, delete, read, export, share, transition |
| `reason` | `string \| null` | |
| `timestamp` | `string` | |
| `metadata` | `MetadataEntry[]` | |

**Use case:** Audit trails, compliance records, change history, undo support.

---

## Operations

Models that define what the system can do — functions, instructions, interactions, and protocols.

### Function

**`src/models/Function.ts`** — Complete operation definition with typed inputs and outputs.

**FunctionParam:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `type` | `string` | Expected type |
| `required` | `boolean` | |
| `defaultValue` | `string \| null` | |
| `description` | `string \| null` | |

**Function:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `operation` | `string` | create, read, update, delete, transform, validate, compute, etc. |
| `inputs` | `FunctionParam[]` | |
| `outputs` | `FunctionParam[]` | |
| `transform` | `string \| null` | Logic description/reference |
| `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `functions`
**Relationships:** Referenced by Interaction (via `functionId`), NavigationNode (via `badgeFunctionId`).
**Use case:** "Calculate tax", "Apply discount", "Validate inventory count", "Generate report".

### Instruction

**`src/models/Instruction.ts`** — Directive to be followed. Ordered steps with conditions and timing.

**InstructionStep:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `action` | `string` | What to do |
| `position` | `number` | Order |
| `condition` | `string \| null` | When to execute |
| `optional` | `boolean` | |
| `duration` | `number \| null` | Expected ms |
| `metadata` | `MetadataEntry[]` | |

**Instruction:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `steps` | `InstructionStep[]` | |
| `targetType` | `string \| null` | Who this is for |
| `sequential` | `boolean` | Must follow order? |
| `exhaustive` | `boolean` | Must complete all? |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `instructions`
**Use case:** Recipes, onboarding guides, opening/closing procedures, assembly instructions.

### Prompt

**`src/models/Prompt.ts`** — Structured request for a decision. The model for asking questions with defined answer options.

**PromptOption:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `label` | `string` | Display text |
| `value` | `string` | Stored value |
| `description` | `string \| null` | |
| `position` | `number` | |
| `amount` | `number` | Fixed price modifier |
| `percent` | `number` | Percentage modifier (0-1) |
| `metadata` | `MetadataEntry[]` | |

**Prompt:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title` | `string \| null` | |
| `message` | `string \| null` | |
| `method` | `PromptMethod` | select, multiselect, input, confirm |
| `options` | `PromptOption[]` | |
| `response` | `string \| null` | Selected response |
| `targetId`, `targetType` | `string \| null` | Who it targets |
| `askerId` | `string \| null` | Who asked |
| `answered` | `boolean` | |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `prompts`
**Relationships:** Referenced by Interaction (via `promptId`).
**Use case:** "How would you like your steak cooked?", "Add extra cheese? (+$1.50)", modifier selection at POS.

### Interaction

**`src/models/Interaction.ts`** — Maps a user gesture to an operation. The bridge between UI input and system action.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `gesture` | `GestureType` | tap, longPress, doubleTap, swipeLeft/Right/Up/Down, pinch, drag, pull, hover, focus, blur |
| `entityType` | `string \| null` | Applies to what |
| `viewId` | `string \| null` | Scoped to view |
| `functionId` | `string \| null` | Execute function |
| `promptId` | `string \| null` | Show prompt |
| `requiresConfirmation` | `boolean` | |
| `feedback` | `'haptic' \| 'sound' \| 'visual' \| 'none'` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `interactions`
**Relationships:** References Function, Prompt, View.
**Use case:** "Tap product → add to cart", "Long press → show details", "Swipe left → delete".

### Protocol

**`src/models/Protocol.ts`** — Set of rules governing behavior. The constraint/governance layer.

**ProtocolRule:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `subject` | `string` | What it governs |
| `rule` | `string` | The rule statement |
| `enforcement` | `string \| null` | On violation |
| `priority` | `number` | Lower = higher priority |
| `mandatory` | `boolean` | |
| `metadata` | `MetadataEntry[]` | |

**Protocol:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `rules` | `ProtocolRule[]` | |
| `appliesTo` | `string \| null` | What entities/interactions |
| `strict` | `boolean` | All rules required? |
| `version` | `string \| null` | |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `protocols`
**Use case:** Return policies, discount rules, inventory restock thresholds, access control policies.

### Handshake

**`src/models/Handshake.ts`** — Mutual agreement protocol. Multi-party consensus with proposed changes.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `action` | `string` | What this is about |
| `entityId`, `entityType` | `string \| null` | |
| `initiatorId` | `string \| null` | Who started it |
| `parties` | `string[]` | All involved |
| `agreedBy` | `string[]` | Who has agreed |
| `rejectedBy` | `string[]` | Who rejected |
| `status` | `HandshakeStatus` | pending, approved, rejected, countered, expired, cancelled |
| `unanimous` | `boolean` | All must agree? |
| `message` | `string \| null` | |
| `changes` | `Record<string, { from, to }>` | Proposed changes |
| `expiresAt` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `handshakes`
**Use case:** Price change approvals, inventory write-off authorization, multi-manager sign-off, vendor negotiations.

### Async

**`src/models/Async.ts`** — Operation that doesn't resolve immediately. The Promise pattern as a data model.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `status` | `AsyncStatus` | pending, active, resolved, rejected, cancelled, timeout |
| `entityId`, `entityType` | `string \| null` | What operation is for |
| `result` | `string \| null` | Payload on resolution |
| `error` | `string \| null` | On rejection |
| `timeout` | `number` | ms, 0 = no timeout |
| `callbackId` | `string \| null` | Entity to notify |
| `metadata` | `MetadataEntry[]` | |
| `resolvedAt` | `string \| null` | |

**Collection:** `asyncs`
**Use case:** Payment processing, external API calls, long-running reports, webhook callbacks.

---

## Views & Navigation

Models that define how data is displayed and how users move through the application.

### View

**`src/models/View.ts`** — Saved perspective on data. Combines filters, sorts, and styling into a reusable lens.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `entityType` | `string \| null` | What type this shows |
| `filterIds` | `string[]` | Applied filters |
| `sortIds` | `string[]` | Applied sorts |
| `styleId` | `string \| null` | Rendering style |
| `limit` | `number \| null` | Max items |
| `icon` | `string \| null` | Tab/nav display |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `views`
**Relationships:** References Filter, Sort, Style. Referenced by ViewGroup, ViewState, Interaction, NavigationNode.
**Use case:** "Active products sorted by name", "Today's orders newest first", "Low stock items".

### ViewGroup

**`src/models/ViewGroup.ts`** — Ordered collection of Views with layout control.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `viewIds` | `string[]` | Ordered views |
| `defaultViewId` | `string \| null` | Active on load |
| `layout` | `'tabs' \| 'sections' \| 'grid' \| 'stack'` | |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `view_groups`
**Use case:** Tab bar with Products/Orders/Settings views, dashboard sections, report groupings.

### ViewState

**`src/models/ViewState.ts`** — Runtime snapshot of a View's condition. Per-user ephemeral state.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `viewId` | `string` | Which view |
| `ownerId` | `string \| null` | User/session |
| `state` | `'idle' \| 'loading' \| 'error' \| 'empty' \| 'active'` | |
| `selectedId` | `string \| null` | Currently selected |
| `expandedIds` | `string[]` | Expanded sections |
| `scrollPosition` | `number` | 0-1 percentage |
| `activeFilterIds` | `string[]` | Runtime filter overrides |
| `error` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `view_states`
**Use case:** Remembering where a user left off, restoring scroll position, preserving selections across sessions.

### Navigation

**`src/models/Navigation.ts`** — How to move between views. Defines the app's navigation graph.

**NavigationNode:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `targetId` | `string` | View/ViewGroup ID |
| `targetType` | `'view' \| 'viewGroup' \| 'screen'` | |
| `label` | `string \| null` | |
| `icon` | `string \| null` | |
| `badgeFunctionId` | `string \| null` | Badge count function |
| `position` | `number` | |
| `metadata` | `MetadataEntry[]` | |

**Navigation:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `type` | `NavigationType` | stack, tab, modal, drawer, replace |
| `nodes` | `NavigationNode[]` | |
| `defaultNodeId` | `string \| null` | Default screen |
| `transition` | `'slide' \| 'fade' \| 'none' \| null` | |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `navigations`
**Use case:** Tab bar navigation, drawer menu, modal presentation flows, deep link routing.

### Style

**`src/models/Style.ts`** — Presentation template. Maps model fields to output format (receipt, card, label, JSON, etc.).

**StyleField:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `source` | `string` | Field path (e.g. `name`, `price.value`) |
| `label` | `string \| null` | |
| `format` | `string \| null` | `$%.2f`, `uppercase`, `date:short` |
| `position` | `number` | |
| `visible` | `boolean` | |
| `link` | `string \| null` | Template for linked target |

**Style:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `entityType` | `string \| null` | Applies to |
| `fields` | `StyleField[]` | Field mappings |
| `target` | `StyleTarget` | plain, print, markup, markdown, linked, csv, json, label, receipt, card, summary |
| `template` | `string \| null` | Complex layout with `{fieldId}` placeholders |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `styles`
**Use case:** Receipt printing, product label generation, CSV export, card-view rendering, API response shaping.

---

## Financial

### FinancialTerm

**`src/models/FinancialTerm.ts`** — Typed, directional monetary operation. Every financial concept is a term with a direction (up/down) and magnitude (percentage/absolute).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `term` | `FinancialTermType` | 90+ values: charge, payment, credit, fee, tax, discount, tip, commission, refund, subscription, etc. |
| `direction` | `FinancialDirection` | up (adds), down (subtracts) |
| `magnitudeType` | `MagnitudeType` | percentage, absolute |
| `value` | `number` | Amount or percentage |
| `references` | `string[]` | Other FinancialTerm IDs (for chaining) |
| `logicFunction` | `string \| null` | How it computes |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `financial_terms`
**Use case:** Tax rates, discount rules, commission structures, fee schedules, pricing tiers. Chain references for complex calculations (e.g., subtotal → tax → tip).

---

## Time

### TimeTerm

**`src/models/TimeTerm.ts`** — Typed, directional time operation. The temporal analog to FinancialTerm.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `term` | `TimeTermType` | deadline, duration, extension, delay, buffer, window, blackout, cooldown, expiration, renewal, grace, overtime, leadTime, lag, sprint, milestone, cadence, cap, floor, ttl, retention, embargo, countdown, interval, schedule |
| `direction` | `TimeDirection` | extend, reduce |
| `magnitudeType` | `TimeMagnitude` | absolute (ms), relative (multiplier) |
| `value` | `number` | |
| `references` | `string[]` | Other TimeTerm IDs |
| `logicFunction` | `string \| null` | |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `time_terms`
**Use case:** Delivery windows, return period deadlines, subscription renewal cadences, shift overtime rules, order prep time estimates.

---

## Agent & Automation

### AgentFlow

**`src/models/AgentFlow.ts`** — Processing pipeline of agents with gate conditions (pass/loop/conditional).

**FlowAgent:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `agentId` | `string \| null` | References agent config |
| `role` | `AgentRole` | collector, categorizer, summarizer, analyzer, rulemaker, planner, writer, reviewer, deployer, custom |
| `name` | `string \| null` | |
| `gate` | `GateCondition` | pass, loop, conditional |
| `gateCondition` | `string \| null` | For conditional gates |
| `passTo` | `string[]` | Next agent IDs on pass |
| `loopTo` | `string \| null` | Loop back target |
| `position` | `number` | |
| `metadata` | `MetadataEntry[]` | |

**AgentFlow:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `name` | `string \| null` | |
| `description` | `string \| null` | |
| `agents` | `FlowAgent[]` | Pipeline stages |
| `refreshInterval` | `number` | Seconds, 0 = manual |
| `timeTermId` | `string \| null` | Refresh cadence |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `agent_flows`
**Use case:** Data ingestion pipelines (collect → categorize → summarize → analyze → rules), content moderation flows, automated reporting chains.

### Improvement

**`src/models/Improvement.ts`** — Unit of data in the refinement pipeline. Tracks content through stages from raw input to actionable rules.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `stage` | `ImprovementStage` | raw, categorized, summarized, analyzed, rule |
| `category` | `DataCategory \| null` | code, command, question, plan, error, output, decision, observation, configuration, conversation, metric |
| `content` | `string` | The content at current stage |
| `producerId` | `string \| null` | Agent/process that created it |
| `sourceIds` | `string[]` | Source Improvement IDs |
| `scopeId`, `contextId` | `string \| null` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `improvements`
**Use case:** Agent learning pipelines — raw observations get categorized, summarized, analyzed, and distilled into rules that feed back into system behavior.

---

## Compound Models

Domain-specific compositions that combine primitives for the commerce/POS domain. Located in `src/compound/`.

### Business

**`src/compound/Business.ts`** — Merchant/store entity. The top-level organizational unit for the POS system.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title` | `string \| null` | Store name |
| `info` | `string \| null` | Description |
| `email`, `phone` | `string \| null` | Contact |
| `address1`, `address2`, `city`, `state`, `zip` | `string \| null` | Location |
| `images` | `Image[]` | Logo, photos |
| `stripeAccountId` | `string \| null` | Stripe Connect |
| `taxAmount` | `number` | Default tax (cents) |
| `taxPercent` | `number` | Default tax rate |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `businesses`
**Relationships:** Referenced by Product, Order, Unit, Reader, Till via `businessId`.
**Use case:** Store configuration, multi-location management, Stripe Connect integration.

### Product

**`src/compound/Product.ts`** — Sellable item definition. What something IS, independent of individual inventory instances.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title`, `subtitle` | `string \| null` | |
| `description` | `string \| null` | |
| `sku` | `string \| null` | Stock keeping unit |
| `catalogId` | `string \| null` | Catalog reference |
| `identifiers` | `Identifier[]` | Barcodes, SKUs |
| `images` | `Image[]` | |
| `dimensions` | `Dimensions \| null` | Physical size/weight |
| `taxable` | `boolean` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `products`
**Relationships:** Referenced by Unit (productId), OrderItem (productId), GridSlot (productId).
**Use case:** Product catalog entries, menu items, service definitions.

### Unit

**`src/compound/Unit.ts`** — Individual instance of a product. The actual physical item with lifecycle tracking.

**UnitStatus:** `{ id, value: 'active' | 'inactive' | 'pending' | 'audited' | 'sold' | 'returned' | 'damaged', createdAt }`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title`, `subtitle` | `string \| null` | |
| `description` | `string \| null` | |
| `amount` | `number` | Price (cents) |
| `sku` | `string \| null` | |
| `catalogId` | `string \| null` | |
| `productId` | `string \| null` | What product this is |
| `containerId` | `string \| null` | Physical storage |
| `identifiers` | `Identifier[]` | |
| `images` | `Image[]` | |
| `dimensions` | `Dimensions \| null` | |
| `statuses` | `UnitStatus[]` | Lifecycle tracking |
| `taxable` | `boolean` | |
| `metadata` | `MetadataEntry[]` | |
| `tags` | `Tag[]` | |

**Collection:** `units`
**Relationships:** References Product (productId), Container (containerId).
**Use case:** Individual inventory items, serialized goods, items with unique barcodes, lifecycle-tracked stock.

### Container

**`src/compound/Container.ts`** — Physical storage location. Boxes, bins, pallets, shelves.

**ContainerStatus:** `{ id, value: 'active' | 'inactive' | 'pending' | 'vacancy' | 'noVacancy', createdAt }`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title`, `subtitle` | `string \| null` | |
| `description` | `string \| null` | |
| `sku` | `string \| null` | |
| `images` | `Image[]` | |
| `statuses` | `ContainerStatus[]` | Vacancy tracking |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `containers`
**Relationships:** Referenced by Unit (containerId).
**Use case:** Warehouse bins, retail shelf positions, storage rooms, vehicle cargo areas.

### Order

**`src/compound/Order.ts`** — Complete sales transaction with line items, discounts, taxes, and payments.

**Child models:** OrderItem, OrderDiscount, OrderTax, OrderPayment (see fields above in full inventory).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `businessId` | `string \| null` | Which store |
| `items` | `OrderItem[]` | Line items (product snapshot) |
| `discounts` | `OrderDiscount[]` | Applied discounts |
| `taxes` | `OrderTax[]` | Tax lines |
| `payments` | `OrderPayment[]` | Payments (cash, card, gift card, etc.) |
| `metadata` | `MetadataEntry[]` | |
| `completedAt` | `string \| null` | |
| `heldAt` | `string \| null` | |

**Computed getters:** `status` (completed/noSale/held/pending), `quantity`, `taxablePretotal`, `nonTaxablePretotal`, `pretotal`, `taxTotal`, `discountTotal`, `paymentTotal`, `subtotal`, `total`, `due`.

**Collection:** `orders`
**Relationships:** References Business (businessId), Product (via OrderItem.productId).
**Use case:** Point-of-sale transactions, e-commerce orders, invoice generation.

### Till

**`src/compound/Till.ts`** — Cash register/drawer with correction-based balance tracking.

**TillCorrection:** `{ id, action: 'audit' | 'credit' | 'debit', amount, orderId?, correctedAt }`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title` | `string \| null` | |
| `businessId` | `string \| null` | |
| `corrections` | `TillCorrection[]` | Source of truth for balance |
| `metadata` | `MetadataEntry[]` | |

**Computed getter:** `balance` — calculated from most recent audit + subsequent credits/debits.

**Collection:** `tills`
**Use case:** Cash drawer management, end-of-day reconciliation, cash drops, audit trails.

### Reader

**`src/compound/Reader.ts`** — Payment terminal. Stripe Terminal integration.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `title` | `string \| null` | |
| `businessId` | `string \| null` | |
| `deviceType` | `ReaderDeviceType \| null` | verifone_P400, bbpos_wisepos_e, simulated_wisepos_e |
| `stripeReaderId` | `string \| null` | Stripe Terminal ID |
| `metadata` | `MetadataEntry[]` | |

**Collection:** `readers`
**Use case:** Registering and managing card terminals per store location.

### Timecard

**`src/compound/Timecard.ts`** — Work session record with correction and approval workflow.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | UUID |
| `userId` | `string \| null` | Who worked |
| `info` | `string \| null` | |
| `startedAt` | `string` | Clock in |
| `endedAt` | `string \| null` | Clock out |
| `startedCorrection` | `string \| null` | Override start |
| `endedCorrection` | `string \| null` | Override end |
| `status` | `TimecardStatus` | started, ended, corrected, approved, declined |
| `metadata` | `MetadataEntry[]` | |

**Computed getters:** `effectiveStart`, `effectiveEnd` — use correction if present, otherwise actual.

**Collection:** `timecards`
**Origin:** GameroomKit GKTimecard (2018).
**Use case:** Employee time tracking, shift management, payroll preparation.

---

## Model Relationships Graph

```
Business ← businessId ── Order, Till, Reader, (Unit, Product via scope)
Product  ← productId ── Unit, OrderItem, GridSlot
Container ← containerId ── Unit
Scope    ← scopeId ── View, ViewGroup, Navigation, Protocol, Set, AgentFlow, Instruction, Thread
Context  ← contextId ── View, Navigation, Protocol, FinancialTerm, TimeTerm, AgentFlow, Unifier, Instruction, Thread
Group    ← groupIds ── Unifier
View     ← viewId ── ViewState, Interaction; ← viewIds ── ViewGroup; ← targetId ── NavigationNode
Filter   ← filterIds ── View
Sort     ← sortIds ── View
Style    ← styleId ── View
Function ← functionId ── Interaction; ← badgeFunctionId ── NavigationNode
Prompt   ← promptId ── Interaction
Relationship ← relationshipIds ── Map
Tag      ← tags ── (30+ models, ubiquitous)
Image    ← images ── (10+ models)
Identifier ← identifiers ── Product, Unit, Unifier
Dimensions ← dimensions ── Product, Unit
MetadataEntry ← metadata ── (all models)
```

---

## Statistics

- **35 base models** (models/)
- **27 traits** (Traits.ts)
- **8 compound models** (compound/)
- **37 declared collections** (storable entities)
- **70 total exported types/classes**
