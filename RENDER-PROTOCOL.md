# Render Protocol — TokenBase → Pixels

> **This file is reference context, not a task.** Defines how TokenBase models resolve to platform output.

## What This Is

The Render Protocol is a Protocol instance — a set of rules governing how model records become rendered UI. It's not a new model. It's a specific Protocol that every Token app follows.

## The Resolution Chain

```
ViewGroup → Views → [Filter + Sort + Style + Interaction] → ViewState → Platform Output
```

Each step has a clear input, a clear output, and a clear fallback when data is missing.

## Step 1: Resolution — What are we showing?

**Input:** A ViewGroup ID (e.g., the "Comms" tab bar)
**Output:** An ordered list of Views with their configurations

```
ViewGroup("comms-tabs", layout: "tabs")
  ├─ View("board",    entityType: "content",  filterIds: [...], sortIds: [...], styleId: "...", icon: "info-board")
  ├─ View("tasks",    entityType: "gsd_task", filterIds: [...], sortIds: [...], styleId: "...", icon: "events")
  ├─ View("threads",  entityType: "message",  filterIds: [...], sortIds: [...], styleId: "...", icon: "messages")
  ├─ View("comments", entityType: "comment",  filterIds: [...], sortIds: [...], styleId: "...", icon: "messages")
  └─ View("history",  entityType: "event",    filterIds: [...], sortIds: [...], styleId: "...", icon: "history")
```

**Rules:**
- ViewGroup.viewIds defines order. Reorder = change the array. No code change.
- Each View declares its entityType, filters, sorts, style, and icon.
- Adding a tab = insert a View record + add its ID to ViewGroup.viewIds.
- Removing a tab = remove the ID. The View record can stay (reusable elsewhere).

**Fallback:** If ViewGroup is missing, render nothing. If a View ID in the group doesn't resolve, skip it silently.

## Step 2: Layout — How is it arranged?

**Input:** ViewGroup.layout + resolved Views
**Output:** Platform layout container

| layout | React Native output |
|---|---|
| `tabs` | Horizontal tab bar + swipable content area |
| `sections` | Vertical scrollable sections with headers |
| `grid` | Grid layout (2-col default, responsive) |
| `stack` | Vertical stack, no headers |

**Rules:**
- Layout is a hint, not a prescription. The renderer adapts to screen size.
- Tab bar renders NavigationNodes from the Navigation model if one exists, otherwise falls back to ViewGroup.viewIds with View.icon + View.name.
- Badge counts come from NavigationNode.badgeFunctionId → Function execution → number.

**Fallback:** Default to `tabs` if layout is null or unrecognized.

## Step 3: Data — What records match?

**Input:** View.entityType + View.filterIds + View.sortIds
**Output:** Ordered array of entity records

**Filter resolution:**
```
View.filterIds → [Filter records] → composed query
Filter { field: "senderId", operator: "eq", value: "{currentUserId}" }
Filter { field: "parentId", operator: "isNull" }
```

**Sort resolution:**
```
View.sortIds → [Sort records] → ordered application
Sort { field: "createdAt", direction: "desc", priority: 0 }
```

**Rules:**
- Filters compose with AND by default. Use a Group filter for OR logic.
- `{currentUserId}` and `{now}` are runtime tokens resolved at query time.
- View.limit caps the result set. Null = no limit.
- The data layer handles the query. The protocol doesn't care if it's Supabase, SQLite, or an API.

**Fallback:** If filters fail to resolve, show all records of entityType. If sorts fail, use createdAt desc.

## Step 4: Presentation — How does each record look?

**Input:** View.styleId + entity records
**Output:** Rendered list/grid of styled items

**Style resolution:**
```
Style {
  target: "card",
  entityType: "message",
  fields: [
    StyleField { source: "senderName", label: null, position: 0, format: "uppercase:first" },
    StyleField { source: "body", label: null, position: 1, format: "truncate:120" },
    StyleField { source: "createdAt", label: null, position: 2, format: "timeAgo" },
  ]
}
```

**Rules:**
- Style.target selects the base renderer: `card`, `row`, `summary`, `label`, `receipt`, etc.
- StyleFields are ordered by position. The renderer maps each to a slot in the template.
- Format strings are composable: `"truncate:120|uppercase:first"` → truncate then capitalize.
- New entity type? Define a Style. The generic renderer handles it. No new component.

