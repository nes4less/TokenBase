/**
 * Content — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema, AttachableSchema } from './shared'

export const ContentCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).merge(AttachableSchema).extend({
  blurhash: z.string().nullable().optional(),
  category: z.array(z.string()).optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  image: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  language: z.string().max(10).nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  published: z.boolean().optional(),
  section: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  title: z.string().nullable().optional(),
  translations: z.record(z.string(), z.string()).optional(),
  type: z.string().nullable().optional(),
})

export const ContentUpdateSchema = ContentCreateSchema.partial()
export type ContentCreateInput = z.infer<typeof ContentCreateSchema>
export type ContentUpdateInput = z.infer<typeof ContentUpdateSchema>
