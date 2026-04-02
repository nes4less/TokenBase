import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Scope — defines what is affected downstream.
 *
 * Scopes form a hierarchy (via parentId/children) and carry
 * regional/currency/access metadata. Models reference scopes
 * to declare their downstream impact.
 */
export class Scope {
  static collection: string = 'scopes'
  access: string | null
  children: string[]
  country: string | null
  createdAt: string
  createdBy: string | null
  currency: string | null
  deletedAt: string | null
  description: string | null
  entityId: string | null
  entityType: string | null
  id: string
  language: string | null
  metadata: MetadataEntry[]
  name: string | null
  parentId: string | null
  regionCode: string | null
  tags: Tag[]
  timezone: string | null
  updatedAt: string
  constructor(data?: Partial<Scope>) {
    this.access = data?.access || null
    this.children = data?.children || []
    this.country = data?.country || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.currency = data?.currency || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.id = data?.id || generateUUID()
    this.language = data?.language || null
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.parentId = data?.parentId || null
    this.regionCode = data?.regionCode || null
    this.tags = data?.tags || []
    this.timezone = data?.timezone || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
