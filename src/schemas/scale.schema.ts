/**
 * Scale — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema } from './shared'

export const ScaleDimensionSchema = z.enum([
  'magnitude', 'frequency', 'complexity', 'trust', 'cost',
  'priority', 'reach', 'granularity', 'sensitivity', 'custom',
])

export const ScaleBoundSchema = z.object({
  label: z.string().min(1),
  value: z.number(),
  action: z.string().nullable().optional(),
})

export const ScaleCreateSchema = EntityFieldsSchema
  .extend({
    entityId: z.string().min(1),
    entityType: z.string().nullable().optional(),
    dimension: ScaleDimensionSchema,
    customDimension: z.string().nullable().optional(),
    scopeId: z.string().nullable().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    current: z.number().nullable().optional(),
    bounds: z.array(ScaleBoundSchema).optional(),
    unit: z.string().nullable().optional(),
    adaptive: z.boolean().optional(),
    adaptRate: z.number().min(0).max(1).optional(),
    metadata: z.array(MetadataEntrySchema).optional(),
  })

export const ScaleUpdateSchema = ScaleCreateSchema.partial()
export type ScaleCreateInput = z.infer<typeof ScaleCreateSchema>
export type ScaleUpdateInput = z.infer<typeof ScaleUpdateSchema>
