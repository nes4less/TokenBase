import { MetadataEntry } from '../models/Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * Till correction actions.
 */
export type TillCorrectionAction = 'audit' | 'credit' | 'debit'

/**
 * TillCorrection — a single adjustment to the till balance.
 *
 * Audits set the baseline. Credits and debits adjust from there.
 * The till balance is calculated by finding the most recent audit,
 * then applying all corrections since.
 */
export class TillCorrection {
  action: TillCorrectionAction
  amount: number
  correctedAt: string
  id: string
  /** Reference to the order that caused this correction (if any) */
  orderId: string | null
  constructor(data?: Partial<TillCorrection>) {
    this.action = data?.action || 'audit'
    this.amount = data?.amount ?? 0
    this.correctedAt = data?.correctedAt || generateDateString()
    this.id = data?.id || generateUUID()
    this.orderId = data?.orderId || null
  }
}

/**
 * Till — a cash register or cash drawer.
 *
 * Tracks cash balance through a correction trail: audits set the
 * known balance, credits/debits adjust from there. Balance is always
 * calculated, never stored — the corrections ARE the source of truth.
 *
 * Origin: CashierFu POS system.
 */
export class Till {
  static collection: string = 'tills'
  /** Reference to the business this till belongs to */
  businessId: string | null
  corrections: TillCorrection[]
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  id: string
  metadata: MetadataEntry[]
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Till>) {
    this.businessId = data?.businessId || null
    this.corrections = data?.corrections?.map(c => new TillCorrection(c)) || []
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || []
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }

  /**
   * Calculate the current till balance.
   *
   * Finds the most recent audit, uses its amount as baseline,
   * then applies all credits/debits that occurred after it.
   */
  get balance(): number {
    const sorted = [...this.corrections].sort(
      (a, b) => new Date(b.correctedAt).getTime() - new Date(a.correctedAt).getTime()
    )
    const latestAudit = sorted.find(c => c.action === 'audit')
    if (!latestAudit) {
      return sorted.reduce((sum, c) => sum + c.amount, 0)
    }
    const auditTime = new Date(latestAudit.correctedAt).getTime()
    const adjustments = sorted.filter(
      c => c.action !== 'audit' && new Date(c.correctedAt).getTime() >= auditTime
    )
    return latestAudit.amount + adjustments.reduce((sum, c) => sum + c.amount, 0)
  }
}
