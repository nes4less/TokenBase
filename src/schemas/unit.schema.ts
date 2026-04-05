import { z } from 'zod'
import {
  EntityFieldsSchema, IdentifierEmbeddedSchema, ImageEmbeddedSchema,
  MetadatableSchema, TagEmbeddedSchema, DimensionsEmbeddedSchema,
  ValidatableSchema, InterchangeableSchema,
} from './shared'

export const UnitStatusValueSchema = z.enum([
  'active', 'inactive', 'pending', 'audited', 'sold', 'returned', 'damaged',
])

export const UnitStatusSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  value: UnitStatusValueSchema.optional(),
})

export const UnitCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).merge(ValidatableSchema).merge(InterchangeableSchema).extend({
  amount: z.number().optional(),
  identifiers: z.array(IdentifierEmbeddedSchema).optional(),
  catalogId: z.string().nullable().optional(),
  containerId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  dimensions: DimensionsEmbeddedSchema.nullable().optional(),
  images: z.array(ImageEmbeddedSchema).optional(),
  productId: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  statuses: z.array(UnitStatusSchema).optional(),
  subtitle: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  taxable: z.boolean().optional(),
  title: z.string().nullable().optional(),
})

export const UnitUpdateSchema = UnitCreateSchema.partial()
export type UnitCreateInput = z.infer<typeof UnitCreateSchema>
export type UnitUpdateInput = z.infer<typeof UnitUpdateSchema>
