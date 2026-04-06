/**
 * Module — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, NameableSchema } from './shared'

export const ModuleCreateSchema = EntityFieldsSchema.merge(NameableSchema).extend({
  blurhash: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  preset: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  type: z.string().nullable().optional(),
})

export const ModuleUpdateSchema = ModuleCreateSchema.partial()
export type ModuleCreateInput = z.infer<typeof ModuleCreateSchema>
export type ModuleUpdateInput = z.infer<typeof ModuleUpdateSchema>
