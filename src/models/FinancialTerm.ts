import { generateDateString, generateUUID } from '../utils'

/**
 * Direction of a financial term's effect on the running total.
 */
export type FinancialDirection = 'up' | 'down'

/**
 * Whether the term represents a percentage or an absolute value.
 */
export type MagnitudeType = 'percentage' | 'absolute'

/**
 * All recognized financial term types.
 *
 * Each has an acute meaning, a direction, and a place in the equation.
 * By placing language on all of them, complex financial equations
 * become composable named operations instead of raw math.
 */
export type FinancialTermType =
  // Revenue / incoming
  | 'charge'
  | 'payment'
  | 'credit'
  | 'premium'
  | 'incentive'
  | 'rebate'
  | 'tip'
  | 'gratuity'
  | 'dividend'
  | 'yield'
  | 'appreciate'
  // Cost / outgoing
  | 'fee'
  | 'cost'
  | 'tax'
  | 'penalty'
  | 'depreciate'
  | 'chargeback'
  | 'levy'
  | 'surcharge'
  | 'forfeit'
  | 'writeoff'
  // Reductions
  | 'discount'
  | 'exemption'
  | 'prorate'
  | 'allowance'
  // Structural / reference
  | 'base'
  | 'price'
  | 'rate'
  | 'value'
  | 'msrp'
  | 'market'
  | 'subtotal'
  | 'margin'
  // Adjustments
  | 'adjustment'
  | 'correction'
  | 'audit'
  | 'refund'
  | 'exchange'
  // Holds / commitments
  | 'hold'
  | 'stop'
  | 'deposit'
  | 'retainer'
  | 'escrow'
  | 'commitment'
  // Authorization flow
  | 'authorization'
  | 'preauthorization'
  | 'clear'
  | 'void'
  | 'bounce'
  // Recurring
  | 'subscription'
  | 'extension'
  | 'royalty'
  // Splits
  | 'commission'
  | 'cut'
  | 'share'
  // Offers
  | 'offer'
  // Bounds
  | 'cap'
  | 'floor'
  // Investment
  | 'hedge'
  | 'investment'

/**
 * FinancialTerm — a typed, directional monetary operation with semantic meaning.
 *
 * Instead of wiring together raw math, you compose named operations
 * that self-describe their role in the equation. Each term knows its
 * direction, magnitude, what it references, and where it applies.
 *
 * Context handles display. The term is pure logic.
 */
export class FinancialTerm {
  static collection: string = 'financial_terms'
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  /** Human-readable description of this term's purpose */
  description: string | null
  /** Up (adds to total) or down (subtracts from total) */
  direction: FinancialDirection
  id: string
  /** Logical function — how this term computes against its references */
  logicFunction: string | null
  /** Percentage or absolute value */
  magnitudeType: MagnitudeType
  metadata: Record<string, string>
  /** Display name for this specific instance */
  name: string | null
  /** IDs of other FinancialTerms this one is relative to */
  references: string[]
  /** The semantic term type */
  term: FinancialTermType
  updatedAt: string
  /** The numeric value (percentage 0-100, or absolute amount) */
  value: number
  constructor(data?: Partial<FinancialTerm>) {
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.direction = data?.direction || 'up'
    this.id = data?.id || generateUUID()
    this.logicFunction = data?.logicFunction || null
    this.magnitudeType = data?.magnitudeType || 'absolute'
    this.metadata = data?.metadata || {}
    this.name = data?.name || null
    this.references = data?.references || []
    this.term = data?.term || 'charge'
    this.updatedAt = data?.updatedAt || generateDateString()
    this.value = data?.value ?? 0
  }
}
