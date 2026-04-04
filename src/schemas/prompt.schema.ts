import { z } from 'zod'
import { MetadatableSchema, MetadataEntrySchema } from './shared'

export const PromptMethodSchema = z.enum([
  'select', 'multiselect', 'input', 'confirm',
])

export const PromptOptionSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().min(1),
  value: z.string().min(1),
  description: z.string().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  amount: z.number().optional(),
  percent: z.number().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const PromptCreateSchema = MetadatableSchema.extend({
  id: z.string().uuid().optional(),
  title: z.string().nullable().optional(),
  message: z.string().nullable().optional(),
  method: PromptMethodSchema.optional(),
  options: z.array(PromptOptionSchema).optional(),
  response: z.string().nullable().optional(),
  targetId: z.string().nullable().optional(),
  targetType: z.string().nullable().optional(),
  askerId: z.string().nullable().optional(),
  answered: z.boolean().optional(),
  createdAt: z.string().datetime().optional(),
  answeredAt: z.string().datetime().nullable().optional(),
})

export const PromptUpdateSchema = PromptCreateSchema.partial()
export type PromptCreateInput = z.infer<typeof PromptCreateSchema>
export type PromptUpdateInput = z.infer<typeof PromptUpdateSchema>
