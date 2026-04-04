import { z } from 'zod'
import { MetadatableSchema } from './shared'
import { KeyAlgorithmSchema } from './key-vault.schema'

export const HandshakeStatusSchema = z.enum([
  'pending', 'approved', 'rejected', 'countered', 'expired', 'cancelled',
])

export const HandshakeCreateSchema = MetadatableSchema.extend({
  id: z.string().uuid().optional(),
  action: z.string().min(1),
  entityId: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
  initiatorId: z.string().nullable().optional(),
  parties: z.array(z.string()).min(1),
  agreedBy: z.array(z.string()).optional(),
  rejectedBy: z.array(z.string()).optional(),
  status: HandshakeStatusSchema.optional(),
  unanimous: z.boolean().optional(),
  message: z.string().nullable().optional(),
  changes: z.record(z.string(), z.object({
    from: z.string().nullable(),
    to: z.string().nullable(),
  })).optional(),
  createdAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),

  // Key agreement fields (Phase 2b)
  initiatorPublicKey: z.string().nullable().optional(),
  partyPublicKeys: z.record(z.string(), z.string()).optional(),
  keyFingerprint: z.string().nullable().optional(),
  keyAlgorithm: KeyAlgorithmSchema.optional(),
  keyRotatedAt: z.string().datetime().nullable().optional(),
})

export const HandshakeUpdateSchema = HandshakeCreateSchema.partial()
export type HandshakeCreateInput = z.infer<typeof HandshakeCreateSchema>
export type HandshakeUpdateInput = z.infer<typeof HandshakeUpdateSchema>
