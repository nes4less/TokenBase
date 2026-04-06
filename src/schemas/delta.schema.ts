/**
 * Delta — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema } from './shared'

export const DeltaKindSchema = z.enum([
  'field', 'create', 'archive', 'block', 'unblock',
  'restore', 'merge', 'derive', 'branch', 'compound',
])

export const FieldChangeSchema = z.object({
  path: z.string().min(1),
  fromValue: z.string().nullable().optional(),
  toValue: z.string().nullable().optional(),
})

export const DeltaCreateSchema = z.object({
  id: z.string().uuid().optional(),
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  kind: DeltaKindSchema,
  actorId: z.string().nullable().optional(),
  actorType: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  changes: z.array(FieldChangeSchema).optional(),
  hash: z.string().nullable().optional(),
  previousHash: z.string().nullable().optional(),
  sequence: z.number().int().nonnegative().optional(),
  reason: z.string().nullable().optional(),
  mergeSourceIds: z.array(z.string()).optional(),
  branchPointId: z.string().nullable().optional(),
  synced: z.boolean().optional(),
  reversible: z.boolean().optional(),
  timestamp: z.string().datetime().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const DeltaUpdateSchema = DeltaCreateSchema.partial()
export type DeltaCreateInput = z.infer<typeof DeltaCreateSchema>
export type DeltaUpdateInput = z.infer<typeof DeltaUpdateSchema>
