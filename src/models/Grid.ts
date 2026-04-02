import { generateDateString, generateUUID } from '../utils'

/**
 * GridSlot — a single position within a grid layout.
 *
 * Each slot has an index (position) and can reference a product.
 * Think of it as a shelf spot in a store or a cell in a warehouse map.
 */
export class GridSlot {
  id: string
  index: number
  /** Reference to the product displayed in this slot */
  productId: string | null
  metadata: Record<string, string>
  constructor(data?: Partial<GridSlot>) {
    this.id = data?.id || generateUUID()
    this.index = data?.index ?? 0
    this.productId = data?.productId || null
    this.metadata = data?.metadata || {}
  }
}

/**
 * Grid — a spatial layout system for organizing products or units.
 *
 * Grids represent physical or virtual arrangements — point-of-sale
 * button layouts, warehouse floor maps, display planograms.
 * Each grid contains ordered slots that reference products.
 *
 * Origin: CashierFu POS system (register button grid).
 */
export class Grid {
  static collection: string = 'grids'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  id: string
  metadata: Record<string, string>
  slots: GridSlot[]
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Grid>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.slots = data?.slots?.map(s => new GridSlot(s)) || []
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
