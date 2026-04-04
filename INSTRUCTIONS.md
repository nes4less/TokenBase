# Instruction Set

> **This file is reference context, not a task.** Composition recipes — how to build applications from TokenBase models. The recipe book that agents consume.

---

## How to Read a Recipe

Each recipe has:

- **Name** — what you're building
- **Pattern** — taco (standard, high validity) or choco taco (unexpected composition, lower validity)
- **Ingredients** — models used
- **Traits in play** — which trait interfaces matter
- **Steps** — how to assemble
- **Gotchas** — what goes wrong

**Validity** follows the Bandwidth model: most compositions have high confidence and flow with the stream. Outliers that deviate are valid but carry higher risk — the system doesn't block them, it makes the deviation visible.

**Stamped vs Assembled:** Models can be classified two ways. *Stamped* = Typeable trait applied directly (intrinsic identity). *Assembled* = classification derived through Context (contextual identity that may differ by where the entity appears). Both can coexist on the same entity.

---

## Pattern Library

### Screen Patterns

---

#### Product Detail Screen

**Pattern:** Taco
**Ingredients:** Product, Context, Style, Image, Identifier, Unifier, Interaction
**Traits:** Nameable, Describable, Imageable, Taggable, Identifiable

**Steps:**
1. Load `Product` by ID
2. Load its `Context` (determines presentation lens — retail vs wholesale, dine-in vs takeout)
3. Load `Style` from `Context.styleId` (or from associated View) — this maps fields to output format
4. Load `Unifier` records where `groupIds` includes the product's group — these are variants (color, size)
5. Load `Identifier` records for barcode/QR display
6. Load `Interaction` records scoped to this View — these define what gestures do (tap → add to cart, long press → details)
7. Render using Style field mappings

**Gotchas:**
- Product has no price field — price lives on `Unit.amount`. A Product is what something IS; a Unit is what you sell. Don't confuse them.
- Images come from both Product.images and Unifier.images — variant images override product images when present.
- Context's `filter` and `sort` fields can change which Units are visible for the same Product.

---

#### Product Catalog Screen

**Pattern:** Taco
**Ingredients:** View, ViewGroup, Filter, Sort, Style, Product, Context, Navigation
**Traits:** Searchable (via Filter), Filterable, Describable

**Steps:**
1. Load `Navigation` for the current screen — determines how user got here and what's adjacent
2. Load `ViewGroup` — this is the tab/section layout (e.g., "All Products" | "By Category" | "Low Stock")
3. Load each `View` in the ViewGroup
4. For each View: load its `Filter` records (applied selection criteria) and `Sort` records (ordering)
5. Query `Product` collection with Filter + Sort applied
6. Load `Style` for the View — determines card/list/grid rendering
7. Load `Context` for scope-specific presentation (language, region, access level)
8. Attach `Interaction` records to each rendered item

**Gotchas:**
- View.limit caps the result set — pagination needs ViewState.scrollPosition to track where the user is
- ViewGroup.layout determines the container: tabs, sections, grid, or stack. Don't hardcode tab bars.
- Filter uses operators like `between`, `in`, `regex` — not just simple equality. Check the operator.

---

#### Dashboard Screen

**Pattern:** Taco
**Ingredients:** ViewGroup, View, Function, Style, Filter, Sort, Navigation
**Traits:** Statusable, Describable, Taggable

**Steps:**
1. Load `Navigation` (type: tab) — this is the main nav structure
2. Load `ViewGroup` (layout: sections) — dashboard panels
3. For each View in the group: load Filters, Sorts, and execute queries
4. For computed metrics: load `Function` records — each defines an operation (count, sum, average) with inputs/outputs
5. Apply `Style` per section — some panels are cards, some are tables, some are summary numbers
6. Load badge counts via `NavigationNode.badgeFunctionId` — these Functions compute tab badges

**Gotchas:**
- Don't compute metrics client-side. Use Function records — they define the computation and the agent executes them server-side.
- Dashboard views change by Context — a manager's dashboard shows different panels than a cashier's.

---

#### Settings Screen

**Pattern:** Taco
**Ingredients:** View, Prompt, Interaction, Protocol, Context, Scope
**Traits:** Accessible, Describable, Metadatable

