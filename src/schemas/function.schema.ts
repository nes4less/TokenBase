import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const FunctionParamSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().nullable().optional(),
  type: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const FunctionCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  inputs: z.array(FunctionParamSchema).optional(),
  name: z.string().nullable().optional(),
  operation: z.string().optional(),
  outputs: z.array(FunctionParamSchema).optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  transform: z.string().nullable().optional(),
})

export const FunctionUpdateSchema = FunctionCreateSchema.partial()
export type FunctionCreateInput = z.infer<typeof FunctionCreateSchema>
export type FunctionUpdateInput = z.infer<typeof FunctionUpdateSchema>
