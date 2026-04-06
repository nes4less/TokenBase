/**
 * Media — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema } from './shared'

export const MediaCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).extend({
  blurhash: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  tags: z.array(z.string()).optional(),
  thumbnailUrl: z.string().url().nullable().optional(),
  type: z.enum(['image', 'video', 'audio', 'document', '3d', 'ar']).nullable().optional(),
  uploadedBy: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  visible: z.boolean().optional(),
})

export const MediaUpdateSchema = MediaCreateSchema.partial()
export type MediaCreateInput = z.infer<typeof MediaCreateSchema>
export type MediaUpdateInput = z.infer<typeof MediaUpdateSchema>
