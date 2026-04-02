import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Group — declares that things belong together.
 *
 * Groups are the "these things are related" container.
 * Unifiers reference groups to say "I'm a variant within this group."
 */
export class Group {
  static collection: string = 'groups'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  entityId: string | null
  entityType: string | null
  id: string
  metadata: MetadataEntry[]
  name: string | null
  parentId: string | null
  tags: Tag[]
  updatedAt: string
  constructor(data?: Partial<Group>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.parentId = data?.parentId || null
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
