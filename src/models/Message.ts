import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Message — a communication unit within the graph.
 *
 * Messages live inside Threads. They're the atomic unit of
 * communication: text, images, action payloads, system notices.
 * Messages are polymorphic (can reference any entity), threaded
 * (parentId for replies), and typed by sender.
 *
 * SenderType distinguishes human from machine communication —
 * agents and CLI tools are first-class message authors.
 */
export type SenderType = 'person' | 'agent' | 'cli' | 'system'

export class Message extends Entity {
  static collection: string = 'messages'

  /** Structured payload for actionable messages */
  actionPayload: Record<string, unknown> | null

  body: string | null
  entityId: string | null
  entityType: string | null
  image: string | null
  language: string | null

  /** Processing/visibility layer */
  layer: string | null

  metadata: MetadataEntry[]
  parentId: string | null
  readAt: string | null
  recipientId: string | null
  recipientType: SenderType | null
  senderId: string | null
  senderType: SenderType | null
  tags: string[]

  /** Associated task ID (for task-scoped messages) */
  taskId: string | null

  /** Thread this message belongs to */
  threadId: string | null

  translations: { [key: string]: string }

  constructor(data?: Partial<Message>) {
    super(data)
    this.actionPayload = data?.actionPayload || null
    this.body = data?.body || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.image = data?.image || null
    this.language = data?.language || null
    this.layer = data?.layer || null
    this.metadata = data?.metadata || []
    this.parentId = data?.parentId || null
    this.readAt = data?.readAt || null
    this.recipientId = data?.recipientId || null
    this.recipientType = data?.recipientType || null
    this.senderId = data?.senderId || null
    this.senderType = data?.senderType || null
    this.tags = data?.tags || []
    this.taskId = data?.taskId || null
    this.threadId = data?.threadId || null
    this.translations = data?.translations || {}
  }
}
