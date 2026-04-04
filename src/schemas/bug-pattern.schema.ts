import { z } from 'zod'
import { EntityFieldsSchema, TagEmbeddedSchema } from './shared'

export const BugSeveritySchema = z.enum(['low', 'medium', 'high', 'critical'])

export const DesignScopeSchema = z.enum([
  'element', 'component', 'system', 'cross-project',
])

export const DesignDomainSchema = z.enum([
  'api', 'auth', 'data-model', 'infra', 'navigation', 'state',
  'ui', 'tooling', 'testing', 'performance', 'security', 'other',
])

export const BugPatternCreateSchema = EntityFieldsSchema.extend({
  cause: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  domain: DesignDomainSchema.nullable().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  occurrences: z.number().int().positive().optional(),
  prevention: z.string().nullable().optional(),
  project: z.string().nullable().optional(),
  ruleId: z.string().nullable().optional(),
  scope: DesignScopeSchema.optional(),
  severity: BugSeveritySchema.optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  title: z.string().min(1),
})

export const BugPatternUpdateSchema = BugPatternCreateSchema.partial()
export type BugPatternCreateInput = z.infer<typeof BugPatternCreateSchema>
export type BugPatternUpdateInput = z.infer<typeof BugPatternUpdateSchema>
