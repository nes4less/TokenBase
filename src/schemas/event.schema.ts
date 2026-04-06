/**
 * Event — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema } from './shared'

export const EventCreateSchema = EntityFieldsSchema.merge(PolymorphicSchema).extend({
  actorId: z.string().nullable().optional(),
  layer: z.string().nullable().optional(),
  manualEntry: z.boolean().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  source: z.string().nullable().optional(),
  timestamp: z.string().datetime().nullable().optional(),
  translations: z.record(z.string(), z.string()).optional(),
  type: z.string().nullable().optional(),
})

export const EventUpdateSchema = EventCreateSchema.partial()
export type EventCreateInput = z.infer<typeof EventCreateSchema>
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>
