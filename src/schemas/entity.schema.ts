import { z } from 'zod'
import { EntityFieldsSchema } from './shared'

export const EntityCreateSchema = EntityFieldsSchema
export const EntityUpdateSchema = EntityCreateSchema.partial()
export type EntityCreateInput = z.infer<typeof EntityCreateSchema>
export type EntityUpdateInput = z.infer<typeof EntityUpdateSchema>
