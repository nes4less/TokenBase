import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema } from './shared'

export const TimeDirectionSchema = z.enum(['forward', 'backward'])
export const TimeModeSchema = z.enum(['relative', 'absolute'])
export const TimeUnitSchema = z.enum([
  'milliseconds', 'seconds', 'minutes', 'hours',
  'days', 'weeks', 'months', 'quarters', 'years',
])
export const TimeTermTypeSchema = z.enum([
  // Durations
  'duration', 'timeout', 'cooldown', 'warmup', 'buffer', 'window', 'ttl',
  // Cadence
  'interval', 'cadence', 'frequency', 'recurrence', 'cycle',
  // Scheduling
  'deadline', 'milestone', 'eta', 'schedule', 'appointment', 'embargo',
  // Delays
  'delay', 'debounce', 'throttle', 'backoff', 'lag', 'lead-time',
  // Lifecycle
  'created', 'started', 'completed', 'expired', 'archived',
  // Relative references
  'since', 'until', 'ago', 'from-now',
  // Work units
  'sprint', 'epoch', 'shift', 'session',
])

export const TimeTermCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  direction: TimeDirectionSchema.optional(),
  logicFunction: z.string().nullable().optional(),
  mode: TimeModeSchema.optional(),
  name: z.string().nullable().optional(),
  references: z.array(z.string()).optional(),
  term: TimeTermTypeSchema.optional(),
  unit: TimeUnitSchema.optional(),
  value: z.number().optional(),
})

export const TimeTermUpdateSchema = TimeTermCreateSchema.partial()
export type TimeTermCreateInput = z.infer<typeof TimeTermCreateSchema>
export type TimeTermUpdateInput = z.infer<typeof TimeTermUpdateSchema>
