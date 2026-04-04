import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const SetCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  complete: z.boolean().optional(),
  maxSize: z.number().int().positive().nullable().optional(),
  closed: z.boolean().optional(),
  members: z.array(z.string()).optional(),
  memberType: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const SetUpdateSchema = SetCreateSchema.partial()
export type SetCreateInput = z.infer<typeof SetCreateSchema>
export type SetUpdateInput = z.infer<typeof SetUpdateSchema>
