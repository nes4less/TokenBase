import { z } from 'zod'
import { EntityFieldsSchema, ImageEmbeddedSchema } from './shared'

export const ImageCreateSchema = ImageEmbeddedSchema
export const ImageUpdateSchema = ImageCreateSchema.partial()
export type ImageCreateInput = z.infer<typeof ImageCreateSchema>
export type ImageUpdateInput = z.infer<typeof ImageUpdateSchema>
