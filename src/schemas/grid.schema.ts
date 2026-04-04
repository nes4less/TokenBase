import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema } from './shared'

export const GridSlotSchema = z.object({
  id: z.string().uuid().optional(),
  index: z.number().int().nonnegative().optional(),
  productId: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const GridCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  slots: z.array(GridSlotSchema).optional(),
  title: z.string().nullable().optional(),
})

export const GridUpdateSchema = GridCreateSchema.partial()
export type GridCreateInput = z.infer<typeof GridCreateSchema>
export type GridUpdateInput = z.infer<typeof GridUpdateSchema>
