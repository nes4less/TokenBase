# TokenBase — Complete Model Inventory

> **This file is reference context, not a task.** Master list of all implemented and pending base models. The goal: build any app with just these. Everything else is compound.

---

## Implemented — Models (33 files)

| Model | Type | Status |
|---|---|---|
| Address | Primitive | ✅ From CashierFu/GameroomKit |
| AgentFlow | Operational | ✅ TokenBase original |
| Barcode | Identity | ✅ From CashierFu |
| Business | Commerce | ⚠️ May be compound (Group + Nameable + Scope) |
| Catalog | Commerce | ⚠️ May be compound (Group + Nameable) |
| Container | Commerce | ⚠️ May be compound (Locatable + Nameable + Statusable) |
| Context | Structural | ✅ TokenBase original |
| Entity | Base | ✅ Universal base class |
| FinancialTerm | Operational | ✅ TokenBase original |
| Function | Operational | ✅ TokenBase original |
| Grid | Structural | ✅ From CashierFu — spatial layout |
| Group | Structural | ✅ TokenBase original |
| Identifier | Identity | ✅ TokenBase original |
| Image | Primitive | ✅ |
| Improvement | Operational | ✅ TokenBase original |
| Map | Structural | ✅ TokenBase original |
| Measurement | Primitive | ✅ From CashierFu — dimensions/weight |
| Note | Primitive | ✅ From GameroomKit |
| Option | Primitive | ✅ From GameroomKit — selectable choice |
| Order | Commerce | ⚠️ May be compound (Event + [FinancialTerms] + [Items]) |
| Pricing | Commerce | ⚠️ May merge with FinancialTerm |
| Product | Commerce | ⚠️ May be compound (Nameable + Identifiable + Chargeable + Imageable) |
| Reader | Commerce | ⚠️ Hardware utility — may be Function |
| Relationship | Structural | ✅ TokenBase original |
| Scope | Structural | ✅ TokenBase original |
| StatusChange | Primitive | ✅ From GameroomKit |
| Style | Operational | ✅ TokenBase original |
| Tag | Primitive | ✅ |
| Till | Commerce | ⚠️ May be compound (Container + Log + FinancialTerms) |
| Timecard | Workforce | ⚠️ May be compound (TimeTerm + Event + Entity) |
| Traits | Interfaces | ✅ Trait system (18 interfaces) |
| Unifier | Structural | ✅ TokenBase original |
| Unit | Commerce | ⚠️ May be compound (Unifier instance + Statusable) |

## Implemented — Traits (18 interfaces in Traits.ts)

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
| Metadatable | Carries arbitrary key/value metadata |
| Taggable | Has tags for categorization |
| Polymorphic | References a polymorphic entity (type + id) |

## Pending — Base Primitives (not yet modeled)

| Primitive | Category | What it is |
|---|---|---|
| Queue | Structural | Ordered waiting line — FIFO/LIFO/priority, items, processing state |
| Sort | Structural | Ordering rule — field, direction, priority when chained |
| Filter | Structural | Selection rule — field, operator (eq/contains/gt/in/between), value |
| Async | Operational | Non-immediate operation — status (pending/active/resolved/rejected/cancelled), timeout, result, error |
| Expirable | Trait | Finite lifespan / consumed on use — expiresAt, maxUses, currentUses, consumeOnRead, ttl |
| Prompt | Operational | Structured decision request — options, single/multi/input mode, targets human/agent/system |
| Attachable | Trait | Attach any file/document to any entity — type-agnostic |
| Locatable | Trait | Geographic position + proximity — absolute coords, relative distance queries |
| Access | Trait | Visibility/permission — public, private, restricted, shared, conditions |
| Typeable | Root | Abstract noun classification — person, place, thing, idea, event, location, result, action, state, quantity, rule, signal |
| TimeTerm | Operational | Time operations (same pattern as FinancialTerm) — deadline, duration, buffer, cadence, grace period, overtime, window, blackout, cooldown, sprint |
| Source | Trait | Provenance — where data came from, first/third party, original/derived/copied |
| Validity | Trait | Trust level — verified/unverified/disputed/expired, confidence (0-1), truth window, verified by whom |
| Security | Trait | Integrity — hash, key, locked (immutable), signed, signedBy |
| DataOrigin | Trait | How data was created — crud, derived, observed, inferred, imported, generated |
| Log | Structural | Immutable append-only change history — field/entity/access/derivation level changes |
| Interchangeable | Trait | Substitution — entities that can replace each other, compatibility (full/partial/conditional), bidirectional, priority, conditions |
| Handshake | Operational | Mutual agreement protocol — propose, approve, reject, counter. Multi-party consent gate |

## Pending — Compound Models (to verify: base or composed?)

| Model | Likely composition | Verdict needed |
|---|---|---|
| Message | Entity + Nameable + Polymorphic + Attachable | Common enough for standalone? |
| Notification | Event + Style(target:alert) + Access(recipient) | Common enough for standalone? |
| Comment | Message + Polymorphic(anchored to entity) | Merge with Message? |
| Subscription | TimeTerm(cadence) + Relationship + StatusChange | Compound? |
| Media | Image superset (any file type) | Image becomes Media? |
| Content | Nameable + Attachable + Style + Expirable | Compound? |
| DataSource | Function(read) + TimeTerm(refresh) + Scope | Compound? |
| Module | Function(capabilities) + Group(deps) + Relationship | Compound? |
| Query | Function(operation:read) + Filter + Sort | Merge with Function? |
| View | Query + Style | Compound? |
| Flag | Tag with semantic constraint | Merge with Tag? |
| Range | Primitive (min/max bounds) | Keep as primitive? |
| Person | Nameable + Locatable + Imageable + Typeable(person) | Compound? |
| Organization | Group + Nameable + Scope + Context | Compound? |
| ColorProfile | Style(target:theme) | Compound? |
| Publication | Content + Scope(audience) + StatusChange | Compound? |
| Event | Entity + Typeable(event) + Polymorphic + Source | Keep as primitive or compound? |

## Hardware Utilities (modeled as Functions)

| Utility | Inputs | Outputs | Connects to |
|---|---|---|---|
| Print | Style-formatted data | Physical document | Style |
| Scan | Camera feed | Identifier | Identifier |
| Camera | Capture config | Image/Media | Image |
| Share | Content + target | Share result | Content, Style |
| Speaker | Audio data | Playback | Media |
| Microphone | Capture config | Audio | Media |
| Haptic | Pattern | Tactile feedback | — |
| Biometric | Auth request | Access result | Access |
| NFC | Read/write config | Identifier/data | Identifier |
| Bluetooth | Discovery/connect | Device Relationship | Relationship |
| Clipboard | Content | Content | — |
| File System | Path + operation | Media/Attachable | Media, Attachable |
| Location | Query | Locatable | Locatable |

## Totals

- **33 implemented models** (some may collapse into compounds)
- **18 implemented traits**
- **18 pending primitives/traits**
- **17 pending compound verdicts**
- **13 hardware utilities** (modeled as Functions)

## Next Steps

1. Other CLI finishes reconciliation push
2. Merge this list with their additions
3. Write full contextual docs (MODELS.md) with descriptions, tests, use cases
4. Redundancy pass — collapse compounds, merge overlaps
5. Tier the models (Typeable → Traits → Structural → Operational → Compound)
6. Strategy session on the type system design
