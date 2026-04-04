/**
 * In-Memory Data Adapter.
 *
 * A fully functional IDataService implementation backed by plain Maps.
 * Zero dependencies, no persistence. Useful for:
 * - Testing (fast, deterministic, no cleanup)
 * - Local development without a database
 * - Unit testing MCP ↔ Data integration
 *
 * Supports all operations including subscriptions (in-process EventEmitter).
 */

import { generateDateString, generateUUID } from '../utils'
import type {
  DataAdapterInfo,
  DataOperationOptions,
  IDataService,
  QueryFilter,
  QueryOptions,
  QueryResult,
  QuerySpec,
  ReadOptions,
  SingleResult,
  Subscription,
  SubscribeOptions,
  SubscriptionChange,
  SubscriptionEvent,
  WriteOptions,
} from './types'

// ─── Filter Evaluation ───

/** Evaluate a single filter condition against a record. */
function evaluateFilter(record: Record<string, unknown>, filter: QueryFilter): boolean {
  const value = record[filter.field]
  const target = filter.value

  switch (filter.operator) {
    case 'eq': return value === target
    case 'neq': return value !== target
    case 'gt': return typeof value === 'number' && typeof target === 'number' && value > target
    case 'gte': return typeof value === 'number' && typeof target === 'number' && value >= target
    case 'lt': return typeof value === 'number' && typeof target === 'number' && value < target
    case 'lte': return typeof value === 'number' && typeof target === 'number' && value <= target
    case 'contains':
      return typeof value === 'string' && typeof target === 'string'
        && value.toLowerCase().includes(target.toLowerCase())
    case 'startsWith':
      return typeof value === 'string' && typeof target === 'string'
        && value.toLowerCase().startsWith(target.toLowerCase())
    case 'endsWith':
      return typeof value === 'string' && typeof target === 'string'
        && value.toLowerCase().endsWith(target.toLowerCase())
    case 'in':
      return Array.isArray(target) && target.includes(value)
    case 'notIn':
      return Array.isArray(target) && !target.includes(value)
    case 'between':
      if (!Array.isArray(target) || target.length !== 2) return false
      return typeof value === 'number' && value >= target[0] && value <= target[1]
    case 'exists':
      return target ? value !== undefined && value !== null : value === undefined || value === null
    default:
      return false
  }
}

/** Evaluate all filters (AND logic). */
function matchesFilters(record: Record<string, unknown>, filters: QueryFilter[]): boolean {
  return filters.every(f => evaluateFilter(record, f))
}

// ─── Sort Comparator ───

function buildComparator(sorts: { field: string; direction: 'asc' | 'desc' }[]) {
  return (a: Record<string, unknown>, b: Record<string, unknown>): number => {
    for (const sort of sorts) {
      const aVal = a[sort.field]
      const bVal = b[sort.field]
      if (aVal === bVal) continue
      if (aVal == null) return sort.direction === 'asc' ? 1 : -1
      if (bVal == null) return sort.direction === 'asc' ? -1 : 1
      const cmp = aVal < bVal ? -1 : 1
      return sort.direction === 'asc' ? cmp : -cmp
    }
    return 0
  }
}

// ─── Full-Text Search ───

function matchesFullText(
  record: Record<string, unknown>,
  query: string,
  fields?: string[],
): boolean {
  const lower = query.toLowerCase()
  const searchFields = fields?.length
    ? fields
    : Object.keys(record)

  return searchFields.some(field => {
    const val = record[field]
    return typeof val === 'string' && val.toLowerCase().includes(lower)
  })
}

// ─── Subscription Manager ───

type Listener<T> = {
  callback: (change: SubscriptionChange<T>) => void
  events?: SubscriptionEvent[]
  filters?: QueryFilter[]
}

class SubscriptionManager {
  private listeners = new Map<string, Set<Listener<unknown>>>()

  add<T>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Subscription {
    if (!this.listeners.has(collection)) {
      this.listeners.set(collection, new Set())
    }

    const listener: Listener<unknown> = {
      callback: callback as (change: SubscriptionChange<unknown>) => void,
      events: options?.events,
      filters: options?.filters,
    }

    this.listeners.get(collection)!.add(listener)

    return {
      unsubscribe: () => {
        this.listeners.get(collection)?.delete(listener)
      },
    }
  }

