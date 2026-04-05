import { z } from 'zod'
import { IdentifierEmbeddedSchema, ValidatableSchema } from './shared'

export const IdentifierCreateSchema = IdentifierEmbeddedSchema.merge(ValidatableSchema)
export const IdentifierUpdateSchema = IdentifierCreateSchema.partial()
export type IdentifierCreateInput = z.infer<typeof IdentifierCreateSchema>
export type IdentifierUpdateInput = z.infer<typeof IdentifierUpdateSchema>
