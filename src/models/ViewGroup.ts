import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * ViewGroup — an ordered collection of Views.
 *
 * A tab bar is a ViewGroup. A settings page with sections is a ViewGroup.
 * A dashboard with multiple widgets is a ViewGroup.
 */
export class ViewGroup {
  static collection: string = 'view_groups'
  id: string
  name: string | null
  description: string | null
  /** Ordered View IDs in this group */
  viewIds: string[]
  /** Default active view ID */
  defaultViewId: string | null
  /** Layout hint: tabs, sections, grid, stack */
  layout: 'tabs' | 'sections' | 'grid' | 'stack'
  contextId: string | null
  scopeId: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<ViewGroup>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.description = data?.description || null
    this.viewIds = data?.viewIds || []
    this.defaultViewId = data?.defaultViewId || null
    this.layout = data?.layout || 'tabs'
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
