import { generateDateString, generateUUID } from '../utils'
import { Image } from './Image'
import { Tag } from './Tag'

/**
 * Catalog — a collection or grouping of products.
 *
 * Catalogs organize products into browsable sets — seasonal collections,
 * category groupings, promotional bundles, supplier lists.
 * Products reference their catalog by ID.
 *
 * Origin: CashierFu POS system.
 */
export class Catalog {
  static collection: string = 'catalogs'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  images: Image[]
  metadata: Record<string, string>
  subtitle: string | null
  tags: Tag[]
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Catalog>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.images = data?.images?.map(i => new Image(i)) || []
    this.metadata = data?.metadata || {}
    this.subtitle = data?.subtitle || null
    this.tags = data?.tags?.map(t => new Tag(t)) || []
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
