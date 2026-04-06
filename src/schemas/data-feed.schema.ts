/**
 * DataFeed — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema, NameableSchema, DescribableSchema } from './shared'

export const DataFeedCreateSchema = EntityFieldsSchema.merge(NameableSchema).merge(DescribableSchema).extend({
  collection: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  priority: z.number().int().nonnegative().optional(),
  queryId: z.string().nullable().optional(),
  refreshInterval: z.number().int().positive().nullable().optional(),
  refreshMode: z.enum(['poll', 'push', 'manual', 'event']).nullable().optional(),
  scopeId: z.string().nullable().optional(),
  staleAfter: z.number().int().positive().nullable().optional(),
  tags: z.array(z.string()).optional(),
  triggerOn: z.string().nullable().optional(),
})

export const DataFeedUpdateSchema = DataFeedCreateSchema.partial()
export type DataFeedCreateInput = z.infer<typeof DataFeedCreateSchema>
export type DataFeedUpdateInput = z.infer<typeof DataFeedUpdateSchema>
