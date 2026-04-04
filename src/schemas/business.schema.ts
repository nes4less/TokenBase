import { z } from 'zod'
import { EntityFieldsSchema, ImageEmbeddedSchema, MetadatableSchema } from './shared'

export const BusinessCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  address1: z.string().nullable().optional(),
  address2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  images: z.array(ImageEmbeddedSchema).optional(),
  info: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  stripeAccountId: z.string().nullable().optional(),
  taxAmount: z.number().nonnegative().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  title: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
})

export const BusinessUpdateSchema = BusinessCreateSchema.partial()
export type BusinessCreateInput = z.infer<typeof BusinessCreateSchema>
export type BusinessUpdateInput = z.infer<typeof BusinessUpdateSchema>
