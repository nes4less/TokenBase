import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema, TagEmbeddedSchema } from './shared'

export const GateConditionSchema = z.enum([
  'pass', 'loop', 'conditional',
])

export const AgentRoleSchema = z.enum([
  'collector', 'categorizer', 'summarizer', 'analyzer', 'rulemaker',
  'planner', 'writer', 'reviewer', 'deployer', 'custom',
])

export const FlowAgentSchema = z.object({
  id: z.string().uuid().optional(),
  agentId: z.string().nullable().optional(),
  role: AgentRoleSchema.optional(),
  name: z.string().nullable().optional(),
  gate: GateConditionSchema.optional(),
  gateCondition: z.string().nullable().optional(),
  passTo: z.array(z.string()).optional(),
  loopTo: z.string().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const AgentFlowCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  agents: z.array(FlowAgentSchema).optional(),
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  refreshInterval: z.number().int().nonnegative().optional(),
  timeTermId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const AgentFlowUpdateSchema = AgentFlowCreateSchema.partial()
export type AgentFlowCreateInput = z.infer<typeof AgentFlowCreateSchema>
export type AgentFlowUpdateInput = z.infer<typeof AgentFlowUpdateSchema>
