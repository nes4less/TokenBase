import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema, TagEmbeddedSchema } from './shared'

export const ProtocolRuleSchema = z.object({
  id: z.string().uuid().optional(),
  subject: z.string().min(1),
  rule: z.string().min(1),
  enforcement: z.string().nullable().optional(),
  priority: z.number().int().nonnegative().optional(),
  mandatory: z.boolean().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const ProtocolCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  rules: z.array(ProtocolRuleSchema).optional(),
  appliesTo: z.string().nullable().optional(),
  strict: z.boolean().optional(),
  version: z.string().nullable().optional(),
  contextId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const ProtocolUpdateSchema = ProtocolCreateSchema.partial()
export type ProtocolCreateInput = z.infer<typeof ProtocolCreateSchema>
export type ProtocolUpdateInput = z.infer<typeof ProtocolUpdateSchema>
