import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const ViewGroupLayoutSchema = z.enum(['tabs', 'sections', 'grid', 'stack'])

export const ViewGroupCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  viewIds: z.array(z.string()).optional(),
  defaultViewId: z.string().nullable().optional(),
  layout: ViewGroupLayoutSchema.optional(),
  contextId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const ViewGroupUpdateSchema = ViewGroupCreateSchema.partial()
export type ViewGroupCreateInput = z.infer<typeof ViewGroupCreateSchema>
export type ViewGroupUpdateInput = z.infer<typeof ViewGroupUpdateSchema>
