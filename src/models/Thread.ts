import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Thread — a conversation chain. A Group of Messages with sequence relationships.
 *
 * Not just parentId hackery. A Thread is a first-class entity that owns
 * its messages and tracks participants, state, and context.
 */
export class Thread {
  static collection: string = 'threads'
  id: string
  /** Display title (auto-generated from first message or set explicitly) */
  title: string | null
  /** All participant entity IDs */
  participantIds: string[]
  /** Root message ID */
  rootMessageId: string | null
  /** Latest message ID (for preview/sorting) */
  latestMessageId: string | null
  /** Message count */
  messageCount: number
  /** Unread count per participant: { participantId: count } */
  unreadCounts: Record<string, number>
  /** Thread state */
  state: 'active' | 'archived' | 'closed'
  /** What entity types are in this thread: person, agent, cli, system */
  participantTypes: string[]
  contextId: string | null
  scopeId: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: import('./Traits').MetadataEntry[]
  constructor(data?: Partial<Thread>) {
    this.id = data?.id || generateUUID()
    this.title = data?.title || null
    this.participantIds = data?.participantIds || []
    this.rootMessageId = data?.rootMessageId || null
    this.latestMessageId = data?.latestMessageId || null
    this.messageCount = data?.messageCount ?? 0
    this.unreadCounts = data?.unreadCounts || {}
    this.state = data?.state || 'active'
    this.participantTypes = data?.participantTypes || []
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
