import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Navigation transition type.
 */
export type NavigationType = 'stack' | 'tab' | 'modal' | 'drawer' | 'replace'

/**
 * NavigationNode — a single point in the navigation graph.
 */
export class NavigationNode {
  id: string
  /** What this node renders — View ID or ViewGroup ID */
  targetId: string
  targetType: 'view' | 'viewGroup' | 'screen'
  /** Label for display */
  label: string | null
  /** Icon name */
  icon: string | null
  /** Badge function ID — computes the badge count */
  badgeFunctionId: string | null
  /** Position in parent */
  position: number
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<NavigationNode>) {
    this.id = data?.id || generateUUID()
    this.targetId = data?.targetId || ''
    this.targetType = data?.targetType || 'view'
    this.label = data?.label || null
    this.icon = data?.icon || null
    this.badgeFunctionId = data?.badgeFunctionId || null
    this.position = data?.position ?? 0
    this.metadata = data?.metadata || []
  }
}

/**
 * Navigation — how you move between views.
 *
 * Stack (push/pop), tab (switch), modal (overlay), drawer (slide).
 * Each navigation defines its type, its nodes, and transition behavior.
 */
export class Navigation {
  static collection: string = 'navigations'
  id: string
  name: string | null
  description: string | null
  /** How this navigation behaves */
  type: NavigationType
  /** The navigation nodes (screens/views) */
  nodes: NavigationNode[]
  /** Default node ID to show */
  defaultNodeId: string | null
  /** Transition style hint */
  transition: 'slide' | 'fade' | 'none' | null
  contextId: string | null
  scopeId: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<Navigation>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.description = data?.description || null
    this.type = data?.type || 'stack'
    this.nodes = data?.nodes || []
    this.defaultNodeId = data?.defaultNodeId || null
    this.transition = data?.transition || null
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
