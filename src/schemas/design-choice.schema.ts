import { z } from 'zod'
import { EntityFieldsSchema, TagEmbeddedSchema } from './shared'
import { DesignScopeSchema, DesignDomainSchema } from './bug-pattern.schema'

export const DesignChoiceStatusSchema = z.enum([
  'active', 'superseded', 'deferred',
])

export const ChoiceVariantSchema = z.object({
  id: z.string().uuid().optional(),
  choiceId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  isCurrent: z.boolean().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
})

export const DesignChoiceCreateSchema = EntityFieldsSchema.extend({
  description: z.string().nullable().optional(),
  domain: DesignDomainSchema.nullable().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  preferredVariantId: z.string().nullable().optional(),
  project: z.string().nullable().optional(),
  scope: DesignScopeSchema.optional(),
  status: DesignChoiceStatusSchema.optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  title: z.string().min(1),
})

export const DesignChoiceUpdateSchema = DesignChoiceCreateSchema.partial()
export type DesignChoiceCreateInput = z.infer<typeof DesignChoiceCreateSchema>
export type DesignChoiceUpdateInput = z.infer<typeof DesignChoiceUpdateSchema>

export const ChoiceVariantCreateSchema = ChoiceVariantSchema
export const ChoiceVariantUpdateSchema = ChoiceVariantSchema.partial()
export type ChoiceVariantCreateInput = z.infer<typeof ChoiceVariantCreateSchema>
export type ChoiceVariantUpdateInput = z.infer<typeof ChoiceVariantUpdateSchema>
