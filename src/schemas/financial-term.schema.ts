import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, ValidatableSchema } from './shared'

export const FinancialDirectionSchema = z.enum(['up', 'down'])
export const MagnitudeTypeSchema = z.enum(['percentage', 'absolute'])

export const FinancialTermTypeSchema = z.enum([
  // Revenue / incoming
  'charge', 'payment', 'credit', 'premium', 'incentive',
  'rebate', 'tip', 'gratuity', 'dividend', 'yield', 'appreciate',
  // Cost / outgoing
  'fee', 'cost', 'tax', 'penalty', 'depreciate',
  'chargeback', 'levy', 'surcharge', 'forfeit', 'writeoff',
  // Reductions
  'discount', 'exemption', 'prorate', 'allowance',
  // Structural / reference
  'base', 'price', 'rate', 'value', 'msrp',
  'market', 'subtotal', 'margin',
  // Adjustments
  'adjustment', 'correction', 'audit', 'refund', 'exchange',
  // Holds / commitments
  'hold', 'stop', 'deposit', 'retainer', 'escrow', 'commitment',
  // Authorization flow
  'authorization', 'preauthorization', 'clear', 'void', 'bounce',
  // Recurring
  'subscription', 'extension', 'royalty',
  // Splits
  'commission', 'cut', 'share',
  // Offers
  'offer',
  // Bounds
  'cap', 'floor',
  // Investment
  'hedge', 'investment',
])

export const FinancialTermCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).merge(ValidatableSchema).extend({
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  direction: FinancialDirectionSchema.optional(),
  logicFunction: z.string().nullable().optional(),
  magnitudeType: MagnitudeTypeSchema.optional(),
  name: z.string().nullable().optional(),
  references: z.array(z.string()).optional(),
  term: FinancialTermTypeSchema,
  value: z.number(),
})

export const FinancialTermUpdateSchema = FinancialTermCreateSchema.partial()
export type FinancialTermCreateInput = z.infer<typeof FinancialTermCreateSchema>
export type FinancialTermUpdateInput = z.infer<typeof FinancialTermUpdateSchema>
