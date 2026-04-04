import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const ScopeCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  access: z.string().nullable().optional(),
  children: z.array(z.string()).optional(),
  country: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  regionCode: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  timezone: z.string().nullable().optional(),
})

export const ScopeUpdateSchema = ScopeCreateSchema.partial()
export type ScopeCreateInput = z.infer<typeof ScopeCreateSchema>
export type ScopeUpdateInput = z.infer<typeof ScopeUpdateSchema>
