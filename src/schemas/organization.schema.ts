/**
 * Organization — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, NameableSchema } from './shared'

export const OrganizationCreateSchema = EntityFieldsSchema.merge(NameableSchema).extend({
  blurhash: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  customDomain: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  slug: z.string().nullable().optional(),
  subdomain: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export const OrganizationUpdateSchema = OrganizationCreateSchema.partial()
export type OrganizationCreateInput = z.infer<typeof OrganizationCreateSchema>
export type OrganizationUpdateInput = z.infer<typeof OrganizationUpdateSchema>
