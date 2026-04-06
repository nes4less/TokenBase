/**
 * Comment — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema } from './shared'

export const CommentCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).extend({
  body: z.string().nullable().optional(),
  closed: z.boolean().optional(),
  closedAt: z.string().datetime().nullable().optional(),
  language: z.string().max(10).nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  parentId: z.string().nullable().optional(),
  personId: z.string().nullable().optional(),
  subEntityId: z.string().nullable().optional(),
  subEntityType: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  translations: z.record(z.string(), z.string()).optional(),
})

export const CommentUpdateSchema = CommentCreateSchema.partial()
export type CommentCreateInput = z.infer<typeof CommentCreateSchema>
export type CommentUpdateInput = z.infer<typeof CommentUpdateSchema>
