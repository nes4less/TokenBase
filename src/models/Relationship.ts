import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Relationship type — the nature of the connection between two groups/entities.
 */
export type RelationshipType =
  | 'parent'
  | 'child'
  | 'sibling'
  | 'dependency'
  | 'composition'
  | 'association'
  | 'reference'
  | 'sequence'
  | 'alternative'
  | 'extension'
  | 'override'
  | 'mirror'

/**
 * Relationship — a typed edge between two entities.
 *
 * Connects groups, models, or any addressable things with
 * a named, directional relationship type.
 */
export class Relationship {
  static collection: string = 'relationships'
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  metadata: MetadataEntry[]
  /** The source entity/group ID */
  sourceId: string
  /** The source entity type or collection */
  sourceType: string | null
  tags: Tag[]
  /** The target entity/group ID */
  targetId: string
  /** The target entity type or collection */
  targetType: string | null
  /** The nature of this relationship */
  type: RelationshipType
  updatedAt: string
  /** Strength/weight of the relationship (0-1) */
  weight: number | null
  constructor(data?: Partial<Relationship>) {
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || []
    this.sourceId = data?.sourceId || ''
    this.sourceType = data?.sourceType || null
    this.tags = data?.tags || []
    this.targetId = data?.targetId || ''
    this.targetType = data?.targetType || null
    this.type = data?.type || 'association'
    this.updatedAt = data?.updatedAt || generateDateString()
    this.weight = data?.weight ?? null
  }
}
