import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema } from './shared'

export const ReaderDeviceTypeSchema = z.enum([
  'verifone_P400', 'bbpos_wisepos_e', 'simulated_wisepos_e',
])

export const ReaderCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  businessId: z.string().nullable().optional(),
  deviceType: ReaderDeviceTypeSchema.nullable().optional(),
  stripeReaderId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
})

export const ReaderUpdateSchema = ReaderCreateSchema.partial()
export type ReaderCreateInput = z.infer<typeof ReaderCreateSchema>
export type ReaderUpdateInput = z.infer<typeof ReaderUpdateSchema>
