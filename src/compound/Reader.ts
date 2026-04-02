import { MetadataEntry } from '../models/Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * ReaderDeviceType — supported payment terminal hardware.
 */
export type ReaderDeviceType =
  | 'verifone_P400'
  | 'bbpos_wisepos_e'
  | 'simulated_wisepos_e'

/**
 * Reader — a payment terminal or card reader.
 *
 * Represents physical hardware that accepts card payments.
 * Connected via Stripe Terminal. References a business and
 * carries the Stripe reader ID for API operations.
 *
 * Origin: CashierFu POS system (Stripe Terminal integration).
 */
export class Reader {
  static collection: string = 'readers'
  /** Reference to the business this reader belongs to */
  businessId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  /** The hardware device type */
  deviceType: ReaderDeviceType | null
  id: string
  metadata: MetadataEntry[]
  /** Stripe Terminal reader ID */
  stripeReaderId: string | null
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Reader>) {
    this.businessId = data?.businessId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.deviceType = data?.deviceType || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || []
    this.stripeReaderId = data?.stripeReaderId || null
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
