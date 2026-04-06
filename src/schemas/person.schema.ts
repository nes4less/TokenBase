/**
 * Person — Zod validation schemas.
 */
import { z } from 'zod'
import { EntityFieldsSchema, MetadataEntrySchema } from './shared'

export const PersonCreateSchema = EntityFieldsSchema.extend({
  avatarImage: z.string().nullable().optional(),
  blurhash: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  displayName: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  enabledRoles: z.array(z.string()).optional(),
  firstName: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  images: z.array(z.string()).optional(),
  language: z.string().max(10).nullable().optional(),
  lastActiveContext: z.string().nullable().optional(),
  lastActiveRole: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  manualEntry: z.boolean().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  middleName: z.string().nullable().optional(),
  notificationPrefs: z.record(z.string(), z.unknown()).optional(),
  phone: z.string().nullable().optional(),
  profileVisibility: z.enum(['public', 'private', 'contacts']).nullable().optional(),
  publicProfile: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  themeColor: z.string().nullable().optional(),
  themeMode: z.string().nullable().optional(),
  translateMode: z.string().nullable().optional(),
  useAvatarImage: z.boolean().optional(),
  useAvatarName: z.boolean().optional(),
  verified: z.boolean().optional(),
})

export const PersonUpdateSchema = PersonCreateSchema.partial()
export type PersonCreateInput = z.infer<typeof PersonCreateSchema>
export type PersonUpdateInput = z.infer<typeof PersonUpdateSchema>
