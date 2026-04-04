import { z } from 'zod'
import { IdentifierEmbeddedSchema } from './shared'

export const IdentifierCreateSchema = IdentifierEmbeddedSchema
export const IdentifierUpdateSchema = IdentifierCreateSchema.partial()
export type IdentifierCreateInput = z.infer<typeof IdentifierCreateSchema>
export type IdentifierUpdateInput = z.infer<typeof IdentifierUpdateSchema>
