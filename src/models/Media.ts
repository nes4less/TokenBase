import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Media — a file or asset in the graph.
 *
 * Media represents raw artifacts: images, video, audio, documents,
 * 3D models. It's polymorphic (attached to any entity), typed,
 * and carries a URL to the actual asset.
 *
 * Distinct from Content (which is authored material that may
 * contain Media references) and Image (which is a lightweight
 * embedded image reference). Media is the full-fat file entity.
 *
 * In TokenVision, Media is the universal file node — all visual
 * and audio assets are Media with domain-specific metadata.
 */
export class Media extends Entity {
  static collection: string = 'media'

  blurhash: string | null
  entityId: string | null
  entityType: string | null
  metadata: MetadataEntry[]
  tags: string[]
  thumbnailUrl: string | null

  /** 'image' | 'video' | 'audio' | 'document' | '3d' | 'ar' */
  type: string | null

  uploadedBy: string | null
  url: string | null
  visible: boolean

  constructor(data?: Partial<Media>) {
    super(data)
    this.blurhash = data?.blurhash || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.metadata = data?.metadata || []
    this.tags = data?.tags || []
    this.thumbnailUrl = data?.thumbnailUrl || null
    this.type = data?.type || null
    this.uploadedBy = data?.uploadedBy || null
    this.url = data?.url || null
    this.visible = data?.visible ?? true
  }
}
