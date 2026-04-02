import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * Async — an operation that doesn't resolve immediately.
 *
 * The Promise pattern as a data model. Tasks, builds, approvals,
 * agent flows — anything that's pending then resolves.
 */

export type AsyncStatus = 'pending' | 'active' | 'resolved' | 'rejected' | 'cancelled' | 'timeout'

export class Async {
  static collection: string = 'asyncs'
  id: string
  status: AsyncStatus
  /** What entity this async operation is for */
  entityId: string | null
  entityType: string | null
  /** Result payload on resolution */
  result: string | null
  /** Error message on rejection */
  error: string | null
  /** Timeout in milliseconds (0 = no timeout) */
  timeout: number
  /** Callback entity ID to notify on resolution */
  callbackId: string | null
  createdAt: string
  resolvedAt: string | null
  metadata: MetadataEntry[]
  constructor(data?: Partial<Async>) {
    this.id = data?.id || generateUUID()
    this.status = data?.status || 'pending'
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.result = data?.result || null
    this.error = data?.error || null
    this.timeout = data?.timeout ?? 0
    this.callbackId = data?.callbackId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.resolvedAt = data?.resolvedAt || null
    this.metadata = data?.metadata || []
  }
}
