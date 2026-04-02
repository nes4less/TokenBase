import { generateDateString, generateUUID } from '../utils'

/**
 * Prompt — structured request for a decision.
 *
 * Options presented for selection. Can target humans (UI picker),
 * agents (choice response), or systems (rule-based auto-select).
 * The inverse of Function — "I need input before I can proceed."
 */

export type PromptMethod = 'select' | 'multiselect' | 'input' | 'confirm'

export class PromptOption {
  id: string
  label: string
  value: string
  description: string | null
  position: number
  constructor(data?: Partial<PromptOption>) {
    this.id = data?.id || generateUUID()
    this.label = data?.label || ''
    this.value = data?.value || ''
    this.description = data?.description || null
    this.position = data?.position ?? 0
  }
}

export class Prompt {
  static collection: string = 'prompts'
  id: string
  title: string | null
  message: string | null
  method: PromptMethod
  options: PromptOption[]
  /** The selected response (set when answered) */
  response: string | null
  /** Who/what this prompt targets */
  targetId: string | null
  targetType: string | null
  /** Who/what asked the question */
  askerId: string | null
  answered: boolean
  createdAt: string
  answeredAt: string | null
  metadata: Record<string, string>
  constructor(data?: Partial<Prompt>) {
    this.id = data?.id || generateUUID()
    this.title = data?.title || null
    this.message = data?.message || null
    this.method = data?.method || 'select'
    this.options = data?.options || []
    this.response = data?.response || null
    this.targetId = data?.targetId || null
    this.targetType = data?.targetType || null
    this.askerId = data?.askerId || null
    this.answered = data?.answered ?? false
    this.createdAt = data?.createdAt || generateDateString()
    this.answeredAt = data?.answeredAt || null
    this.metadata = data?.metadata || {}
  }
}
