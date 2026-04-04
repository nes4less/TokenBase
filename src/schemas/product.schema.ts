import { z } from 'zod'
import {
  EntityFieldsSchema, IdentifierEmbeddedSchema, ImageEmbeddedSchema,
  MetadatableSchema, TagEmbeddedSchema, DimensionsEmbeddedSchema,
} from './shared'

export const ProductCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  identifiers: z.array(IdentifierEmbeddedSchema).optional(),
  catalogId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  dimensions: DimensionsEmbeddedSchema.nullable().optional(),
  images: z.array(ImageEmbeddedSchema).optional(),
  sku: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
  taxable: z.boolean().optional(),
  title: z.string().nullable().optional(),
})

export const ProductUpdateSchema = ProductCreateSchema.partial()
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>
