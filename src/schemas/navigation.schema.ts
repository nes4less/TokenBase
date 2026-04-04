import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, MetadataEntrySchema, TagEmbeddedSchema } from './shared'

export const NavigationTypeSchema = z.enum(['stack', 'tab', 'modal', 'drawer', 'replace'])
export const NavigationTargetTypeSchema = z.enum(['view', 'viewGroup', 'screen'])
export const NavigationTransitionSchema = z.enum(['slide', 'fade', 'none'])

export const NavigationNodeSchema = z.object({
  id: z.string().uuid().optional(),
  targetId: z.string().min(1),
  targetType: NavigationTargetTypeSchema.optional(),
  label: z.string().nullable().optional(),
  icon: z.string().nullable().optional(),
  badgeFunctionId: z.string().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const NavigationCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  type: NavigationTypeSchema.optional(),
  nodes: z.array(NavigationNodeSchema).optional(),
  defaultNodeId: z.string().nullable().optional(),
  transition: NavigationTransitionSchema.nullable().optional(),
  contextId: z.string().nullable().optional(),
  scopeId: z.string().nullable().optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const NavigationUpdateSchema = NavigationCreateSchema.partial()
export type NavigationCreateInput = z.infer<typeof NavigationCreateSchema>
export type NavigationUpdateInput = z.infer<typeof NavigationUpdateSchema>
