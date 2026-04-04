import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema } from './shared'

export const QueueOrderSchema = z.enum(['fifo', 'lifo', 'priority'])

export const QueueItemSchema = z.object({
  id: z.string().uuid().optional(),
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  priority: z.number().int().optional(),
  enqueuedAt: z.string().datetime().optional(),
  dequeuedAt: z.string().datetime().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const QueueCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  order: QueueOrderSchema.optional(),
  maxSize: z.number().int().positive().nullable().optional(),
  items: z.array(QueueItemSchema).optional(),
  processingId: z.string().nullable().optional(),
})

export const QueueUpdateSchema = QueueCreateSchema.partial()
export type QueueCreateInput = z.infer<typeof QueueCreateSchema>
export type QueueUpdateInput = z.infer<typeof QueueUpdateSchema>
