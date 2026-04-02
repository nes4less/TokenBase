import { generateDateString, generateUUID } from '../utils'

/**
 * Queue — ordered waiting line.
 *
 * Things enter, wait, get processed in order or by priority.
 * Build queues, task queues, message queues, approval queues.
 */

export type QueueOrder = 'fifo' | 'lifo' | 'priority'

export class QueueItem {
  id: string
  entityId: string
  entityType: string | null
  priority: number
  enqueuedAt: string
  dequeuedAt: string | null
  metadata: Record<string, string>
  constructor(data?: Partial<QueueItem>) {
    this.id = data?.id || generateUUID()
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.priority = data?.priority ?? 0
    this.enqueuedAt = data?.enqueuedAt || generateDateString()
    this.dequeuedAt = data?.dequeuedAt || null
    this.metadata = data?.metadata || {}
  }
}

export class Queue {
  static collection: string = 'queues'
  id: string
  name: string | null
  order: QueueOrder
  maxSize: number | null
  items: QueueItem[]
  processingId: string | null
  createdAt: string
  updatedAt: string
  metadata: Record<string, string>
  constructor(data?: Partial<Queue>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.order = data?.order || 'fifo'
    this.maxSize = data?.maxSize ?? null
    this.items = data?.items || []
    this.processingId = data?.processingId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.updatedAt = data?.updatedAt || generateDateString()
    this.metadata = data?.metadata || {}
  }
}
