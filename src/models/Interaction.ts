import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Gesture types — how the user physically triggers an interaction.
 */
export type GestureType =
  | 'tap'
  | 'longPress'
  | 'doubleTap'
  | 'swipeLeft'
  | 'swipeRight'
  | 'swipeUp'
  | 'swipeDown'
  | 'pinch'
  | 'drag'
  | 'pull'
  | 'hover'
  | 'focus'
  | 'blur'

/**
 * Interaction — a user input gesture mapped to an operation.
 *
 * The input primitive. Defines HOW something is triggered.
 * Function defines WHAT happens. Interaction connects the two.
 */
export class Interaction {
  static collection: string = 'interactions'
  id: string
  name: string | null
  /** The physical gesture */
  gesture: GestureType
  /** What entity type this interaction applies to */
  entityType: string | null
  /** What View this interaction is scoped to (null = global) */
  viewId: string | null
  /** Function ID to execute when triggered */
  functionId: string | null
  /** Prompt ID to show when triggered (alternative to function) */
  promptId: string | null
  /** Whether to show confirmation before executing */
  requiresConfirmation: boolean
  /** Feedback type: haptic, sound, visual, none */
  feedback: 'haptic' | 'sound' | 'visual' | 'none'
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<Interaction>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.gesture = data?.gesture || 'tap'
    this.entityType = data?.entityType || null
    this.viewId = data?.viewId || null
    this.functionId = data?.functionId || null
    this.promptId = data?.promptId || null
    this.requiresConfirmation = data?.requiresConfirmation ?? false
    this.feedback = data?.feedback || 'none'
    this.tags = data?.tags || []
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.deletedAt = data?.deletedAt || null
    this.metadata = data?.metadata || []
  }
}
