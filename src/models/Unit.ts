import { generateDateString, generateUUID } from '../utils'
import { Barcode } from './Barcode'
import { Dimensions } from './Measurement'
import { Image } from './Image'
import { Tag } from './Tag'

/**
 * Unit status progression.
 */
export type UnitStatusValue = 'active' | 'inactive' | 'pending' | 'audited' | 'sold' | 'returned' | 'damaged'

/**
 * UnitStatus — timestamped status entry for tracking unit lifecycle.
 */
export class UnitStatus {
  createdAt: string
  id: string
  value: UnitStatusValue
  constructor(data?: Partial<UnitStatus>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.id = data?.id || generateUUID()
    this.value = data?.value || 'pending'
  }
}

/**
 * Unit — an individual instance of a product.
 *
 * Products define what something IS. Units are actual inventory —
 * the physical item with its own price, location, and status history.
 * A product can have many units (e.g., 50 units of "Coffee Beans" in stock).
 *
 * Origin: CashierFu POS/inventory system.
 */
export class Unit {
  static collection: string = 'units'
  /** Price in smallest currency unit (cents) */
  amount: number
  barcodes: Barcode[]
  catalogId: string | null
  /** Reference to the container holding this unit */
  containerId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  dimensions: Dimensions | null
  id: string
  images: Image[]
  metadata: Record<string, string>
  /** Reference to the product this unit is an instance of */
  productId: string | null
  sku: string | null
  statuses: UnitStatus[]
  subtitle: string | null
  tags: Tag[]
  taxable: boolean
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Unit>) {
    this.amount = data?.amount ?? 0
    this.barcodes = data?.barcodes?.map(b => new Barcode(b)) || []
    this.catalogId = data?.catalogId || null
    this.containerId = data?.containerId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.dimensions = data?.dimensions ? new Dimensions(data.dimensions) : null
    this.id = data?.id || generateUUID()
    this.images = data?.images?.map(i => new Image(i)) || []
    this.metadata = data?.metadata || {}
    this.productId = data?.productId || null
    this.sku = data?.sku || null
    this.statuses = data?.statuses?.map(s => new UnitStatus(s)) || []
    this.subtitle = data?.subtitle || null
    this.tags = data?.tags?.map(t => new Tag(t)) || []
    this.taxable = data?.taxable ?? true
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
