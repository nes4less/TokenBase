import { generateUUID } from '../utils'

/**
 * Sort — ordering rule.
 *
 * Field, direction, priority when chained. Used by Query, View, Queue, Style.
 */

export type SortDirection = 'asc' | 'desc'

export class Sort {
  id: string
  field: string
  direction: SortDirection
  /** Priority when multiple sorts — lower runs first */
  priority: number
  constructor(data?: Partial<Sort>) {
    this.id = data?.id || generateUUID()
    this.field = data?.field || ''
    this.direction = data?.direction || 'asc'
    this.priority = data?.priority ?? 0
  }
}