  emit<T>(collection: string, change: SubscriptionChange<T>): void {
    const listeners = this.listeners.get(collection)
    if (!listeners) return

    for (const listener of listeners) {
      // Event type filter
      if (listener.events?.length && !listener.events.includes(change.event)) continue

      // Record filter (apply to the new record for inserts/updates, previous for deletes)
      if (listener.filters?.length) {
        const record = change.record ?? change.previous
        if (record && !matchesFilters(record as Record<string, unknown>, listener.filters)) continue
      }

      listener.callback(change as SubscriptionChange<unknown>)
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}

// ─── In-Memory Adapter ───

export class InMemoryDataService implements IDataService {
  private collections = new Map<string, Map<string, Record<string, unknown>>>()
  private subscriptions = new SubscriptionManager()

  static readonly info: DataAdapterInfo = {
    name: 'memory',
    version: '1.0.0',
    capabilities: {
      subscribe: true,
      fullText: true,
      cursorPagination: false,
      fieldEncryption: false,
    },
  }

  /** Get or create a collection's record map. */
  private getCollection(name: string): Map<string, Record<string, unknown>> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map())
    }
    return this.collections.get(name)!
  }

  async create<T = Record<string, unknown>>(
    collection: string,
    data: Partial<T>,
    _options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const now = generateDateString()
    const record: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
      id: (data as Record<string, unknown>).id as string ?? generateUUID(),
      createdAt: (data as Record<string, unknown>).createdAt as string ?? now,
      updatedAt: now,
      deletedAt: null,
    }

    this.getCollection(collection).set(record.id as string, record)

    this.subscriptions.emit<T>(collection, {
      event: 'insert',
      record: record as T,
      previous: null,
      timestamp: now,
    })

    return { data: record as T }
  }

  async read<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: ReadOptions,
  ): Promise<SingleResult<T> | null> {
    const record = this.getCollection(collection).get(id)
    if (!record || record.deletedAt !== null) return null

    if (options?.select?.length) {
      const projected = Object.fromEntries(
        options.select
          .filter(f => f in record)
          .map(f => [f, record[f]])
      )
      projected.id = record.id
      return { data: projected as T }
    }

    return { data: record as T }
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
    _options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const col = this.getCollection(collection)
    const existing = col.get(id)
    if (!existing) throw new Error(`Record not found: ${collection}/${id}`)
    if (existing.deletedAt !== null) throw new Error(`Record is soft-deleted: ${collection}/${id}`)

    const previous = { ...existing }
    const now = generateDateString()
    const updated: Record<string, unknown> = {
      ...existing,
      ...(data as Record<string, unknown>),
      id, // ID is immutable
      updatedAt: now,
    }

    col.set(id, updated)

    this.subscriptions.emit<T>(collection, {
      event: 'update',
      record: updated as T,
      previous: previous as T,
      timestamp: now,
    })

    return { data: updated as T }
  }

  async softDelete(
    collection: string,
    id: string,
    _options?: DataOperationOptions,
  ): Promise<boolean> {
    const col = this.getCollection(collection)
    const existing = col.get(id)
    if (!existing || existing.deletedAt !== null) return false

    const previous = { ...existing }
    const now = generateDateString()
    existing.deletedAt = now
    existing.updatedAt = now

    this.subscriptions.emit(collection, {
      event: 'delete',
      record: null,
      previous,
      timestamp: now,
    })

    return true
  }

  async query<T = Record<string, unknown>>(
    collection: string,
    spec: QuerySpec,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const col = this.getCollection(collection)
    let records = Array.from(col.values())

    // Exclude soft-deleted unless requested
    if (!options?.includeSoftDeleted) {
      records = records.filter(r => r.deletedAt === null || r.deletedAt === undefined)
    }

    // Apply filters
    if (spec.filters?.length) {
      records = records.filter(r => matchesFilters(r, spec.filters!))
    }

    // Apply full-text search
    if (spec.fullText) {
      records = records.filter(r => matchesFullText(r, spec.fullText!.query, spec.fullText!.fields))
    }

    const total = records.length

    // Apply sorting
    if (spec.sort?.length) {
      records.sort(buildComparator(spec.sort))
    }

    // Apply pagination
    let hasMore = false
    if (spec.pagination) {
      const offset = spec.pagination.offset ?? 0
      const limit = spec.pagination.limit
      records = records.slice(offset, offset + limit)
      hasMore = offset + limit < total
    }

    // Apply field selection
    if (options?.select?.length) {
      records = records.map(r => {
        const projected = Object.fromEntries(
          options.select!
            .filter(f => f in r)
            .map(f => [f, r[f]])
        )
        projected.id = r.id
        return projected
      })
    }

    return {
      data: records as T[],
      meta: { total, hasMore },
    }
  }

  async subscribe<T = Record<string, unknown>>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Promise<Subscription> {
    return this.subscriptions.add<T>(collection, callback, options)
  }

  async ping(): Promise<boolean> {
    return true
  }

  async disconnect(): Promise<void> {
    this.subscriptions.clear()
    this.collections.clear()
  }

  // ─── Test Helpers ───

  /** Get the raw record count for a collection (including soft-deleted). */
  size(collection: string): number {
    return this.getCollection(collection).size
  }

  /** Clear all data from all collections. */
  reset(): void {
    this.collections.clear()
    this.subscriptions.clear()
  }

  /** Seed a collection with raw records (bypasses create logic). */
  seed(collection: string, records: Record<string, unknown>[]): void {
    const col = this.getCollection(collection)
    for (const record of records) {
      const id = (record.id as string) ?? generateUUID()
      col.set(id, { ...record, id })
    }
  }
}
