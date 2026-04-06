/**
 * Publication — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, NameableSchema, DescribableSchema } from './shared'

export const PublicationCreateSchema = EntityFieldsSchema
  .merge(NameableSchema)
  .merge(DescribableSchema)
  .extend({
    bundle: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    metadata: z.array(MetadataEntrySchema).optional(),
    orgId: z.string().nullable().optional(),
    tags: z.array(z.string()).optional(),
    type: z.string().nullable().optional(),
    version: z.string().nullable().optional(),
    visibility: z.enum(['public', 'private', 'unlisted', 'restricted']).nullable().optional(),
  })

export const PublicationUpdateSchema = PublicationCreateSchema.partial()
export type PublicationCreateInput = z.infer<typeof PublicationCreateSchema>
export type PublicationUpdateInput = z.infer<typeof PublicationUpdateSchema>
