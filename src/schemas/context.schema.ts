import { z } from 'zod'
import { EntityFieldsSchema, ImageEmbeddedSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const ContextCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  approval: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  filter: z.string().nullable().optional(),
  images: z.array(ImageEmbeddedSchema).optional(),
  implications: z.string().nullable().optional(),
  key: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  params: z.record(z.string(), z.string()).optional(),
  position: z.number().int().nonnegative().optional(),
  public: z.boolean().optional(),
  questions: z.array(z.string()).optional(),
  scope: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  sort: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const ContextUpdateSchema = ContextCreateSchema.partial()
export type ContextCreateInput = z.infer<typeof ContextCreateSchema>
export type ContextUpdateInput = z.infer<typeof ContextUpdateSchema>
