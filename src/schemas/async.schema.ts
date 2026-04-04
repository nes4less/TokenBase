import { z } from 'zod'
import { MetadatableSchema } from './shared'

export const AsyncStatusSchema = z.enum([
  'pending', 'active', 'resolved', 'rejected', 'cancelled', 'timeout',
])

export const AsyncCreateSchema = MetadatableSchema.extend({
  id: z.string().uuid().optional(),
  status: AsyncStatusSchema.optional(),
  entityId: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  timeout: z.number().int().nonnegative().optional(),
  callbackId: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
})

export const AsyncUpdateSchema = AsyncCreateSchema.partial()
export type AsyncCreateInput = z.infer<typeof AsyncCreateSchema>
export type AsyncUpdateInput = z.infer<typeof AsyncUpdateSchema>
