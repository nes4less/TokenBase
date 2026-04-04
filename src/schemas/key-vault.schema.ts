import { z } from 'zod'

export const KeyAlgorithmSchema = z.enum(['aes-256-gcm', 'xchacha20-poly1305'])

export const KeyRotationSchema = z.object({
  rotatedAt: z.string().datetime(),
  reason: z.string().min(1),
  fingerprint: z.string().min(1),
})

export const KeyVaultCreateSchema = z.object({
  id: z.string().uuid().optional(),
  scopeId: z.string().min(1),
  encryptedMasterKey: z.string().min(1),
  keyFingerprint: z.string().min(1),
  algorithm: KeyAlgorithmSchema.optional(),
  rotations: z.array(KeyRotationSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const KeyVaultUpdateSchema = KeyVaultCreateSchema.partial()
export type KeyVaultCreateInput = z.infer<typeof KeyVaultCreateSchema>
export type KeyVaultUpdateInput = z.infer<typeof KeyVaultUpdateSchema>
