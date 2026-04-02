import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Identifier } from './Identifier'
import { Image } from './Image'
import { Tag } from './Tag'

/**
 * Unifier — defines what makes a variant distinct from its siblings.
 *
 * A Unifier lives within one or more Groups (what belongs together),
 * references one or more Scopes (what's affected downstream),
 * and carries Identifiers (how to tell this variant apart),
 * Differences (what's unique), and Similarities (what's shared).
 *
 * Context handles display/icon/scoping — Unifier is pure structure.
 */
export class Unifier {
  static collection: string = 'unifiers'
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  /** What makes this variant unique from its siblings */
  differences: Record<string, string>
  /** References to Group IDs this unifier belongs to */
  groupIds: string[]
  id: string
  identifiers: Identifier[]
  images: Image[]
  metadata: MetadataEntry[]
  name: string | null
  /** References to Scope IDs this unifier affects */
  scopeIds: string[]
  /** What's shared across all variants in the group */
  similarities: Record<string, string>
  tags: Tag[]
  updatedAt: string
  constructor(data?: Partial<Unifier>) {
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.differences = data?.differences || {}
    this.groupIds = data?.groupIds || []
    this.id = data?.id || generateUUID()
    this.identifiers = data?.identifiers || []
    this.images = data?.images || []
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.scopeIds = data?.scopeIds || []
    this.similarities = data?.similarities || {}
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
