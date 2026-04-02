import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * InstructionStep — a single step in a sequence.
 */
export class InstructionStep {
  id: string
  /** Step description — what to do */
  action: string
  /** Position in sequence */
  position: number
  /** Condition to execute this step (null = always) */
  condition: string | null
  /** Whether this step is optional */
  optional: boolean
  /** Expected duration in milliseconds */
  duration: number | null
  metadata: MetadataEntry[]
  constructor(data?: Partial<InstructionStep>) {
    this.id = data?.id || generateUUID()
    this.action = data?.action || ''
    this.position = data?.position ?? 0
    this.condition = data?.condition || null
    this.optional = data?.optional ?? false
    this.duration = data?.duration ?? null
    this.metadata = data?.metadata || []
  }
}

/**
 * Instruction — a directive to be followed. Sequential steps with conditions.
 *
 * Recipes, assembly guides, onboarding flows, agent system prompts,
 * deployment procedures, medical procedures, checklists.
 * "What to do" in order.
 */
export class Instruction {
  static collection: string = 'instructions'
  id: string
  name: string | null
  description: string | null
  steps: InstructionStep[]
  /** Who/what this instruction is for */
  targetType: string | null
  /** Whether steps must be followed in order */
  sequential: boolean
  /** Whether all steps must complete */
  exhaustive: boolean
  contextId: string | null
  scopeId: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: MetadataEntry[]
  constructor(data?: Partial<Instruction>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.description = data?.description || null
    this.steps = data?.steps || []
    this.targetType = data?.targetType || null
    this.sequential = data?.sequential ?? true
    this.exhaustive = data?.exhaustive ?? true
    this.contextId = data?.contextId || null
    this.scopeId = data?.scopeId || null
    this.tags = data?.tags || []
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.deletedAt = data?.deletedAt || null
    this.metadata = data?.metadata || []
  }
}
