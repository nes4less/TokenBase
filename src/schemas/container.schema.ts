import { z } from 'zod'
import { EntityFieldsSchema, ImageEmbeddedSchema, MetadatableSchema } from './shared'

export const ContainerStatusValueSchema = z.enum([
  'active', 'inactive', 'pending', 'vacancy', 'noVacancy',
])

export const ContainerStatusSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  value: ContainerStatusValueSchema.optional(),
})

export const ContainerCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  description: z.string().nullable().optional(),
  images: z.array(ImageEmbeddedSchema).optional(),
  sku: z.string().nullable().optional(),
  statuses: z.array(ContainerStatusSchema).optional(),
  subtitle: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
})

export const ContainerUpdateSchema = ContainerCreateSchema.partial()
export type ContainerCreateInput = z.infer<typeof ContainerCreateSchema>
export type ContainerUpdateInput = z.infer<typeof ContainerUpdateSchema>
