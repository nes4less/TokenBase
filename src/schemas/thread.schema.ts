import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const ThreadStateSchema = z.enum(['active', 'archived', 'closed'])

export const ThreadCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  title: z.string().nullable().optional(),
  participantIds: z.array(z.string()).optional(),
  rootMessageId: z.string().nullable().optional(),
  latestMessageId: z.string().nullable().optional(),
  messageCount: z.number().int().nonnegative().optional(),
  unreadCounts: z.record(z.string(), z.number().int().nonnegative()).optional(),
  state: ThreadStateSchema.optional(),
  participantTypes: z.array(z.string()).optional(),
  contextId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const ThreadUpdateSchema = ThreadCreateSchema.partial()
export type ThreadCreateInput = z.infer<typeof ThreadCreateSchema>
export type ThreadUpdateInput = z.infer<typeof ThreadUpdateSchema>
