import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema, TagEmbeddedSchema } from './shared'

export const MapNodeSchema = z.object({
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  id: z.string().uuid().optional(),
  layer: z.number().int().nonnegative().optional(),
  label: z.string().nullable().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
  position: z.number().int().nonnegative().optional(),
})

export const MapCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  centerId: z.string().nullable().optional(),
  centerType: z.string().nullable().optional(),
  contextId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  name: z.string().nullable().optional(),
  nodes: z.array(MapNodeSchema).optional(),
  relationshipIds: z.array(z.string()).optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const MapUpdateSchema = MapCreateSchema.partial()
export type MapCreateInput = z.infer<typeof MapCreateSchema>
export type MapUpdateInput = z.infer<typeof MapUpdateSchema>
