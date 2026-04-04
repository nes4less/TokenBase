# TokenBase — Scope Models

> **This file is reference context, not a task.** Complete list of every exported class, interface, type, and enum with purpose and origin.

## Base

| Class / Interface | Type | Purpose | Origin |
|---|---|---|---|
| `Entity` | class | Universal base — id, timestamps, createdBy, soft-delete | GameroomKit GKStorable (2017) |
| `IEntity` | interface | Entity contract for external implementors | GameroomKit GKStorable |

## Traits (27 interfaces in `Traits.ts`)

| Trait | What it declares | Origin |
|---|---|---|
| `Nameable` | Has a display name | GameroomKit GKNameable |
| `Subnameable` | Has a secondary name / subtitle | GameroomKit |
| `Describable` | Has a description / info field | GameroomKit GKDescribable |
| `Identifiable` | Has a unique identifier string (SKU, slug) | GameroomKit GKIdentifiable |
| `Indexable` | Has a position for ordering in collections | GameroomKit GKIndexable |
| `Rankable` | Has a rank for scoring / priority | GameroomKit GKRankable |
| `Colorable` | Has a color for visual display | GameroomKit GKColorable |
| `Imageable` | Can have images attached | GameroomKit GKImageable |
| `Statusable` | Has a status value | GameroomKit GKStatusable |
| `Noteable` | Can have notes attached | GameroomKit GKNoteable |
| `Chargeable` | Has a monetary amount | GameroomKit GKChargeable |
| `Saleable` | Can be sold (amount + taxable) | GameroomKit GKSaleable |
| `Addressable` | Has a physical address | GameroomKit GKAddressable |
| `MetadataEntry` | interface | Classified key/value entry | TokenBase |
| `Metadatable` | Carries classified key-value metadata | TokenBase |
| `Taggable` | Has tags for categorization | TokenBase |
| `Polymorphic` | References a polymorphic entity (type + id) | TokenBase |
| `Expirable` | Finite lifespan — expiresAt, maxUses, ttl, consumeOnRead | TokenBase |
| `Attachable` | Attach any file/document to any entity | TokenBase |
| `Locatable` | Geographic position + proximity queries | TokenBase |
| `Accessible` | Visibility/permission — public, private, restricted, shared | TokenBase |
| `Sourceable` | Provenance — first/third party, original/derived/copied | TokenBase |
| `Validatable` | Trust level — verified/unverified/disputed/expired, confidence 0-1 | TokenBase |
| `Securable` | Integrity — hash, key, locked, signed, signedBy | TokenBase |
| `Interchangeable` | Substitution — entities that replace each other | TokenBase |
| `Linkable` | External URL/URI reference | TokenBase |
| `Typeable` | Abstract noun classification — person, place, thing, idea, event, etc. | TokenBase |

## Primitives

| Class | Purpose | Origin |
|---|---|---|
| `Address` | Physical location with contact details | GameroomKit + CashierFu |
| `Image` | Visual asset with blurhash placeholder | CashierFu-Kit + GameroomKit |
| `Note` | Polymorphic annotation on any entity | GameroomKit GKNote (2018) |
| `Tag` | Categorization tag with color | CashierFu-Kit + GameroomKit |

## Identity & Detection

| Class / Type | Purpose | Origin |
|---|---|---|
| `Barcode` | Machine-readable identifier with symbology type | CashierFu-Kit + GameroomKit |
| `BarcodeType` | Symbology types (UPC_A, QR, EAN13, etc.) | CashierFu-Kit + GameroomKit |
| `Identifier` | Abstract detection — barcode, QR, RFID, SKU, label | TokenBase |

## Structure & Topology

| Class | Purpose | Origin |
|---|---|---|
| `Context` | Display, scoping, and presentation metadata | TokenBase |
| `Group` | Declares that things belong together | TokenBase |
| `Map` | Topology — positions entities in orbital layers | TokenBase |
| `MapNode` | A positioned entity within a map | TokenBase |
| `Dimensions` | Physical measurements (width, height, depth, weight) | CashierFu-Kit |
| `Measure<U>` | Numeric value + unit pair (generic) | CashierFu-Kit |
| `Queue` | Ordered waiting line — FIFO/LIFO/priority | TokenBase |
| `QueueItem` | Single item in a queue | TokenBase |
| `Relationship` | Typed edge between two entities | TokenBase |
| `Scope` | Downstream effects — hierarchy, regional metadata | TokenBase |
| `Set` | Bounded, complete collection within a scope | TokenBase |
| `Style` | Presentation template — maps model fields to output slots | TokenBase |
| `StyleField` | Maps a model field to a formatted output slot | TokenBase |
| `Thread` | Conversation chain — owns messages, participants, state | TokenBase |
| `Unifier` | Defines what makes a variant distinct from siblings | TokenBase |

