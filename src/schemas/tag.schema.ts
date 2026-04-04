import { z } from 'zod'
import { TagEmbeddedSchema } from './shared'

export const TagCreateSchema = TagEmbeddedSchema
export const TagUpdateSchema = TagCreateSchema.partial()
export type TagCreateInput = z.infer<typeof TagCreateSchema>
export type TagUpdateInput = z.infer<typeof TagUpdateSchema>
