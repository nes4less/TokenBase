import { z } from 'zod'

export const SortDirectionSchema = z.enum(['asc', 'desc'])

export const SortCreateSchema = z.object({
  id: z.string().uuid().optional(),
  field: z.string().min(1),
  direction: SortDirectionSchema.optional(),
  priority: z.number().int().nonnegative().optional(),
})

export const SortUpdateSchema = SortCreateSchema.partial()
export type SortCreateInput = z.infer<typeof SortCreateSchema>
export type SortUpdateInput = z.infer<typeof SortUpdateSchema>