## Data Operations

| Class / Type | Purpose | Origin |
|---|---|---|
| `Filter` | Selection rule — field, operator, value | TokenBase |
| `FilterOperator` | eq, neq, gt, gte, lt, lte, contains, in, between, regex, etc. | TokenBase |
| `Log` | Immutable append-only change log (absorbs StatusChange) | TokenBase |
| `LogEntry` | Single change record — who, what, from, to | TokenBase |
| `LogLevel` | field, entity, access, derivation, system, status | TokenBase |
| `Sort` | Ordering rule — field, direction, priority | TokenBase |
| `SortDirection` | asc, desc | TokenBase |

## Operations

| Class / Type | Purpose | Origin |
|---|---|---|
| `Async` | Non-immediate operation — Promise pattern as data model | TokenBase |
| `AsyncStatus` | pending, active, resolved, rejected, cancelled, timeout | TokenBase |
| `Function` | Complete operation — inputs, outputs, transformation | TokenBase |
| `FunctionParam` | Input or output slot on a Function | TokenBase |
| `Handshake` | Mutual agreement protocol — multi-party consent gate | TokenBase |
| `HandshakeStatus` | pending, approved, rejected, countered, expired, cancelled | TokenBase |
| `Instruction` | Ordered step sequence with conditions | TokenBase |
| `InstructionStep` | Single step — action, position, condition, optional | TokenBase |
| `Interaction` | User gesture mapped to an operation | TokenBase |
| `GestureType` | tap, longPress, doubleTap, swipe*, pinch, drag, hover, etc. | TokenBase |
| `Prompt` | Structured decision request — select/multiselect/input/confirm | TokenBase |
| `PromptOption` | Single option with label, value, price modifiers | TokenBase |
| `PromptMethod` | select, multiselect, input, confirm | TokenBase |
| `Protocol` | Governing ruleset — mandatory/advisory rules with enforcement | TokenBase |
| `ProtocolRule` | Single rule — subject, statement, enforcement, priority | TokenBase |

## Financial

| Class / Type | Purpose | Origin |
|---|---|---|
| `FinancialTerm` | Typed directional monetary operation (70+ term types) | TokenBase |
| `FinancialTermType` | All recognized financial term types | TokenBase |
| `FinancialDirection` | Up (adds) or down (subtracts) | TokenBase |

## Time

| Class / Type | Purpose | Origin |
|---|---|---|
| `TimeTerm` | Typed directional temporal operation (40+ term types) | TokenBase |
| `TimeTermType` | All recognized time term types (duration, deadline, cooldown, backoff, sprint, etc.) | TokenBase |
| `TimeDirection` | Forward (adds time) or backward (subtracts time) | TokenBase |
| `TimeMode` | Relative duration or absolute point in time | TokenBase |
| `TimeUnit` | milliseconds through years | TokenBase |
| `MagnitudeType` | Percentage or absolute value | TokenBase |

## Views & Navigation

| Class / Type | Purpose | Origin |
|---|---|---|
| `Navigation` | Navigation graph — nodes, edges, transition types | TokenBase |
| `NavigationNode` | Single point in nav graph — target, label, icon, badge | TokenBase |
| `NavigationType` | stack, tab, modal, drawer, replace | TokenBase |
| `View` | Saved perspective — Filter + Sort + Style + entity type | TokenBase |
| `ViewGroup` | Ordered collection of Views — tabs, sections, grid, stack | TokenBase |
| `ViewState` | Runtime snapshot — selected, scroll, loading, error, expanded | TokenBase |

## Agent / Automation

| Class / Type | Purpose | Origin |
|---|---|---|
| `AgentFlow` | Processing pipeline composed of agents | TokenBase |
| `FlowAgent` | Agent within a flow — role, gate, position | TokenBase |
| `Improvement` | Data moving through refinement pipeline (raw → rule) | TokenBase |

