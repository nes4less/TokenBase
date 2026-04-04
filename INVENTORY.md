# TokenBase — Complete Model Inventory

> **This file is reference context, not a task.** Master list of all implemented base models, traits, and compound models.

---

## Implemented — Base Models (39 files in `src/models/`)

| Model | Category | Purpose |
|---|---|---|
| Entity | Base | Universal base — id, timestamps, createdBy, soft-delete |
| Image | Primitive | Visual asset with blurhash placeholder |
| Measurement | Primitive | Physical dimensions and weight |
| Note | Primitive | Polymorphic annotation on any entity |
| Tag | Primitive | Categorization tag with color |
| Identifier | Identity | Abstract detection — barcode, QR, RFID, SKU, label (includes Barcode type + BarcodeType enum) |
| Context | Structure | Display, scoping, and presentation metadata |
| Grid | Structure | Spatial layout system (POS buttons, warehouse map) |
| Group | Structure | Declares that things belong together |
| Map | Structure | Topology — positions entities in orbital layers |
| Queue | Structure | Ordered waiting line — FIFO/LIFO/priority |
| Relationship | Structure | Typed edge between two entities |
| Scope | Structure | Downstream effects — hierarchy, regional metadata |
| Set | Structure | Bounded, complete collection within a scope |
| Style | Structure | Presentation template — maps model fields to formatted output |
| Thread | Structure | Conversation chain — owns messages, tracks participants and state |
| Unifier | Structure | Defines what makes a variant distinct from siblings |
| Filter | Data Operations | Selection rule — field, operator, value |
| Log | Data Operations | Immutable append-only change record (absorbs StatusChange) |
| Sort | Data Operations | Ordering rule — field, direction, priority |
| Async | Operations | Non-immediate operation — the Promise pattern as a data model |
| Function | Operations | Complete operation — inputs, outputs, transformation |
| Handshake | Operations | Mutual agreement protocol — propose, approve, reject, counter |
| Instruction | Operations | Ordered step sequence — recipes, procedures, protocols |
| Interaction | Operations | User input gesture mapped to an operation |
| Prompt | Operations | Structured decision request — select, multiselect, input, confirm (absorbs Option/OptionGroup) |
| Protocol | Operations | Governing ruleset — mandatory/advisory rules with enforcement |
| FinancialTerm | Financial | Typed directional monetary operation (70+ term types) |
| TimeTerm | Time | Typed directional time operation — deadline, duration, buffer, sprint, etc. |
| Navigation | Views & Nav | Navigation graph — nodes, edges, transition types (stack/tab/modal/drawer) |
| View | Views & Nav | Saved perspective on data — Filter + Sort + Style + entity type |
| ViewGroup | Views & Nav | Ordered collection of Views — tab bars, dashboards, settings sections |
| ViewState | Views & Nav | Runtime snapshot of a View's condition — selected, scroll, loading, error |
| AgentFlow | Agent | Processing pipeline composed of agents |
| Improvement | Agent | Data moving through refinement pipeline (raw → rule) |
| Bandwidth | Cost & Certainty | Predicted processing cost for an entity before execution |
| BugPattern | Design Knowledge | Preventable issue captured for automatic rule generation |
| DesignChoice | Design Knowledge | Recorded design decision with scope, variants, and preference |
| RuleOutcome | Design Knowledge | Evidence of a rule's real-world effect — tracks whether rules were followed, violated, prevented problems, or recurred |

## Implemented — Traits (27 interfaces in `Traits.ts`)

| Trait | What it declares |
|---|---|
| Nameable | Has a display name |
| Subnameable | Has a secondary name / subtitle |
| Describable | Has a description |
| Identifiable | Has a unique identifier string |
| Indexable | Has a position for ordering |
| Rankable | Has a rank for scoring/priority |
| Colorable | Has a color for display |
| Imageable | Can have images attached |
| Statusable | Has a status value |
| Noteable | Can have notes attached |
| Chargeable | Has a monetary amount |
| Saleable | Can be sold (amount + taxable) |
| Addressable | Has a physical address |
| Metadatable | Carries classified key/value metadata |
| Taggable | Has tags for categorization |
| Polymorphic | References a polymorphic entity (type + id) |
| Expirable | Finite lifespan / consumed on use |
| Attachable | Attach any file/document to any entity |
| Locatable | Geographic position + proximity |
| Accessible | Visibility/permission — public, private, restricted, shared |
| Sourceable | Provenance — where data came from |
| Validatable | Trust level — verified/unverified/disputed/expired, confidence |
| Securable | Integrity — hash, key, locked, signed |
| Interchangeable | Substitution — entities that can replace each other |
| Linkable | External URL/URI reference |
| Typeable | Abstract noun classification — person, place, thing, idea, event, etc. |

## Implemented — Compound Models (8 files in `src/compound/`)

| Model | Category | Purpose | Origin |
|---|---|---|---|
| Business | Commerce | Merchant/store entity with Stripe integration | CashierFu-Mobile + GameroomKit |
| Container | Commerce | Physical storage location (bin, box, shelf) | CashierFu-Kit |
| Order | Commerce | Complete sales transaction with calculations | CashierFu-Mobile + GameroomKit |
| Product | Commerce | Sellable item definition (template) | CashierFu-Kit + GameroomKit |
| Reader | Commerce | Payment terminal / card reader (Stripe Terminal) | CashierFu-Mobile |
| Till | Commerce | Cash register with audit-based balance tracking | CashierFu-Mobile |
| Timecard | Workforce | Work session record (clock in/out, corrections) | GameroomKit |
| Unit | Commerce | Individual instance of a product (inventory item) | CashierFu-Kit |

## Totals

- **39 base model files** (41 including Traits.ts and index.ts)
- **27 trait interfaces**
- **8 compound models**
- **100+ exported classes, types, and enums total**
