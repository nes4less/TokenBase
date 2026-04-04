import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const StyleTargetSchema = z.enum([
  'plain', 'print', 'markup', 'markdown', 'linked',
  'csv', 'json', 'label', 'receipt', 'card', 'summary',
])

export const StyleFieldSchema = z.object({
  id: z.string().uuid().optional(),
  source: z.string().min(1),
  label: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  visible: z.boolean().optional(),
  link: z.string().nullable().optional(),
})

export const StyleCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  fields: z.array(StyleFieldSchema).optional(),
  name: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  target: StyleTargetSchema.optional(),
  template: z.string().nullable().optional(),
})

export const StyleUpdateSchema = StyleCreateSchema.partial()
export type StyleCreateInput = z.infer<typeof StyleCreateSchema>
export type StyleUpdateInput = z.infer<typeof StyleUpdateSchema>
