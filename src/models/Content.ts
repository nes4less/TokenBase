import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Content — a publishable block of structured content.
 *
 * Content is the universal container for authored material:
 * articles, pages, posts, documents, rich text blocks. It's
 * polymorphic (attached to any entity), categorizable,
 * translatable, and supports attachments.
 *
 * Separate from Media (which is a file/asset). Content is
 * the authored wrapper; Media is the raw artifact.
 */
export class Content extends Entity {
  static collection: string = 'content'

  attachments: { url: string; name: string; type: string; size?: number }[]
  blurhash: string | null
  category: string[]
  entityId: string | null
  entityType: string | null
  expiresAt: string | null
  image: string | null
  images: string[]
  language: string | null
  metadata: MetadataEntry[]
  published: boolean
  section: string | null
  slug: string | null
  tags: string[]
  title: string | null
  translations: { [key: string]: string }
  type: string | null

  constructor(data?: Partial<Content>) {
    super(data)
    this.attachments = data?.attachments || []
    this.blurhash = data?.blurhash || null
    this.category = data?.category || []
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.expiresAt = data?.expiresAt || null
    this.image = data?.image || null
    this.images = data?.images || []
    this.language = data?.language || null
    this.metadata = data?.metadata || []
    this.published = data?.published ?? false
    this.section = data?.section || null
    this.slug = data?.slug || null
    this.tags = data?.tags || []
    this.title = data?.title || null
    this.translations = data?.translations || {}
    this.type = data?.type || null
  }
}
