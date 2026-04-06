import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * PublicationSubscription — a follow/subscribe relationship to a publication.
 *
 * Connects a subscriber (org or person) to a Publication.
 * Tracks sync state (last synced version), clone status,
 * and mode (live, snapshot, mirror).
 *
 * Named PublicationSubscription (not Subscription) to avoid
 * collision with the reactive Subscription interface in data/types.
 *
 * In the graph: an edge-like entity connecting a subscriber
 * node to a publication node, with sync metadata.
 */
export class PublicationSubscription extends Entity {
  static collection: string = 'publication_subscriptions'

  /** When the publication was cloned locally */
  clonedAt: string | null

  /** Last synced version for incremental updates */
  lastSyncedVersion: string | null

  metadata: MetadataEntry[]

  /** 'live' | 'snapshot' | 'mirror' */
  mode: string | null

  publicationId: string | null
  subscriberOrgId: string | null
  tags: string[]

  constructor(data?: Partial<PublicationSubscription>) {
    super(data)
    this.clonedAt = data?.clonedAt || null
    this.lastSyncedVersion = data?.lastSyncedVersion || null
    this.metadata = data?.metadata || []
    this.mode = data?.mode || null
    this.publicationId = data?.publicationId || null
    this.subscriberOrgId = data?.subscriberOrgId || null
    this.tags = data?.tags || []
  }
}
