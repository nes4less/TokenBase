/**
 * Query — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, NameableSchema } from './shared'

export const QueryCreateSchema = EntityFieldsSchema.merge(NameableSchema).extend({
  filters: z.array(z.record(z.string(), z.unknown())).optional(),
  hidden: z.boolean().optional(),
  layout: z.string().nullable().optional(),
  limit: z.number().int().positive().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  positions: z.record(z.string(), z.unknown()).optional(),
  public: z.boolean().optional(),
  scope: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  sort: z.record(z.string(), z.unknown()).optional(),
  styleId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export const QueryUpdateSchema = QueryCreateSchema.partial()
export type QueryCreateInput = z.infer<typeof QueryCreateSchema>
export type QueryUpdateInput = z.infer<typeof QueryUpdateSchema>
