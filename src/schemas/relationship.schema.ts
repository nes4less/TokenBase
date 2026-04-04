import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const RelationshipTypeSchema = z.enum([
  'parent', 'child', 'sibling', 'dependency', 'composition',
  'association', 'reference', 'sequence', 'alternative',
  'extension', 'override', 'mirror',
])

export const RelationshipCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  sourceId: z.string().min(1),
  sourceType: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  targetId: z.string().min(1),
  targetType: z.string().nullable().optional(),
  type: RelationshipTypeSchema.optional(),
  weight: z.number().nullable().optional(),
})

export const RelationshipUpdateSchema = RelationshipCreateSchema.partial()
export type RelationshipCreateInput = z.infer<typeof RelationshipCreateSchema>
export type RelationshipUpdateInput = z.infer<typeof RelationshipUpdateSchema>
