import { generateDateString, generateUUID } from '../utils'

/**
 * Log — immutable append-only change record.
 *
 * What changed, when, by whom, from what to what.
 * The complete audit trail primitive.
 *
 * Absorbs StatusChange — a status transition is a LogEntry
 * with level:'field', field:'status', fromValue/toValue set.
 */

export type LogLevel = 'field' | 'entity' | 'access' | 'derivation' | 'system' | 'status'

export class LogEntry {
  id: string
  /** What entity was affected */
  entityId: string
  entityType: string | null
  /** What level of change */
  level: LogLevel
  /** Who/what made the change */
  actorId: string | null
  actorType: string | null
  /** What changed */
  field: string | null
  fromValue: string | null
  toValue: string | null
  /** Action: create, update, delete, read, export, share, transition */
  action: string
  /** Optional reason for the change */
  reason: string | null
  timestamp: string
  metadata: Record<string, string>
  constructor(data?: Partial<LogEntry>) {
    this.id = data?.id || generateUUID()
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.level = data?.level || 'entity'
    this.actorId = data?.actorId || null
    this.actorType = data?.actorType || null
    this.field = data?.field || null
    this.fromValue = data?.fromValue || null
    this.toValue = data?.toValue || null
    this.action = data?.action || 'update'
    this.reason = data?.reason || null
    this.timestamp = data?.timestamp || generateDateString()
    this.metadata = data?.metadata || {}
  }
}
