import { MetadataEntry } from '../models/Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * PaymentType — method of payment.
 */
export type PaymentType = 'cash' | 'card' | 'check' | 'giftCard' | 'storeCredit' | 'external'

/**
 * OrderItem — a line item within an order.
 *
 * Snapshot of a product at time of sale: captures the price, quantity,
 * and taxability. References the source product by ID but carries its
 * own copy of title/amount so the order is self-contained.
 */
export class OrderItem {
  amount: number
  barcode: string | null
  id: string
  productId: string | null
  quantity: number
  taxable: boolean
  title: string | null
  constructor(data?: Partial<OrderItem>) {
    this.amount = data?.amount ?? 0
    this.barcode = data?.barcode || null
    this.id = data?.id || generateUUID()
    this.productId = data?.productId || null
    this.quantity = data?.quantity ?? 1
    this.taxable = data?.taxable ?? true
    this.title = data?.title || null
  }
}

/**
 * OrderDiscount — a discount applied to an order.
 *
 * Can be percentage-based, fixed amount, or both.
 * References the source Discount definition by ID.
 */
export class OrderDiscount {
  amount: number
  barcode: string | null
  discountId: string | null
  id: string
  percent: number
  title: string | null
  constructor(data?: Partial<OrderDiscount>) {
    this.amount = data?.amount ?? 0
    this.barcode = data?.barcode || null
    this.discountId = data?.discountId || null
    this.id = data?.id || generateUUID()
    this.percent = data?.percent ?? 0
    this.title = data?.title || null
  }
}

/**
 * OrderTax — a tax line applied to an order.
 *
 * Can be percentage-based, fixed amount, or both.
 * References the source Tax definition by ID.
 */
export class OrderTax {
  amount: number
  id: string
  percent: number
  taxId: string | null
  title: string | null
  constructor(data?: Partial<OrderTax>) {
    this.amount = data?.amount ?? 0
    this.id = data?.id || generateUUID()
    this.percent = data?.percent ?? 0
    this.taxId = data?.taxId || null
    this.title = data?.title || null
  }
}

/**
 * OrderPayment — a payment applied toward an order.
 */
export class OrderPayment {
  amount: number
  id: string
  paidAt: string | null
  type: PaymentType | null
  constructor(data?: Partial<OrderPayment>) {
    this.amount = data?.amount ?? 0
    this.id = data?.id || generateUUID()
    this.paidAt = data?.paidAt || null
    this.type = data?.type || null
  }
}

/**
 * Order — a complete sales transaction.
 *
 * Composed of items, discounts, taxes, and payments.
 * Self-contained: all line items are snapshots at time of sale,
 * not live references. Carries full calculation logic for
 * pretotal, tax, discount, subtotal, total, and amount due.
 *
 * Status is derived from completedAt/heldAt/payments, not stored.
 *
 * Origin: CashierFu POS system. Core commerce primitive.
 */
export class Order {
  static collection: string = 'orders'
  /** Reference to the business this order belongs to */
  businessId: string | null
  completedAt: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  discounts: OrderDiscount[]
  heldAt: string | null
  id: string
  items: OrderItem[]
  metadata: MetadataEntry[]
  payments: OrderPayment[]
  taxes: OrderTax[]
  updatedAt: string
  constructor(data?: Partial<Order>) {
    this.businessId = data?.businessId || null
    this.completedAt = data?.completedAt || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.discounts = data?.discounts?.map(d => new OrderDiscount(d)) || []
    this.heldAt = data?.heldAt || null
    this.id = data?.id || generateUUID()
    this.items = data?.items?.map(i => new OrderItem(i)) || []
    this.metadata = data?.metadata || []
    this.payments = data?.payments?.map(p => new OrderPayment(p)) || []
    this.taxes = data?.taxes?.map(t => new OrderTax(t)) || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }

  // ─── Derived Status ───

  get status(): 'completed' | 'noSale' | 'held' | 'pending' {
    if (this.completedAt) {
      return this.payments.length > 0 ? 'completed' : 'noSale'
    }
    return this.heldAt ? 'held' : 'pending'
  }

  // ─── Calculations ───

  get quantity(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0)
  }

  get taxablePretotal(): number {
    return this.items
      .filter(i => i.taxable)
      .reduce((sum, i) => sum + i.quantity * i.amount, 0)
  }

  get nonTaxablePretotal(): number {
    return this.items
      .filter(i => !i.taxable)
      .reduce((sum, i) => sum + i.quantity * i.amount, 0)
  }

  get pretotal(): number {
    return this.taxablePretotal + this.nonTaxablePretotal
  }

  get taxTotal(): number {
    const fixedTax = this.taxes.reduce((sum, t) => sum + t.amount, 0)
    const percentTax = this.taxes.reduce((sum, t) => sum + t.percent, 0)
    return fixedTax + this.taxablePretotal * percentTax
  }

  get discountTotal(): number {
    const fixedDiscount = this.discounts.reduce((sum, d) => sum + d.amount, 0)
    const percentDiscount = this.discounts.reduce((sum, d) => sum + d.percent, 0)
    return fixedDiscount + this.pretotal * percentDiscount
  }

  get paymentTotal(): number {
    return this.payments.reduce((sum, p) => sum + p.amount, 0)
  }

  get subtotal(): number {
    return this.pretotal - this.discountTotal
  }

  get total(): number {
    return this.subtotal + this.taxTotal
  }

  get due(): number {
    return this.total - this.paymentTotal
  }
}
