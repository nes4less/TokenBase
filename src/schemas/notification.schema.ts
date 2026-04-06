/**
 * Notification — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema } from './shared'

export const NotificationCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).extend({
  channel: z.enum(['push', 'email', 'in-app', 'sms']).nullable().optional(),
  image: z.string().nullable().optional(),
  language: z.string().max(10).nullable().optional(),
  message: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  read: z.boolean().optional(),
  recipientId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
  translations: z.record(z.string(), z.string()).optional(),
  type: z.string().nullable().optional(),
})

export const NotificationUpdateSchema = NotificationCreateSchema.partial()
export type NotificationCreateInput = z.infer<typeof NotificationCreateSchema>
export type NotificationUpdateInput = z.infer<typeof NotificationUpdateSchema>
