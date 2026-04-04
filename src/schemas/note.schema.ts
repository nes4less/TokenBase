import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema } from './shared'

export const NoteCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  info: z.string().nullable().optional(),
  noteableId: z.string().nullable().optional(),
  noteableType: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
})

export const NoteUpdateSchema = NoteCreateSchema.partial()
export type NoteCreateInput = z.infer<typeof NoteCreateSchema>
export type NoteUpdateInput = z.infer<typeof NoteUpdateSchema>
