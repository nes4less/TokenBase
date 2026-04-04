import { z } from 'zod'

export const FilterOperatorSchema = z.enum([
  'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
  'contains', 'startsWith', 'endsWith',
  'in', 'notIn', 'between', 'isNull', 'isNotNull',
  'exists', 'regex',
])

export const FilterCreateSchema = z.object({
  id: z.string().uuid().optional(),
  field: z.string().min(1),
  operator: FilterOperatorSchema.optional(),
  value: z.string().nullable().optional(),
  valueTo: z.string().nullable().optional(),
})

export const FilterUpdateSchema = FilterCreateSchema.partial()
export type FilterCreateInput = z.infer<typeof FilterCreateSchema>
export type FilterUpdateInput = z.infer<typeof FilterUpdateSchema>
