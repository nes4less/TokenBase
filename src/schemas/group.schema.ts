import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const GroupCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  description: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const GroupUpdateSchema = GroupCreateSchema.partial()
export type GroupCreateInput = z.infer<typeof GroupCreateSchema>
export type GroupUpdateInput = z.infer<typeof GroupUpdateSchema>