**Steps:**
1. Load `View` for settings — entityType targets the configurable model (Business, User, etc.)
2. Load `Prompt` records — each setting is a structured question (select, input, confirm)
3. Load `Protocol` — validation rules that constrain what settings are valid
4. Load `Interaction` records — map gestures to save/cancel/reset actions
5. Load `Scope` — determines which settings this user can see and modify
6. Render Prompts as form fields, validate against Protocol rules

**Gotchas:**
- Protocol.strict means ALL rules must pass before saving. Don't allow partial saves on strict protocols.
- Scope controls visibility — a franchise location may have settings that corporate can see but they can't modify.

---

### Data Flow Patterns

---

#### CRUD API Endpoint

**Pattern:** Taco
**Ingredients:** Function, Filter, Sort, Scope, Protocol, Log, Handshake
**Traits:** Validatable, Sourceable, Accessible

**Steps:**
1. Define `Function` — operation type (create, read, update, delete), inputs, outputs
2. On read: apply `Filter` + `Sort` from request, scoped by `Scope`
3. On write: validate against `Protocol` rules before persisting
4. On write: create `Log` entry (action, actor, field changes, timestamp)
5. On destructive write: check for `Handshake` requirement — some mutations need multi-party approval
6. Return shaped by `Style` if output formatting is needed

**Gotchas:**
- Every write MUST create a Log. No silent mutations. This is non-negotiable for the audit trail.
- Handshake check happens BEFORE the write, not after. If a Handshake is required and status isn't `approved`, reject.
- Scope filtering happens at query time, not post-query. Don't fetch everything and filter client-side.

---

#### Financial Transaction Flow

**Pattern:** Taco
**Ingredients:** Order, OrderItem, FinancialTerm, Handshake, Log, Function, Till
**Traits:** Chargeable, Saleable

**Steps:**
1. Build `Order` — add `OrderItem` entries (each snapshots the Product at point of sale)
2. Load `FinancialTerm` chain for the business — these define tax, discount, fee, commission in order
3. Walk the chain: each term references others via `references[]`. Direction (up/down) and magnitudeType (percentage/absolute) determine computation
4. Apply: pretotal → taxes (FinancialTerm where term='tax') → discounts → fees → subtotal → total → due
5. Process payment — create `OrderPayment` entries
6. If cash: update `Till` with a credit correction
7. Log the entire transaction
8. If order requires approval (high value, unusual discount): create `Handshake`

**Gotchas:**
- FinancialTerm chains can be circular if references are misconfigured. Walk with a visited set.
- Order has computed getters (total, due, taxTotal, etc.) — don't recalculate manually, use the model's getters.
- OrderItem snapshots product data at time of sale. Don't reference the live Product — prices change.
- Till balance is computed from corrections, not stored directly. The most recent `audit` correction is the baseline.

---

#### Approval Workflow

**Pattern:** Taco
**Ingredients:** Handshake, Async, Prompt, Log, Protocol, Function
**Traits:** Expirable, Statusable

**Steps:**
1. Action triggers approval need (detected by Protocol rule)
2. Create `Handshake` — list parties, set unanimous flag, attach proposed changes
3. Create `Async` record — status: pending, timeout set from Protocol or TimeTerm
4. Notify each party via `Prompt` (method: confirm, options: approve/reject)
5. As responses come in: update `Handshake.agreedBy` / `rejectedBy`
6. When threshold met (unanimous or majority): update Handshake status
7. If approved: execute the pending `Function`, create Log entry
8. If rejected or expired: log rejection, update Async status to rejected/timeout

**Gotchas:**
- Handshake.unanimous means ALL parties must agree. One rejection = rejected.
- Async.timeout of 0 means no timeout — the Handshake waits forever. Probably not what you want.
- Don't execute the action optimistically. Wait for Handshake resolution.

---

#### Data Ingestion Pipeline

**Pattern:** Taco
**Ingredients:** AgentFlow, FlowAgent, Improvement, Queue, Log, Filter
**Traits:** Sourceable, Validatable, Taggable

