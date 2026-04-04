/**
 * Logging Data Adapter — transparent audit trail decorator.
 *
 * Wraps any IDataService and automatically creates LogEntry records
 * for every mutation (create, update, softDelete). The log collection
 * itself is exempt from logging to prevent infinite recursion.
 *
 * The Log is append-only. It's the audit trail that KIT-PLAN describes
 * as "the ledger" — every change to every record, permanently.
 */

import { LogEntry } from '../models/Log'
import { generateDateString } from '../utils'
import type {
  IDataService,
  DataOperationOptions,
  QueryOptions,
  QueryResult,
  QuerySpec,
  ReadOptions,
  SingleResult,
  Subscription,
  SubscribeOptions,
  SubscriptionChange,
  WriteOptions,
} from './types'

/** Options for configuring the logging decorator. */
export interface LoggingOptions {
  /** Collections to exclude from logging. Defaults to ['logs']. */
  excludeCollections?: string[]
  /** Actor ID to record on log entries. Pulled from options.handshakeId if not set. */
  actorId?: string
  /** Actor type (e.g., 'human', 'agent', 'system'). */
  actorType?: string
}

export class LoggingDataService implements IDataService {
  private inner: IDataService
  private logCollection: string
  private excludeCollections: Set<string>
  private actorId: string | null
  private actorType: string | null

  constructor(inner: IDataService, options?: LoggingOptions) {
    this.inner = inner
    this.logCollection = 'logs'
    this.excludeCollections = new Set(options?.excludeCollections ?? [this.logCollection])
    this.actorId = options?.actorId ?? null
    this.actorType = options?.actorType ?? null
  }

  async create<T = Record<string, unknown>>(
    collection: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const result = await this.inner.create<T>(collection, data, options)

    if (!this.excludeCollections.has(collection)) {
      const record = result.data as Record<string, unknown>
      await this.log(collection, record.id as string, 'create', options?.handshakeId)
    }

    return result
  }

  async read<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: ReadOptions,
  ): Promise<SingleResult<T> | null> {
    return this.inner.read<T>(collection, id, options)
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    // Read the current record for diff logging
    const before = await this.inner.read(collection, id)
    const result = await this.inner.update<T>(collection, id, data, options)

    if (!this.excludeCollections.has(collection)) {
      const changes = data as Record<string, unknown>
      const previous = before?.data as Record<string, unknown> | undefined

      // Log each changed field individually for field-level auditability
      for (const [field, newValue] of Object.entries(changes)) {
        if (field === 'updatedAt') continue // Skip system timestamps
        const oldValue = previous?.[field]
        if (oldValue !== newValue) {
          await this.log(
            collection, id, 'update', options?.handshakeId,
            field,
            oldValue !== undefined ? String(oldValue) : null,
            newValue !== undefined ? String(newValue) : null,
          )
        }
      }
    }

    return result
  }

  async softDelete(
    collection: string,
    id: string,
    options?: DataOperationOptions,
  ): Promise<boolean> {
    const deleted = await this.inner.softDelete(collection, id, options)

    if (deleted && !this.excludeCollections.has(collection)) {
      await this.log(collection, id, 'delete', options?.handshakeId)
    }

    return deleted
  }

  async query<T = Record<string, unknown>>(
    collection: string,
    spec: QuerySpec,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    return this.inner.query<T>(collection, spec, options)
  }

  async subscribe<T = Record<string, unknown>>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Promise<Subscription> {
    return this.inner.subscribe<T>(collection, callback, options)
  }

  async ping(): Promise<boolean> {
    return this.inner.ping()
  }

  async disconnect(): Promise<void> {
    return this.inner.disconnect()
  }

  // ─── Internal ───

  private async log(
    collection: string,
    entityId: string,
    action: string,
    handshakeId?: string,
    field?: string,
    fromValue?: string | null,
    toValue?: string | null,
  ): Promise<void> {
    const entry = new LogEntry({
      entityId,
      entityType: collection,
      level: field ? 'field' : 'entity',
      actorId: this.actorId ?? handshakeId ?? null,
      actorType: this.actorType,
      field: field ?? null,
      fromValue: fromValue ?? null,
      toValue: toValue ?? null,
      action,
      timestamp: generateDateString(),
    })

    try {
      await this.inner.create(this.logCollection, entry as unknown as Record<string, unknown>)
    } catch {
      // Log failures are swallowed — logging must never block mutations.
      // In production, this would emit to an error tracking service.
    }
  }
}
