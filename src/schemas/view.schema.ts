import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const ViewCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  filterIds: z.array(z.string()).optional(),
  sortIds: z.array(z.string()).optional(),
  styleId: z.string().nullable().optional(),
  limit: z.number().int().positive().nullable().optional(),
  icon: z.string().nullable().optional(),
  contextId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const ViewUpdateSchema = ViewCreateSchema.partial()
export type ViewCreateInput = z.infer<typeof ViewCreateSchema>
export type ViewUpdateInput = z.infer<typeof ViewUpdateSchema>
