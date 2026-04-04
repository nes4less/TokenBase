import { z } from 'zod'
import { MetadatableSchema } from './shared'

export const ViewStateValueSchema = z.enum(['idle', 'loading', 'error', 'empty', 'active'])

export const ViewStateCreateSchema = MetadatableSchema.extend({
  id: z.string().uuid().optional(),
  viewId: z.string().min(1),
  ownerId: z.string().nullable().optional(),
  state: ViewStateValueSchema.optional(),
  selectedId: z.string().nullable().optional(),
  expandedIds: z.array(z.string()).optional(),
  scrollPosition: z.number().nonnegative().optional(),
  activeFilterIds: z.array(z.string()).optional(),
  error: z.string().nullable().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const ViewStateUpdateSchema = ViewStateCreateSchema.partial()
export type ViewStateCreateInput = z.infer<typeof ViewStateCreateSchema>
export type ViewStateUpdateInput = z.infer<typeof ViewStateUpdateSchema>
