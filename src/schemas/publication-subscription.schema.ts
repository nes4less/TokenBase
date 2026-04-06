/**
 * PublicationSubscription — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema } from './shared'

export const PublicationSubscriptionCreateSchema = EntityFieldsSchema.extend({
  clonedAt: z.string().datetime().nullable().optional(),
  lastSyncedVersion: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  mode: z.enum(['live', 'snapshot', 'mirror']).nullable().optional(),
  publicationId: z.string().nullable().optional(),
  subscriberOrgId: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
})

export const PublicationSubscriptionUpdateSchema = PublicationSubscriptionCreateSchema.partial()
export type PublicationSubscriptionCreateInput = z.infer<typeof PublicationSubscriptionCreateSchema>
export type PublicationSubscriptionUpdateInput = z.infer<typeof PublicationSubscriptionUpdateSchema>
