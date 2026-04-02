import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * MapNode — a positioned entity within a Map.
 *
 * Think of it like a celestial body: it has a position relative to center,
 * a layer (orbit), and references the entity it represents.
 */
export class MapNode {
  entityId: string
  entityType: string | null
  id: string
  /** Orbital layer — 0 is the center (black hole), 1 is stars, 2 is planets, etc. */
  layer: number
  /** Display label override */
  label: string | null
  metadata: MetadataEntry[]
  /** Position within the layer (angular or ordinal) */
  position: number
  constructor(data?: Partial<MapNode>) {
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.id = data?.id || generateUUID()
    this.layer = data?.layer ?? 0
    this.label = data?.label || null
    this.metadata = data?.metadata || []
    this.position = data?.position ?? 0
  }
}

/**
 * Map — the topology of all relationships in a set.
 *
 * A navigable structure that positions entities in orbital layers
 * around a center of gravity. Visualize a galaxy: central mass,
 * then stars, planets, moons, comets — each in their orbit,
 * all related through gravitational (relationship) edges.
 *
 * The Map doesn't duplicate Relationships — it references them.
 * It adds spatial/hierarchical positioning on top.
 */
export class Map {
  static collection: string = 'maps'
  /** The center entity — the gravitational anchor */
  centerId: string | null
  centerType: string | null
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  metadata: MetadataEntry[]
  name: string | null
  /** All positioned entities in this map */
  nodes: MapNode[]
  /** Relationship IDs that define the edges in this map */
  relationshipIds: string[]
  tags: Tag[]
  updatedAt: string
  constructor(data?: Partial<Map>) {
    this.centerId = data?.centerId || null
    this.centerType = data?.centerType || null
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.nodes = data?.nodes || []
    this.relationshipIds = data?.relationshipIds || []
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
