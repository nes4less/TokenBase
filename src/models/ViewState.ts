import { generateDateString, generateUUID } from '../utils'

/**
 * ViewState — the runtime snapshot of a View's condition.
 *
 * Expanded/collapsed, selected item, scroll position, active filters,
 * loading/error/empty states. The live condition, not the definition.
 */
export class ViewState {
  static collection: string = 'view_states'
  id: string
  /** The View this state belongs to */
  viewId: string
  /** The user/session this state belongs to */
  ownerId: string | null
  /** Current display state */
  state: 'idle' | 'loading' | 'error' | 'empty' | 'active'
  /** Currently selected entity ID */
  selectedId: string | null
  /** Expanded section/item IDs */
  expandedIds: string[]
  /** Scroll position (0-1 percentage) */
  scrollPosition: number
  /** Runtime filter overrides (user changed a filter) */
  activeFilterIds: string[]
  /** Error message if state is 'error' */
  error: string | null
  updatedAt: string
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<ViewState>) {
    this.id = data?.id || generateUUID()
    this.viewId = data?.viewId || ''
    this.ownerId = data?.ownerId || null
    this.state = data?.state || 'idle'
    this.selectedId = data?.selectedId || null
    this.expandedIds = data?.expandedIds || []
    this.scrollPosition = data?.scrollPosition ?? 0
    this.activeFilterIds = data?.activeFilterIds || []
    this.error = data?.error || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.metadata = data?.metadata || []
  }
}
