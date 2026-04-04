import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const ImprovementStageSchema = z.enum([
  'raw', 'categorized', 'summarized', 'analyzed', 'rule',
])

export const DataCategorySchema = z.enum([
  'code', 'command', 'question', 'plan', 'error',
  'output', 'decision', 'observation', 'configuration',
  'conversation', 'metric',
])

export const ImprovementCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  category: DataCategorySchema.nullable().optional(),
  content: z.string().min(1),
  contextId: z.string().nullable().optional(),
  producerId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  sourceIds: z.array(z.string()).optional(),
  stage: ImprovementStageSchema.optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const ImprovementUpdateSchema = ImprovementCreateSchema.partial()
export type ImprovementCreateInput = z.infer<typeof ImprovementCreateSchema>
export type ImprovementUpdateInput = z.infer<typeof ImprovementUpdateSchema>
