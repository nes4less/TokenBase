import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema, TagEmbeddedSchema } from './shared'

export const InstructionStepSchema = z.object({
  id: z.string().uuid().optional(),
  action: z.string().min(1),
  position: z.number().int().nonnegative().optional(),
  condition: z.string().nullable().optional(),
  optional: z.boolean().optional(),
  duration: z.number().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const InstructionCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  steps: z.array(InstructionStepSchema).optional(),
  targetType: z.string().nullable().optional(),
  sequential: z.boolean().optional(),
  exhaustive: z.boolean().optional(),
  contextId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const InstructionUpdateSchema = InstructionCreateSchema.partial()
export type InstructionCreateInput = z.infer<typeof InstructionCreateSchema>
export type InstructionUpdateInput = z.infer<typeof InstructionUpdateSchema>
