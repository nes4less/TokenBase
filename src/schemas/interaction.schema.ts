import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema, TagEmbeddedSchema } from './shared'

export const GestureTypeSchema = z.enum([
  'tap', 'longPress', 'doubleTap',
  'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
  'pinch', 'drag', 'pull', 'hover', 'focus', 'blur',
])

export const FeedbackTypeSchema = z.enum(['haptic', 'sound', 'visual', 'none'])

export const InteractionCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  name: z.string().nullable().optional(),
  gesture: GestureTypeSchema.optional(),
  entityType: z.string().nullable().optional(),
  viewId: z.string().nullable().optional(),
  functionId: z.string().nullable().optional(),
  promptId: z.string().nullable().optional(),
  requiresConfirmation: z.boolean().optional(),
  feedback: FeedbackTypeSchema.optional(),
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const InteractionUpdateSchema = InteractionCreateSchema.partial()
export type InteractionCreateInput = z.infer<typeof InteractionCreateSchema>
export type InteractionUpdateInput = z.infer<typeof InteractionUpdateSchema>
