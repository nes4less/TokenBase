/**
 * Flag — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema } from './shared'

export const FlagCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).extend({
  metadata: z.array(MetadataEntrySchema).optional(),
  reason: z.string().nullable().optional(),
  status: z.enum(['pending', 'reviewed', 'dismissed', 'actioned']).nullable().optional(),
  type: z.string().nullable().optional(),
})

export const FlagUpdateSchema = FlagCreateSchema.partial()
export type FlagCreateInput = z.infer<typeof FlagCreateSchema>
export type FlagUpdateInput = z.infer<typeof FlagUpdateSchema>
