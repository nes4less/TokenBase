/**
 * Range — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema, NameableSchema, DescribableSchema } from './shared'

export const RangeCreateSchema = EntityFieldsSchema
  .merge(PolymorphicSchema)
  .merge(NameableSchema)
  .merge(DescribableSchema)
  .extend({
    inclusive: z.boolean().optional(),
    key: z.string().nullable().optional(),
    max: z.number().nullable().optional(),
    metadata: z.array(MetadataEntrySchema).optional(),
    min: z.number().nullable().optional(),
    scope: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    unit: z.string().nullable().optional(),
  })

export const RangeUpdateSchema = RangeCreateSchema.partial()
export type RangeCreateInput = z.infer<typeof RangeCreateSchema>
export type RangeUpdateInput = z.infer<typeof RangeUpdateSchema>
