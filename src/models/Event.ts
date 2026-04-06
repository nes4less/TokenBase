import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Event — something that happened in the graph.
 *
 * Events are the universal record of occurrences: user actions,
 * system triggers, external signals, state transitions. They're
 * polymorphic (attached to any entity), typed, and layered.
 *
 * Distinct from Log (which is an operational record) and Delta
 * (which is a structural change). Events are semantic — they
 * capture what happened in domain terms, not what changed in data.
 */
export class Event extends Entity {
  static collection: string = 'events'

  /** Who or what caused this event */
  actorId: string | null

  /** The entity this event relates to */
  entityId: string | null
  entityType: string | null

  /** Visibility/processing layer */
  layer: string | null

  /** Whether this was entered manually (vs system-generated) */
  manualEntry: boolean

  metadata: MetadataEntry[]

  /** Origin system or subsystem */
  source: string | null

  /** When the event occurred (may differ from createdAt) */
  timestamp: string | null

  translations: { [key: string]: string }

  /** Domain-specific event type */
  type: string | null

  constructor(data?: Partial<Event>) {
    super(data)
    this.actorId = data?.actorId || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.layer = data?.layer || null
    this.manualEntry = data?.manualEntry ?? false
    this.metadata = data?.metadata || []
    this.source = data?.source || null
    this.timestamp = data?.timestamp || null
    this.translations = data?.translations || {}
    this.type = data?.type || null
  }
}
