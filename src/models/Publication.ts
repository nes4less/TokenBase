import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Publication — a versioned, distributable bundle.
 *
 * Publications are how content, modules, or data packages
 * are bundled and shared. They carry versioning, visibility
 * controls, and organization ownership.
 *
 * In TokenStream, Publications are the marketplace listing unit.
 * In the broader graph, they represent any "published thing"
 * that others can subscribe to.
 */
export class Publication extends Entity {
  static collection: string = 'publications'

  /** Bundle identifier (for packaged publications) */
  bundle: string | null

  category: string | null
  description: string | null
  metadata: MetadataEntry[]
  name: string | null

  /** Owning organization */
  orgId: string | null

  tags: string[]
  type: string | null
  version: string | null

  /** 'public' | 'private' | 'unlisted' | 'restricted' */
  visibility: string | null

  constructor(data?: Partial<Publication>) {
    super(data)
    this.bundle = data?.bundle || null
    this.category = data?.category || null
    this.description = data?.description || null
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.orgId = data?.orgId || null
    this.tags = data?.tags || []
    this.type = data?.type || null
    this.version = data?.version || null
    this.visibility = data?.visibility || null
  }
}
