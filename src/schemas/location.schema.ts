/**
 * Location — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, PolymorphicSchema, NameableSchema, DescribableSchema } from './shared'

export const LocationCreateSchema = EntityFieldsSchema
  .merge(PolymorphicSchema)
  .merge(NameableSchema)
  .merge(DescribableSchema)
  .extend({
    address: z.string().nullable().optional(),
    altitude: z.number().nullable().optional(),
    floor: z.number().int().nullable().optional(),
    indoor: z.boolean().optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    metadata: z.array(MetadataEntrySchema).optional(),
    path: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    x: z.number().nullable().optional(),
    y: z.number().nullable().optional(),
    z: z.number().nullable().optional(),
    zone: z.string().nullable().optional(),
  })

export const LocationUpdateSchema = LocationCreateSchema.partial()
export type LocationCreateInput = z.infer<typeof LocationCreateSchema>
export type LocationUpdateInput = z.infer<typeof LocationUpdateSchema>
