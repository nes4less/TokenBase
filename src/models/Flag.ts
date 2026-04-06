import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Flag — a moderation or signaling marker on any entity.
 *
 * Flags are how the system (or users) mark entities for review,
 * moderation, attention, or processing. They're polymorphic
 * (attached to any entity), typed, and carry a reason.
 *
 * In CRUBA terms, a Flag is related to but distinct from Block.
 * Flags signal attention; Blocks restrict access. A Flag may
 * lead to a Block, but they're separate operations.
 */
export class Flag extends Entity {
  static collection: string = 'flags'

  entityId: string | null
  entityType: string | null
  metadata: MetadataEntry[]

  /** Why this entity was flagged */
  reason: string | null

  /** 'pending' | 'reviewed' | 'dismissed' | 'actioned' */
  status: string | null

  /** Flag category */
  type: string | null

  constructor(data?: Partial<Flag>) {
    super(data)
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.metadata = data?.metadata || []
    this.reason = data?.reason || null
    this.status = data?.status || null
    this.type = data?.type || null
  }
}
