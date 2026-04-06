/**
 * TokenBase Validation Schemas
 *
 * Zod schemas for all models — validated at MCP/API boundaries,
 * not in constructors. Each schema provides Create (what's valid input)
 * and Update (partial of Create) variants.
 *
 * Design Decision D2: Zod co-located schemas, boundary validation,
 * z.infer<> for type generation.
 */

// ─── Shared Primitives ───
export * from './shared'

// ─── Base / Primitives ───
export * from './entity.schema'
export * from './image.schema'
export * from './measurement.schema'
export * from './note.schema'
export * from './tag.schema'
export * from './identifier.schema'

// ─── Structure & Topology ───
export * from './context.schema'
export * from './grid.schema'
export * from './group.schema'
export * from './map.schema'
export * from './queue.schema'
export * from './relationship.schema'
export * from './scope.schema'
export * from './set.schema'
export * from './style.schema'
export * from './thread.schema'
export * from './unifier.schema'

// ─── Data Operations ───
export * from './filter.schema'
export * from './log.schema'
export * from './sort.schema'

// ─── Operations ───
export * from './async.schema'
export * from './function.schema'
export * from './handshake.schema'
export * from './instruction.schema'
export * from './interaction.schema'
export * from './prompt.schema'
export * from './protocol.schema'

// ─── Financial ───
export * from './financial-term.schema'

// ─── Time ───
export * from './time-term.schema'

// ─── Views & Navigation ───
export * from './navigation.schema'
export * from './view.schema'
export * from './view-group.schema'
export * from './view-state.schema'

// ─── Agent / Automation ───
export * from './agent-flow.schema'
export * from './improvement.schema'

// ─── Design Knowledge ───
export * from './bug-pattern.schema'
export * from './design-choice.schema'
export * from './rule-outcome.schema'

// ─── Change & Versioning ───
export * from './delta.schema'

// ─── Magnitude & Range ───
export * from './scale.schema'

// ─── Cost & Certainty ───
export * from './bandwidth.schema'

// ─── Security ───
export * from './key-vault.schema'

// ─── Surface Models ───
export * from './comment.schema'
export * from './content.schema'
export * from './data-feed.schema'
export * from './event.schema'
export * from './flag.schema'
export * from './location.schema'
export * from './media.schema'
export * from './message.schema'
export * from './module.schema'
export * from './notification.schema'
export * from './organization.schema'
export * from './person.schema'
export * from './publication.schema'
export * from './query.schema'
export * from './range.schema'
export * from './publication-subscription.schema'

// ─── Compound ───
export * from './business.schema'
export * from './container.schema'
export * from './order.schema'
export * from './product.schema'
export * from './reader.schema'
export * from './till.schema'
export * from './timecard.schema'
export * from './unit.schema'