**Built-in renderers (React Native):**

| target | renders as |
|---|---|
| `card` | Rounded card with title, subtitle, meta |
| `row` | Single-line list row with icon, title, right detail |
| `summary` | Condensed badge/count display |
| `plain` | Raw text dump |

**Fallback:** If styleId is null, use a default card renderer that shows `name` (or first string field) + `createdAt`.

## Step 5: Interaction — How does the user engage?

**Input:** Interaction records scoped to this View + entity type
**Output:** Gesture handlers attached to rendered items

**Interaction resolution:**
```
Interaction { gesture: "tap", entityType: "message", viewId: "threads", functionId: "open-thread" }
Interaction { gesture: "longPress", entityType: "message", viewId: "threads", functionId: "archive-message" }
Interaction { gesture: "swipeLeft", entityType: "message", viewId: "threads", functionId: "dismiss-message" }
```

**Rules:**
- Interactions are scoped: viewId + entityType. Same entity type can have different gestures in different views.
- functionId points to a Function record that defines the operation (navigate, API call, state change, prompt).
- If a Function returns a Prompt, the prompt is displayed before proceeding (confirmation, input, choice).
- Global interactions (viewId: null) apply everywhere unless overridden by a view-scoped interaction.

**Fallback:** If no interactions defined, tap = navigate to detail view. No other gestures.

## Step 6: State — What's the live condition?

**Input:** ViewState for the current View + user
**Output:** Applied runtime state (scroll position, selection, expanded sections)

**Rules:**
- ViewState is created lazily — first render of a View creates a default ViewState.
- ViewState persists across app restarts (stored locally + synced to server).
- ViewState.activeFilterIds override View.filterIds when the user changes filters at runtime.
- ViewState.selectedId determines which item is highlighted/focused.
- ViewState.expandedIds tracks which collapsible sections are open.

**Fallback:** If no ViewState exists, create one with defaults (idle, no selection, all collapsed, scroll at 0).

## Step 7: Reactivity — How does it stay current?

**Input:** Data subscriptions + ViewState changes
**Output:** Re-rendered view

**Rules:**
- Each View subscribes to its entityType table for realtime changes.
- Insert/update/delete events re-run the filter+sort pipeline and diff the result.
- ViewState changes (user scrolls, selects, filters) trigger local re-render, no server round-trip.
- Badge counts recompute on data change (NavigationNode.badgeFunctionId re-evaluated).

**Fallback:** If realtime subscription fails, poll every 30s (existing pattern).

## The Protocol Record

```typescript
Protocol {
  name: "render",
  description: "Governs how TokenBase models resolve to platform UI",
  domain: "presentation",
  version: "1.0",
  rules: [
    { subject: "resolution",    rule: "ViewGroup → ordered Views", enforcement: "skip missing views", mandatory: true },
    { subject: "layout",        rule: "ViewGroup.layout → platform container", enforcement: "default to tabs", mandatory: true },
    { subject: "data",          rule: "View filters+sorts → query → ordered records", enforcement: "show all on filter failure", mandatory: true },
    { subject: "presentation",  rule: "Style → rendered items", enforcement: "default card on missing style", mandatory: true },
    { subject: "interaction",   rule: "Interaction records → gesture handlers", enforcement: "tap=detail on missing", mandatory: true },
    { subject: "state",         rule: "ViewState → applied runtime condition", enforcement: "create default on missing", mandatory: true },
    { subject: "reactivity",    rule: "Subscriptions → diff → re-render", enforcement: "poll fallback on sub failure", mandatory: true },
  ]
}
```

## What This Means for MessageCenter

The current MessageCenter has:
- 5 hardcoded tabs → becomes 1 ViewGroup with 5 Views
- Inline `encodeFilter()` calls → becomes Filter records on each View
- Inline sort logic → becomes Sort records on each View
- ThreadRow, TaskCard, ContentCard → becomes 3 Style records with a generic card renderer
- Inline onPress/onLongPress → becomes Interaction records
- 15+ useState hooks → collapses into ViewState records
- Manual badge counting → becomes Function records on NavigationNodes

The refactor (Step 2 in SESSION-NOTES) proves this protocol works by converting MessageCenter from hand-coded to model-driven.