**Steps:**
1. Define `AgentFlow` — pipeline of `FlowAgent` stages
2. Typical pipeline: collector (raw) → categorizer → summarizer → analyzer → rulemaker
3. Each stage reads from `Queue` (previous stage's output) and writes `Improvement` records at the next stage
4. Improvement.stage tracks position: raw → categorized → summarized → analyzed → rule
5. Gate conditions on FlowAgent control flow: pass (continue), loop (retry), conditional (branch)
6. Final stage produces rules that feed back into system behavior (Protocol rules, Function definitions)
7. Every stage creates Log entries

**Gotchas:**
- AgentFlow.refreshInterval controls automatic re-runs. 0 = manual trigger only.
- FlowAgent.gate = 'loop' without a termination condition creates an infinite loop. Always pair with a conditional or max iterations.
- Improvement.sourceIds creates the lineage chain — every output traces back to its raw input.

---

### Navigation Patterns

---

#### Tab-Based App

**Pattern:** Taco
**Ingredients:** Navigation, NavigationNode, ViewGroup, View, Function
**Traits:** Nameable, Describable

**Steps:**
1. Create `Navigation` (type: tab) — the root nav
2. Add `NavigationNode` entries — each points to a View or ViewGroup
3. Set icons, labels, positions on each node
4. For badge counts: set `badgeFunctionId` — the Function computes the count (e.g., unread orders)
5. Set `defaultNodeId` — where the app lands on open
6. Each node's target View/ViewGroup handles its own content

**Gotchas:**
- NavigationNode.targetType can be 'view', 'viewGroup', or 'screen'. A screen is a custom destination not backed by a View.
- Transition ('slide', 'fade', 'none') applies to the whole Navigation, not per-node.

---

#### Modal Flow

**Pattern:** Taco
**Ingredients:** Navigation, View, Prompt, Interaction, Function
**Traits:** Statusable

**Steps:**
1. Create `Navigation` (type: modal) — this is a self-contained flow that overlays the current screen
2. Add NavigationNodes for each step (e.g., enter details → confirm → success)
3. Each step is a View with Prompt records for input collection
4. Interaction records handle forward/back/dismiss gestures
5. Final step executes a Function (the actual action)
6. Transition: 'slide' for card-style, 'fade' for overlay

**Gotchas:**
- Modal navigations should be short (2-4 steps). If it's more, use a stack navigation.
- Don't forget the dismiss interaction — users need to exit without completing.

---

### Inventory & Storage Patterns

---

#### Inventory Management

**Pattern:** Taco
**Ingredients:** Product, Unit, Container, Grid, Set, View, Filter, Sort, Identifier, Log
**Traits:** Statusable, Identifiable, Taggable

**Steps:**
1. `Product` defines what things are — title, description, SKU, dimensions
2. `Unit` tracks individual instances — each has a status lifecycle (active → sold → returned → damaged)
3. `Container` defines where Units physically are — bins, shelves, pallets
4. `Grid` defines spatial layouts — planograms, bin maps, warehouse sections
5. `Set` defines bounded collections — "all units in store #5", "complete size run for SKU X"
6. `View` + `Filter` + `Sort` creates the lens — "show active units sorted by container"
7. `Identifier` enables scanning — barcode on each Unit, QR code on each Container
8. Every move, status change, and count creates a `Log` entry

**Gotchas:**
- Product vs Unit: Product is the blueprint. Unit is the thing in your hand. One Product, many Units.
- Unit.statuses is an array — it's a lifecycle history, not a single status. The last entry is current.
- Container.statuses tracks vacancy — a Container can be 'noVacancy' but still have an active status.
- Set.complete=true means this IS all of them. Use for audit — if the count doesn't match, something is wrong.

---

#### Barcode Scan Flow

**Pattern:** Taco
**Ingredients:** Identifier, Unit, Product, Function, Interaction, View, Log
**Traits:** Identifiable

**Steps:**
1. User triggers scan via `Interaction` (gesture: tap on scan button)
2. Camera/scanner captures code → look up `Identifier` by value + symbology
3. Identifier.referenceType tells you what was scanned (Unit, Product, Container)
4. Load the referenced entity by Identifier.referenceId
5. Execute appropriate `Function` based on context (add to order, update count, move container)
6. Log the scan event

**Gotchas:**
- Identifier.detectable=false means this code exists but shouldn't trigger scan actions (e.g., internal-only reference).
- Symbology matters — a UPC_A code and a CODE128 code with the same digits are different identifiers.
- Always check referenceType before assuming what was scanned.

---

### Communication Patterns

---

#### Messaging Thread

**Pattern:** Taco
**Ingredients:** Thread, Note, Prompt, Interaction, Async, Scope
**Traits:** Statusable, Polymorphic

**Steps:**
1. Create `Thread` — set participants, participantTypes (person, agent, cli, system)
2. Messages are `Note` records with noteableType='thread', noteableId=thread.id
3. Load messages sorted by createdAt
4. For agent responses: use `Async` — create pending, wait for agent, resolve with response
5. For decision points: inject `Prompt` into the thread (select, confirm)
6. Track read state via Thread.unreadCounts
7. Thread.state lifecycle: active → archived → closed

**Gotchas:**
- Thread.participantTypes allows mixed human/agent/system threads. The UI should render differently based on participantType.
- Note is polymorphic — it can attach to any entity, not just threads. Always check noteableType.
- unreadCounts is per-participant — each person has their own count.

---

### Time-Based Patterns

---

#### Scheduling System

**Pattern:** Taco
**Ingredients:** TimeTerm, Timecard, Queue, Protocol, Async, Log
**Traits:** Expirable, Statusable

**Steps:**
1. Define scheduling rules as `TimeTerm` chains — shift duration (term: duration), break windows (term: window), overtime thresholds (term: cap)
2. `Timecard` records actual work — startedAt, endedAt, corrections
3. `Protocol` defines scheduling constraints — max hours, required breaks, minimum gap between shifts
4. `Queue` manages shift assignments — workers queue for open slots
5. `Async` handles pending approvals — correction requests, swap requests
6. TimeTerm.references chains related terms — overtime kicks in after the cap, which references the base duration

**Gotchas:**
- Timecard.effectiveStart and effectiveEnd use corrections when present. Don't use raw startedAt/endedAt for payroll.
- TimeTerm direction matters: 'extend' adds time, 'reduce' shortens it. An overtime term extends; a break reduces.
- TimeTerm.magnitudeType: 'absolute' is milliseconds, 'relative' is a multiplier on the base term.

---

### Agent & Automation Patterns

---

#### Agent-Driven Workflow

**Pattern:** Taco
**Ingredients:** AgentFlow, FlowAgent, Instruction, Protocol, Handshake, Log, Async
**Traits:** Statusable, Validatable

**Steps:**
1. Define `AgentFlow` with ordered `FlowAgent` stages
2. Each FlowAgent has a role (collector, categorizer, summarizer, analyzer, rulemaker, planner, writer, reviewer, deployer)
3. Define `Instruction` for each stage — ordered steps with conditions
4. Set `Protocol` for the flow — rules that gate progression (e.g., "reviewer must approve before deployer runs")
5. Use `Handshake` at human-in-the-loop checkpoints — agent proposes, human approves
6. Track async operations via `Async` — some stages call external services
7. Every stage transition creates a `Log` entry

**Gotchas:**
- FlowAgent.gate controls flow: 'pass' continues, 'loop' retries (check loopTo), 'conditional' branches on gateCondition.
- Instruction.sequential=true means steps MUST execute in order. Don't parallelize sequential instructions.
- Instruction.exhaustive=true means ALL steps must complete. Don't skip optional steps in exhaustive instructions — they're not optional here.

---

#### Content Moderation Pipeline

**Pattern:** Taco
**Ingredients:** AgentFlow, Improvement, Filter, Protocol, Handshake, Queue, Log
**Traits:** Sourceable, Validatable, Taggable

**Steps:**
1. Content enters as raw `Improvement` (stage: raw, category: conversation/output)
2. First FlowAgent (collector) captures and queues
3. Second FlowAgent (categorizer) classifies — safe/flagged/escalate, updates Improvement.stage to categorized
4. Filter rules determine routing: safe → pass, flagged → analyzer, escalate → human review
5. Analyzer stage runs Protocol checks — content policies as ProtocolRules
6. Escalated content creates a Handshake — human must approve/reject
7. Terminal stage: published, removed, or modified

**Gotchas:**
- Don't skip the categorizer stage. Even obvious content should be classified — it feeds the rulemaker for future automation.
- Improvement.sourceIds maintains chain of custody. Every modification creates a new Improvement referencing the previous one.

---

## Anti-Patterns

### Things That Look Right But Break

---

**Don't use Group when you mean Scope.**
Group is a loose bucket. Scope is a boundary with regional, linguistic, and access constraints. "All products in the Pacific Northwest" is a Scope, not a Group. "Products that go well together" is a Group.

**Don't use Context when you mean Style.**
Context is the lens (what you see). Style is the template (how it renders). Changing Context changes WHAT data appears. Changing Style changes HOW the same data looks. A wholesale context shows different products. A receipt style shows the same products differently.

**Don't store price on Product.**
Product is what something IS. Unit is what you sell. Price (amount) lives on Unit, not Product. A Product can have Units at different prices (wholesale vs retail, by region, by condition).

**Don't use Note for structured data.**
Note is free-text annotation — comments, memos, observations. If the data has a defined shape, it's a model field or a MetadataEntry, not a Note.

**Don't use Metadata for core fields.**
MetadataEntry is for extensions — things that don't fit the model's core schema. If you're storing the same key on every record, it should be a model field. Metadata is classified (primary/meta/extended/derived/system) for a reason — most things are 'extended'.

**Don't chain FinancialTerms without a base.**
The first term in a chain must have an absolute magnitude — a real number, not a percentage. You can't take 8% of nothing. The chain walks from the base amount through percentage and absolute modifications.

**Don't use Handshake for single-party actions.**
Handshake is multi-party consensus. If only one person needs to approve, use Protocol validation instead. Handshake with one party is just a confirmation dialog with extra overhead.

**Don't use Queue for static collections.**
Queue is ordered, temporary, and processing-oriented. Items enter and leave. If items just sit there, use Set or Group. Queue items have enqueuedAt/dequeuedAt — if nothing ever dequeues, it's not a queue.

**Don't put business logic in Style.**
Style maps fields to output formats — it's a template, not a transformer. If you need computation, use Function. Style.format handles display formatting ($%.2f, uppercase, date:short), not business logic.

**Don't ignore View when filtering data.**
Always go through View + Filter + Sort for data queries. Don't query models directly with ad-hoc filter logic. Views are the saved, reusable, scope-aware lenses. Ad-hoc filtering leads to inconsistent results across the app.

---

## Decision Trees

### "I need to show a list of things"

```
Do the items have a defined type and schema?
├── Yes → Does the user need to filter/sort?
│         ├── Yes → View + Filter + Sort + Style
│         └── No  → View + Style (no filters)
└── No  → Is it free-form content?
          ├── Yes → Thread + Note
          └── No  → Improvement (raw stage, categorize later)
```

### "I need to define how something looks"

```
Is it about WHAT data to show?
├── Yes → Context (lens — scope, filter, sort, params)
└── No  → Is it about HOW to render data?
          ├── Yes → Style (field mappings, target format, template)
          └── No  → Is it about WHERE to show it?
                    ├── Yes → View (ties Context + Style + data type)
                    └── No  → Grid (spatial layout of slots)
```

### "I need to handle money"

```
Is it a single charge?
├── Yes → FinancialTerm (term: charge, direction: up, magnitudeType: absolute)
└── No  → Is it a percentage modifier?
          ├── Yes → FinancialTerm (magnitudeType: percentage, references: [base term])
          └── No  → Is it a full transaction?
                    ├── Yes → Order + OrderItem + OrderPayment
                    └── No  → Is it a cash flow?
                              ├── Yes → Till + TillCorrection
                              └── No  → FinancialTerm chain (define the calculation path)
```

### "I need to organize things"

```
Is it a strict boundary with regional/access constraints?
├── Yes → Scope
└── No  → Is it an exhaustive, complete list?
          ├── Yes → Set (complete: true)
          └── No  → Is it a loose grouping?
                    ├── Yes → Group
                    └── No  → Is it spatial/positional?
                              ├── Yes → Grid
                              └── No  → Is it a graph of relationships?
                                        ├── Yes → Map + Relationship
                                        └── No  → Group (default)
```

### "I need to track what happened"

```
Is it a field-level change to an entity?
├── Yes → Log (level: field, action: update, fromValue/toValue)
└── No  → Is it a status transition?
          ├── Yes → Log (level: status, action: transition)
          └── No  → Is it an access event?
                    ├── Yes → Log (level: access, action: read/export/share)
                    └── No  → Is it a system event?
                              ├── Yes → Log (level: system)
                              └── No  → Note (free-form annotation)
```

### "I need approval before an action"

```
Is it multi-party consensus?
├── Yes → Handshake (parties, unanimous flag, proposed changes)
│         Does it need a timeout?
│         ├── Yes → Async (timeout from TimeTerm or Protocol)
│         └── No  → Handshake alone (waits indefinitely — are you sure?)
└── No  → Is it rule-based validation?
          ├── Yes → Protocol (rules, enforcement, strict flag)
          └── No  → Is it a simple confirmation?
                    ├── Yes → Prompt (method: confirm)
                    └── No  → Function (just execute, no approval needed)
```

### "I need an AI agent to do something"

```
Is it a multi-stage pipeline?
├── Yes → AgentFlow + FlowAgent stages
│         Does it refine data progressively?
│         ├── Yes → Improvement records (raw → categorized → summarized → analyzed → rule)
│         └── No  → Function per stage (each FlowAgent executes a Function)
└── No  → Is it a single operation?
          ├── Yes → Function (define inputs, outputs, operation)
          └── No  → Is it a set of ordered steps?
                    ├── Yes → Instruction (steps with conditions, sequential/exhaustive flags)
                    └── No  → Prompt (ask the agent a question, get a structured response)
```

---

## Composition Index

Quick reference: which models appear in which recipe patterns.

| Model | Appears In |
|-------|-----------|
| **Product** | Product Detail, Catalog, Inventory, Barcode Scan, Financial Transaction |
| **Unit** | Inventory, Barcode Scan, Financial Transaction |
| **Order** | Financial Transaction |
| **View** | Catalog, Dashboard, Settings, Inventory, all screen patterns |
| **ViewGroup** | Catalog, Dashboard, all multi-panel screens |
| **Filter** | Catalog, Dashboard, Inventory, CRUD API, Data Ingestion |
| **Sort** | Catalog, Dashboard, Inventory, CRUD API |
| **Style** | Product Detail, Catalog, Dashboard, CRUD API |
| **Context** | Product Detail, Catalog, Dashboard, Settings, all scope-dependent patterns |
| **Scope** | Settings, CRUD API, Messaging, Scheduling, all access-controlled patterns |
| **Navigation** | Catalog, Dashboard, Tab App, Modal Flow |
| **Interaction** | Product Detail, Catalog, Settings, Modal, Barcode Scan |
| **Function** | Dashboard, CRUD API, Financial Transaction, Approval, Agent Workflow |
| **Prompt** | Settings, Approval, Modal Flow, Messaging |
| **Protocol** | Settings, CRUD API, Approval, Scheduling, Agent Workflow, Moderation |
| **Handshake** | Financial Transaction, Approval, Agent Workflow, Moderation |
| **Log** | CRUD API, Financial Transaction, Approval, Inventory, Scheduling, all state-changing patterns |
| **Async** | Approval, Messaging, Scheduling, Agent Workflow |
| **AgentFlow** | Data Ingestion, Agent Workflow, Moderation |
| **Improvement** | Data Ingestion, Moderation |
| **Queue** | Data Ingestion, Scheduling, Moderation |
| **FinancialTerm** | Financial Transaction |
| **TimeTerm** | Scheduling |
| **Thread** | Messaging |
| **Identifier** | Product Detail, Inventory, Barcode Scan |
| **Grid** | Inventory (planograms, spatial layouts) |
| **Set** | Inventory (bounded collections) |
| **Map** | Relationship visualization (not in standard recipes — choco taco territory) |
| **Unifier** | Product Detail (variants) |
| **Container** | Inventory |
| **Till** | Financial Transaction |
| **Timecard** | Scheduling |

---

## MCP Implications

The Instruction Set IS the MCP generation source. When generating a scoped MCP instance:

1. **Determine role** — what recipes does this role need?
2. **Collect ingredients** — union of all models referenced by those recipes
3. **Generate operations** — CRUD + compose + validate + transform per included model
4. **Scope by field** — some roles see all fields, others see a subset (Style controls this)
5. **Stamp and auth** — the generated instance IS the guardrail. Nothing outside scope exists.

A cashier's MCP gets: Financial Transaction, Product Detail, Barcode Scan, Tab App.
That means their instance contains: Order, Product, Unit, Identifier, View, Style, Context, Function, Interaction, Navigation, Log, FinancialTerm, Till.
It does NOT contain: AgentFlow, Improvement, Protocol (admin), Handshake (manager), Container (warehouse), Scope (admin).

The recipes define what's in. Everything else is out. Not locked — absent.
