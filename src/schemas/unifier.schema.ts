import { z } from 'zod'
import { EntityFieldsSchema, IdentifierEmbeddedSchema, ImageEmbeddedSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const UnifierCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  differences: z.record(z.string(), z.string()).optional(),
  groupIds: z.array(z.string()).optional(),
  identifiers: z.array(IdentifierEmbeddedSchema).optional(),
  images: z.array(ImageEmbeddedSchema).optional(),
  name: z.string().nullable().optional(),
  scopeIds: z.array(z.string()).optional(),
  similarities: z.record(z.string(), z.string()).optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const UnifierUpdateSchema = UnifierCreateSchema.partial()
export type UnifierCreateInput = z.infer<typeof UnifierCreateSchema>
export type UnifierUpdateInput = z.infer<typeof UnifierUpdateSchema>
