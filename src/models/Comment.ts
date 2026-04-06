import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Comment — a textual annotation attached to any entity.
 *
 * Comments are polymorphic (entityId + entityType), threaded
 * (parentId for replies), and translatable. They support
 * closing (resolved state) and tagging.
 *
 * In the graph: Comment is a node with an edge to the entity
 * it annotates and optional parent edge for threading.
 */
export class Comment extends Entity {
  static collection: string = 'comments'

  /** The comment text */
  body: string | null

  /** Whether this comment thread is resolved */
  closed: boolean
  closedAt: string | null

  /** The entity this comment is attached to */
  entityId: string | null
  entityType: string | null

  /** Language code (ISO 639-1) */
  language: string | null

  metadata: MetadataEntry[]

  /** Parent comment ID for threaded replies */
  parentId: string | null

  /** Who authored this comment */
  personId: string | null

  /** Optional sub-entity targeting (e.g., a specific field or section) */
  subEntityId: string | null
  subEntityType: string | null

  tags: string[]

  /** Keyed by language code */
  translations: { [key: string]: string }

  constructor(data?: Partial<Comment>) {
    super(data)
    this.body = data?.body || null
    this.closed = data?.closed ?? false
    this.closedAt = data?.closedAt || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.language = data?.language || null
    this.metadata = data?.metadata || []
    this.parentId = data?.parentId || null
    this.personId = data?.personId || null
    this.subEntityId = data?.subEntityId || null
    this.subEntityType = data?.subEntityType || null
    this.tags = data?.tags || []
    this.translations = data?.translations || {}
  }
}
