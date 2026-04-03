import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * View — a saved perspective on data.
 *
 * Combines Filter + Sort + Style + entity type into a reusable
 * definition of "how to look at this data." A tab is a View.
 * A dashboard widget is a View. A report is a View.
 */
export class View {
  static collection: string = 'views'
  id: string
  name: string | null
  description: string | null
  /** What entity type this view shows */
  entityType: string | null
  /** Filter IDs applied to this view */
  filterIds: string[]
  /** Sort IDs applied to this view */
  sortIds: string[]
  /** Style ID for rendering */
  styleId: string | null
  /** Maximum items to display */
  limit: number | null
  /** Icon name for tab/nav display */
  icon: string | null
  contextId: string | null
  scopeId: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<View>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.description = data?.description || null
    this.entityType = data?.entityType || null
    this.filterIds = data?.filterIds || []
    this.sortIds = data?.sortIds || []
    this.styleId = data?.styleId || null
    this.limit = data?.limit ?? null
    this.icon = data?.icon || null
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
