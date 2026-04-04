import { z } from 'zod'
import { MetadatableSchema } from './shared'

export const LogLevelSchema = z.enum([
  'field', 'entity', 'access', 'derivation', 'system', 'status',
])

export const LogEntryCreateSchema = MetadatableSchema.extend({
  id: z.string().uuid().optional(),
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  level: LogLevelSchema.optional(),
  actorId: z.string().nullable().optional(),
  actorType: z.string().nullable().optional(),
  field: z.string().nullable().optional(),
  fromValue: z.string().nullable().optional(),
  toValue: z.string().nullable().optional(),
  action: z.string().optional(),
  reason: z.string().nullable().optional(),
  timestamp: z.string().datetime().optional(),
})

export const LogEntryUpdateSchema = LogEntryCreateSchema.partial()
export type LogEntryCreateInput = z.infer<typeof LogEntryCreateSchema>
export type LogEntryUpdateInput = z.infer<typeof LogEntryUpdateSchema>
