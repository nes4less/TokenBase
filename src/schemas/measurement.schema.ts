import { z } from 'zod'
import { DimensionsEmbeddedSchema, LengthMeasureSchema, WeightMeasureSchema } from './shared'

export const DimensionsCreateSchema = DimensionsEmbeddedSchema
export const DimensionsUpdateSchema = DimensionsCreateSchema.partial()
export type DimensionsCreateInput = z.infer<typeof DimensionsCreateSchema>
export type DimensionsUpdateInput = z.infer<typeof DimensionsUpdateSchema>

// Re-export measure schemas for direct use
export { LengthMeasureSchema, WeightMeasureSchema }
