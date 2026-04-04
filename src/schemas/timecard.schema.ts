import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema } from './shared'

export const TimecardStatusSchema = z.enum([
  'started', 'ended', 'corrected', 'approved', 'declined',
])

export const TimecardCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  endedCorrection: z.string().datetime().nullable().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  info: z.string().nullable().optional(),
  startedCorrection: z.string().datetime().nullable().optional(),
  startedAt: z.string().datetime().optional(),
  status: TimecardStatusSchema.optional(),
  userId: z.string().nullable().optional(),
})

export const TimecardUpdateSchema = TimecardCreateSchema.partial()
export type TimecardCreateInput = z.infer<typeof TimecardCreateSchema>
export type TimecardUpdateInput = z.infer<typeof TimecardUpdateSchema>
