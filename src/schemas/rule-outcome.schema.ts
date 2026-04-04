import { z } from 'zod'

export const OutcomeTypeSchema = z.enum([
  'followed', 'violated', 'prevented', 'recurred', 'overridden', 'retired',
])

export const RuleOutcomeCreateSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  description: z.string().nullable().optional(),
  evidenceId: z.string().nullable().optional(),
  evidenceType: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  observedBy: z.string().nullable().optional(),
  outcomeType: OutcomeTypeSchema.optional(),
  ruleId: z.string().min(1),
  ruleType: z.string().optional(),
})

export const RuleOutcomeUpdateSchema = RuleOutcomeCreateSchema.partial()
export type RuleOutcomeCreateInput = z.infer<typeof RuleOutcomeCreateSchema>
export type RuleOutcomeUpdateInput = z.infer<typeof RuleOutcomeUpdateSchema>
