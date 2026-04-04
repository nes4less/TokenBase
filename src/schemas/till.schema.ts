import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema } from './shared'

export const TillCorrectionActionSchema = z.enum([
  'audit', 'credit', 'debit',
])

export const TillCorrectionSchema = z.object({
  id: z.string().uuid().optional(),
  action: TillCorrectionActionSchema.optional(),
  amount: z.number(),
  correctedAt: z.string().datetime().optional(),
  orderId: z.string().nullable().optional(),
})

export const TillCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  businessId: z.string().nullable().optional(),
  corrections: z.array(TillCorrectionSchema).optional(),
  title: z.string().nullable().optional(),
})

export const TillUpdateSchema = TillCreateSchema.partial()
export type TillCreateInput = z.infer<typeof TillCreateSchema>
export type TillUpdateInput = z.infer<typeof TillUpdateSchema>
