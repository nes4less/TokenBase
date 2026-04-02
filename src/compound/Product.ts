import { MetadataEntry } from '../models/Traits'
import { generateDateString, generateUUID } from '../utils'
import { Identifier } from '../models/Identifier'
import { Dimensions } from '../models/Measurement'
import { Image } from '../models/Image'
import { Tag } from '../models/Tag'

/**
 * Product — a sellable item definition.
 *
 * Products are the template — what something IS. Units are
 * individual instances of a product (what's actually in stock).
 * A product has identity (title, SKU, barcodes), presentation
 * (images), physical properties (dimensions), and categorization
 * (tags, catalogId).
 *
 * Origin: CashierFu POS/inventory system. Core commerce primitive.
 */
export class Product {
  static collection: string = 'products'
  identifiers: Identifier[]
  /** Reference to the catalog this product belongs to */
  catalogId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  dimensions: Dimensions | null
  id: string
  images: Image[]
  metadata: MetadataEntry[]
  /** Stock keeping unit identifier */
  sku: string | null
  subtitle: string | null
  tags: Tag[]
  /** Whether this product is subject to tax */
  taxable: boolean
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Product>) {
    this.identifiers = data?.identifiers?.map(i => new Identifier(i)) || []
    this.catalogId = data?.catalogId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.dimensions = data?.dimensions ? new Dimensions(data.dimensions) : null
    this.id = data?.id || generateUUID()
    this.images = data?.images?.map(i => new Image(i)) || []
    this.metadata = data?.metadata || []
    this.sku = data?.sku || null
    this.subtitle = data?.subtitle || null
    this.tags = data?.tags?.map(t => new Tag(t)) || []
    this.taxable = data?.taxable ?? true
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
