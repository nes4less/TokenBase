import { generateDateString, generateUUID } from '../utils'
import { Image } from '../models/Image'

/**
 * Business — a merchant or store entity.
 *
 * Represents a business that sells products, processes payments,
 * and manages inventory. Can connect to Stripe for payment processing.
 * Products, orders, tills, and readers all reference a business.
 *
 * Origin: CashierFu POS system.
 */
export class Business {
  static collection: string = 'businesses'
  address1: string | null
  address2: string | null
  city: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  email: string | null
  id: string
  images: Image[]
  info: string | null
  metadata: Record<string, string>
  phone: string | null
  state: string | null
  /** Stripe Connect account ID for payment processing */
  stripeAccountId: string | null
  /** Tax amount (fixed) applied to orders */
  taxAmount: number
  /** Tax percentage applied to taxable items */
  taxPercent: number
  title: string | null
  zip: string | null
  updatedAt: string
  constructor(data?: Partial<Business>) {
    this.address1 = data?.address1 || null
    this.address2 = data?.address2 || null
    this.city = data?.city || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.email = data?.email || null
    this.id = data?.id || generateUUID()
    this.images = data?.images?.map(i => new Image(i)) || []
    this.info = data?.info || null
    this.metadata = data?.metadata || {}
    this.phone = data?.phone || null
    this.state = data?.state || null
    this.stripeAccountId = data?.stripeAccountId || null
    this.taxAmount = data?.taxAmount ?? 0
    this.taxPercent = data?.taxPercent ?? 0
    this.title = data?.title || null
    this.zip = data?.zip || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
