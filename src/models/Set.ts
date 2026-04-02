import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Set — a bounded, complete collection within a scope.
 *
 * Not just "these belong together" (that's Group). Set says
 * "this is ALL of them." The full menu, complete inventory,
 * entire roster. The completeness primitive.
 */
export class Set {
  static collection: string = 'sets'
  id: string
  name: string | null
  description: string | null
  /** What scope this set is bounded to */
  scopeId: string | null
  /** Is this definitively all of them */
  complete: boolean
  /** Maximum capacity (null = unlimited) */
  maxSize: number | null
  /** No more additions allowed */
  closed: boolean
  /** Entity IDs in this set */
  members: string[]
  memberType: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: MetadataEntry[]
  constructor(data?: Partial<Set>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.description = data?.description || null
    this.scopeId = data?.scopeId || null
    this.complete = data?.complete ?? false
    this.maxSize = data?.maxSize ?? null
    this.closed = data?.closed ?? false
    this.members = data?.members || []
    this.memberType = data?.memberType || null
    this.tags = data?.tags || []
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.deletedAt = data?.deletedAt || null
    this.metadata = data?.metadata || []
  }
}
