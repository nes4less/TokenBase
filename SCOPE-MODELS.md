# TokenBase — Scope Models

## Base

| Class / Interface | Type | Purpose | Origin |
|---|---|---|---|
| `Entity` | class | Universal base — id, timestamps, createdBy, soft-delete | GameroomKit GKStorable (2017) |
| `IEntity` | interface | Entity contract for external implementors | GameroomKit GKStorable |
| `Nameable` | interface | Has a display name | GameroomKit GKNameable |
| `Subnameable` | interface | Has a secondary name / subtitle | GameroomKit |
| `Describable` | interface | Has a description / info field | GameroomKit GKDescribable |
| `Identifiable` | interface | Has a unique identifier string (SKU, slug) | GameroomKit GKIdentifiable |
| `Indexable` | interface | Has a position for ordering in collections | GameroomKit GKIndexable |
| `Rankable` | interface | Has a rank for scoring / priority | GameroomKit GKRankable |
| `Colorable` | interface | Has a color for visual display | GameroomKit GKColorable |
| `Imageable` | interface | Can have images attached | GameroomKit GKImageable |
| `Statusable` | interface | Has a status value | GameroomKit GKStatusable |
| `Noteable` | interface | Can have notes attached | GameroomKit GKNoteable |
| `Chargeable` | interface | Has a monetary amount | GameroomKit GKChargeable |
| `Saleable` | interface | Can be sold (amount + taxable) | GameroomKit GKSaleable |
| `Addressable` | interface | Has a physical address | GameroomKit GKAddressable |
| `Metadatable` | interface | Carries arbitrary key-value metadata | TokenBase |
| `Taggable` | interface | Has tags for categorization | TokenBase |
| `Polymorphic` | interface | References a polymorphic entity (type + id) | TokenBase |

## Primitives

| Class | Purpose | Origin |
|---|---|---|
| `Address` | Physical location with contact details | GameroomKit GKAddressable + CashierFu UserAddress |
| `Image` | Visual asset with blurhash placeholder | CashierFu-Kit + GameroomKit GKImage |
| `Note` | Polymorphic annotation on any entity | GameroomKit GKNote (2018) |
| `Option` | Selectable choice with price modifier | GameroomKit GKOption (2017) |
| `OptionGroup` | Named set of selectable options | GameroomKit GKOptionGroup (2017) |
| `StatusChange` | Timestamped polymorphic status entry | GameroomKit GKStatus (2019) |
| `Tag` | Categorization tag with color | CashierFu-Kit + GameroomKit GKTag |

## Identity & Detection

| Class / Type | Purpose | Origin |
|---|---|---|
| `Barcode` | Machine-readable identifier with symbology type | CashierFu-Kit + GameroomKit GKBarcode |
| `BarcodeType` | Symbology types (UPC_A, QR, EAN13, etc.) | CashierFu-Kit + GameroomKit GKBarcodeType |
| `Identifier` | Abstract detection — barcode, QR, RFID, SKU, label | TokenBase |

## Structure & Topology

| Class | Purpose | Origin |
|---|---|---|
| `Context` | Display, scoping, and presentation metadata | TokenBase |
| `Group` | Declares that things belong together | TokenBase |
| `Map` | Topology — positions entities in orbital layers | TokenBase |
| `MapNode` | A positioned entity within a map | TokenBase |
| `Dimensions` | Physical measurements (width, height, depth, weight) | CashierFu-Kit Measurements |
| `Measure<U>` | Numeric value + unit pair (generic) | CashierFu-Kit |
| `Relationship` | Typed edge between two entities | TokenBase |
| `Scope` | Downstream effects — hierarchy, regional metadata | TokenBase |
| `Style` | Presentation template — flattens model data to target format | TokenBase |
| `StyleField` | Maps a model field to a formatted output slot | TokenBase |
| `Unifier` | Defines what makes a variant distinct from siblings | TokenBase |

## Operations

| Class | Purpose | Origin |
|---|---|---|
| `Function` | Complete operation — inputs, outputs, transformation | TokenBase |
| `FunctionParam` | Input or output slot on a Function | TokenBase |

## Financial

| Class / Type | Purpose | Origin |
|---|---|---|
| `FinancialTerm` | Typed directional monetary operation (70+ term types) | TokenBase |
| `FinancialTermType` | All recognized financial term types | TokenBase |
| `FinancialDirection` | Up (adds) or down (subtracts) | TokenBase |
| `MagnitudeType` | Percentage or absolute value | TokenBase |
| `Discount` | Reusable discount definition (amount + percent) | CashierFu-Mobile |
| `Tax` | Reusable tax definition (amount + percent) | CashierFu-Mobile |

## Commerce

| Class | Purpose | Origin |
|---|---|---|
| `Business` | Merchant / store entity with Stripe integration | CashierFu-Mobile + GameroomKit GKStore |
| `Catalog` | Collection / grouping of products | CashierFu-Kit |
| `Container` | Physical storage location (bin, box, shelf) | CashierFu-Kit |
| `ContainerStatus` | Timestamped container state entry | CashierFu-Kit |
| `Grid` | Spatial layout system (POS buttons, warehouse map) | CashierFu-Kit |
| `GridSlot` | Single position within a grid | CashierFu-Kit |
| `Order` | Complete sales transaction with calculations | CashierFu-Mobile + GameroomKit GKSale |
| `OrderItem` | Line item snapshot at time of sale | CashierFu-Mobile + GameroomKit GKLine |
| `OrderDiscount` | Discount applied to an order | CashierFu-Mobile |
| `OrderTax` | Tax applied to an order | CashierFu-Mobile |
| `OrderPayment` | Payment toward an order | CashierFu-Mobile + GameroomKit GKPayment |
| `Product` | Sellable item definition (template) | CashierFu-Kit + CashierFu-Mobile + GameroomKit GKProduct |
| `Reader` | Payment terminal / card reader (Stripe Terminal) | CashierFu-Mobile + GameroomKit GKStripeReader |
| `Till` | Cash register with audit-based balance tracking | CashierFu-Mobile + GameroomKit GKTill |
| `TillCorrection` | Single adjustment to till balance | CashierFu-Mobile |
| `Unit` | Individual instance of a product (inventory item) | CashierFu-Kit + GameroomKit GKUnit |
| `UnitStatus` | Timestamped unit lifecycle entry | CashierFu-Kit |

## Workforce

| Class | Purpose | Origin |
|---|---|---|
| `Timecard` | Work session record (clock in/out, corrections) | GameroomKit GKTimecard (2018) |

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

## Summary

- **35 model files**
- **49 classes**
- **18 interfaces** (traits)
- **25 type aliases**

### Sources

| Source | Models Contributed |
|---|---|
| GameroomKit (2017-2019) | Entity, all 15 traits, Address, Note, StatusChange, Option, OptionGroup, Timecard |
| CashierFu-Kit | Barcode, Catalog, Container, Grid, Image, Measurement/Dimensions, Product, Tag, Unit |
| CashierFu-Mobile / Desktop | Business, Discount, Order (+ Items/Discounts/Taxes/Payments), Reader, Tax, Till |
| TokenBase (original) | Context, FinancialTerm, Function, Group, Identifier, Improvement, AgentFlow, Map, Relationship, Scope, Style, Unifier, DesignChoice, ChoiceVariant, BugPattern |