## Design Knowledge

| Class / Type | Purpose | Origin |
|---|---|---|
| `DesignChoice` | Recorded design decision with scope, variants, and preference | TokenBase |
| `ChoiceVariant` | One option considered for a design choice | TokenBase |
| `DesignScope` | Breadth of implication (element → component → system → cross-project) | TokenBase |
| `DesignDomain` | Domain a choice applies to (auth, ui, data-model, api, etc.) | TokenBase |
| `BugPattern` | Preventable issue captured for automatic rule generation | TokenBase |
| `BugSeverity` | low, medium, high, critical | TokenBase |

## Cost & Validity

| Class / Type | Purpose | Origin |
|---|---|---|
| `Bandwidth` | Predicted processing cost for an entity before execution | TokenBase |
| `CostMeasurement` | Actual observed cost after execution, paired with prediction | TokenBase |
| `CostUnit` | Resource type being measured (tokens, ms, cpu-ms, bytes, calls, steps, dollars) | TokenBase |
| `Validity` | Degree of certainty for any claim — likelihood, potential accuracy, consistency, observation count | TokenBase |

## Compound Models (`src/compound/`)

| Class | Purpose | Origin |
|---|---|---|
| `Business` | Merchant / store entity with Stripe integration | CashierFu-Mobile + GameroomKit GKStore |
| `Container` | Physical storage location (bin, box, shelf) | CashierFu-Kit |
| `ContainerStatus` | Timestamped container state entry | CashierFu-Kit |
| `Grid` (compound) | Spatial layout (POS buttons, warehouse) — re-exported from models | CashierFu-Kit |
| `GridSlot` | Single position within a grid | CashierFu-Kit |
| `Order` | Complete sales transaction with calculations | CashierFu-Mobile + GameroomKit |
| `OrderItem` | Line item snapshot at time of sale | CashierFu-Mobile + GameroomKit |
| `OrderDiscount` | Discount applied to an order | CashierFu-Mobile |
| `OrderTax` | Tax applied to an order | CashierFu-Mobile |
| `OrderPayment` | Payment toward an order | CashierFu-Mobile + GameroomKit |
| `Discount` | Reusable discount definition (amount + percent) | CashierFu-Mobile |
| `Tax` | Reusable tax definition (amount + percent) | CashierFu-Mobile |
| `Product` | Sellable item definition (template) | CashierFu-Kit + GameroomKit |
| `Reader` | Payment terminal / card reader (Stripe Terminal) | CashierFu-Mobile + GameroomKit |
| `Till` | Cash register with audit-based balance tracking | CashierFu-Mobile + GameroomKit |
| `TillCorrection` | Single adjustment to till balance | CashierFu-Mobile |
| `Unit` | Individual instance of a product (inventory item) | CashierFu-Kit + GameroomKit |
| `UnitStatus` | Timestamped unit lifecycle entry | CashierFu-Kit |
| `Timecard` | Work session record (clock in/out, corrections) | GameroomKit GKTimecard (2018) |

## Summary

- **36 base model files** (52 classes + types in `src/models/`)
- **27 trait interfaces** (in `Traits.ts`)
- **8 compound model files** (19 classes + types in `src/compound/`)
- **28 type aliases**
- **100+ total exports**

### Sources

| Source | Models Contributed |
|---|---|
| GameroomKit (2017-2019) | Entity, original 15 traits, Address, Note, StatusChange → Log, Option → Prompt, Timecard |
| CashierFu-Kit | Barcode, Catalog → Set, Container, Grid, Image, Measurement/Dimensions, Product, Tag, Unit |
| CashierFu-Mobile / Desktop | Business, Discount, Order (+ Items/Discounts/Taxes/Payments), Reader, Tax, Till |
| TokenBase (original) | Context, FinancialTerm, TimeTerm, Function, Group, Identifier, Improvement, AgentFlow, Map, Relationship, Scope, Style, Unifier, Async, Filter, Handshake, Instruction, Interaction, Log, Navigation, Prompt, Protocol, Queue, Set, Sort, Thread, View, ViewGroup, ViewState, DesignChoice, ChoiceVariant, BugPattern, Bandwidth, CostMeasurement, Validity, 12 new traits |
