/**
 * Message — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema } from './shared'

export const SenderTypeSchema = z.enum(['person', 'agent', 'cli', 'system'])

export const MessageCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).extend({
  actionPayload: z.record(z.string(), z.unknown()).nullable().optional(),
  body: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  language: z.string().max(10).nullable().optional(),
  layer: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  parentId: z.string().nullable().optional(),
  readAt: z.string().datetime().nullable().optional(),
  recipientId: z.string().nullable().optional(),
  recipientType: SenderTypeSchema.nullable().optional(),
  senderId: z.string().nullable().optional(),
  senderType: SenderTypeSchema.nullable().optional(),
  tags: z.array(z.string()).optional(),
  taskId: z.string().nullable().optional(),
  threadId: z.string().nullable().optional(),
  translations: z.record(z.string(), z.string()).optional(),
})

export const MessageUpdateSchema = MessageCreateSchema.partial()
export type MessageCreateInput = z.infer<typeof MessageCreateSchema>
export type MessageUpdateInput = z.infer<typeof MessageUpdateSchema>
