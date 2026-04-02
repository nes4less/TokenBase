import { generateDateString, generateUUID } from '../utils'

/**
 * Discount — a reusable discount definition.
 *
 * Can be percentage-based, fixed amount, or both combined.
 * Applied to orders as OrderDiscount snapshots.
 * Can be triggered by scanning a barcode.
 *
 * Origin: CashierFu POS system.
 */
export class Discount {
  static collection: string = 'discounts'
  /** Fixed discount amount (in smallest currency unit) */
  amount: number
  /** Barcode that triggers this discount when scanned */
  barcode: string | null
  /** Reference to the business this discount belongs to */
  businessId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  id: string
  metadata: Record<string, string>
  /** Percentage discount (0-1, e.g., 0.10 = 10%) */
  percent: number
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Discount>) {
    this.amount = data?.amount ?? 0
    this.barcode = data?.barcode || null
    this.businessId = data?.businessId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.percent = data?.percent ?? 0
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}

/**
 * Tax — a reusable tax definition.
 *
 * Can be percentage-based, fixed amount, or both combined.
 * Applied to orders as OrderTax snapshots.
 *
 * Origin: CashierFu POS system.
 */
export class Tax {
  static collection: string = 'taxes'
  /** Fixed tax amount */
  amount: number
  /** Reference to the business this tax belongs to */
  businessId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  id: string
  metadata: Record<string, string>
  /** Tax percentage (0-1, e.g., 0.085 = 8.5%) */
  percent: number
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Tax>) {
    this.amount = data?.amount ?? 0
    this.businessId = data?.businessId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.percent = data?.percent ?? 0
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
