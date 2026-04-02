import { generateDateString, generateUUID } from '../utils'

/**
 * Option — a selectable choice within a group, with optional price modifier.
 *
 * Options represent configurable choices on products, services, or
 * any entity that needs user selection. Each option can modify price
 * via a fixed amount, a percentage, or both.
 *
 * Origin: GameroomKit GKOption (2017).
 */
export class Option {
  static collection: string = 'options'
  /** Fixed price modifier */
  amount: number
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  metadata: Record<string, string>
  name: string | null
  /** Reference to the parent option group */
  optionGroupId: string | null
  /** Percentage price modifier (0-1, e.g., 0.15 = 15%) */
  percent: number
  /** Display order within the group */
  position: number
  updatedAt: string
  constructor(data?: Partial<Option>) {
    this.amount = data?.amount ?? 0
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.name = data?.name || null
    this.optionGroupId = data?.optionGroupId || null
    this.percent = data?.percent ?? 0
    this.position = data?.position ?? 0
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}

/**
 * OptionGroup — a named set of selectable options.
 *
 * Groups options together (e.g., "Size", "Color", "Add-ons").
 * When multitudinal is true, multiple options can be selected simultaneously.
 *
 * Origin: GameroomKit GKOptionGroup (2017).
 */
export class OptionGroup {
  static collection: string = 'option_groups'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  metadata: Record<string, string>
  /** Whether multiple options can be selected */
  multitudinal: boolean
  name: string | null
  tags: string[]
  updatedAt: string
  constructor(data?: Partial<OptionGroup>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.multitudinal = data?.multitudinal ?? false
    this.name = data?.name || null
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
