/**
 * Data Service Type Definitions.
 *
 * The abstract data layer for TokenBase. All persistence flows through
 * IDataService — the same operation set as MCP (create, read, update,
 * softDelete, query, subscribe), so the MCP layer can delegate directly.
 *
 * Adapters implement IDataService for a specific backend (Supabase,
 * MongoDB, in-memory, etc.). The adapter receives its client at
 * construction — TokenBase takes no backend dependencies.
 */

import type { MCPFilterOperator } from '../mcp/types'
import type { EncryptionConfig } from '../security/types'

// ─── Query Types ───

/** A single filter condition for a query. */
export interface QueryFilter {
  /** The field to filter on. */
  field: string
  /** The comparison operator. */
  operator: MCPFilterOperator
  /** The value(s) to compare against. */
  value: unknown
}

/** Sort direction for query results. */
export interface QuerySort {
  field: string
  direction: 'asc' | 'desc'
}

/** Pagination parameters. */
export interface QueryPagination {
  /** Maximum number of records to return. */
  limit: number
  /** Number of records to skip (offset-based). */
  offset?: number
  /** Cursor for keyset pagination (preferred over offset for large sets). */
  cursor?: string
}

/** Full-text search parameters. */
export interface QueryFullText {
  /** The search query string. */
  query: string
  /** Fields to search in. Empty = all text fields. */
  fields?: string[]
}

/** The complete query specification. */
export interface QuerySpec {
  filters?: QueryFilter[]
  sort?: QuerySort[]
  pagination?: QueryPagination
  fullText?: QueryFullText
}

// ─── Result Types ───

/** Metadata about a query result set. */
export interface QueryResultMeta {
  /** Total number of records matching the filters (before pagination). */
  total: number
  /** Whether there are more records after this page. */
  hasMore: boolean
  /** Cursor for the next page (if using keyset pagination). */
  nextCursor?: string
}

/** A paginated query result. */
export interface QueryResult<T> {
  data: T[]
  meta: QueryResultMeta
}

/** A single record result (read, create, update). */
export interface SingleResult<T> {
  data: T
}

// ─── Subscription Types ───

/** Events emitted by a subscription. */
export type SubscriptionEvent = 'insert' | 'update' | 'delete'

/** A subscription change payload. */
export interface SubscriptionChange<T> {
  event: SubscriptionEvent
  /** The record after the change (null for deletes). */
  record: T | null
  /** The record before the change (null for inserts). */
  previous: T | null
  /** When the change occurred. */
  timestamp: string
}

/** A subscription handle — call unsubscribe() to stop. */
export interface Subscription {
  /** Stop receiving changes. */
  unsubscribe(): void
}

// ─── Service Options ───

/** Options that can be passed to any data operation. */
export interface DataOperationOptions {
  /** The Handshake ID for scope resolution. */
  handshakeId?: string
  /** Encryption configuration override (defaults to model config). */
  encryption?: EncryptionConfig
  /** Abort signal for cancellation. */
  signal?: AbortSignal
}

/** Options for write operations (create, update). */
export interface WriteOptions extends DataOperationOptions {
  /** Whether to validate against the Zod schema before writing. */
  validate?: boolean
  /** Whether to return the full record after writing. Defaults to true. */
  returning?: boolean
}

/** Options for read operations. */
export interface ReadOptions extends DataOperationOptions {
  /** Fields to include in the result. Empty = all visible fields. */
  select?: string[]
}

/** Options for query operations. */
export interface QueryOptions extends DataOperationOptions {
  /** Fields to include in results. Empty = all visible fields. */
  select?: string[]
  /** Whether to include soft-deleted records. Defaults to false. */
  includeSoftDeleted?: boolean
}

/** Options for subscription operations. */
export interface SubscribeOptions extends DataOperationOptions {
  /** Which events to listen for. Defaults to all. */
  events?: SubscriptionEvent[]
  /** Pre-filter: only emit changes matching these filters. */
  filters?: QueryFilter[]
}

// ─── The Data Service Interface ───

/**
 * The core data service contract. Every backend adapter implements this.
 *
 * Generic parameter T defaults to Record<string, unknown> — callers
 * pass the concrete model type for type safety.
 *
 * The operation set matches MCP exactly:
 * - create  → insert a new record
 * - read    → fetch a single record by id
 * - update  → partial update by id
 * - softDelete → set deletedAt, never hard-delete
 * - query   → filtered, sorted, paginated list
 * - subscribe → real-time change stream
 */
export interface IDataService {
  /** Insert a new record. Returns the created record with system fields populated. */
  create<T = Record<string, unknown>>(
    collection: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>>

  /** Fetch a single record by ID. Returns null if not found or soft-deleted. */
  read<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: ReadOptions,
  ): Promise<SingleResult<T> | null>

  /** Partial update by ID. Returns the updated record. */
  update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>>

  /** Soft-delete by ID (sets deletedAt). Returns true if the record existed. */
  softDelete(
    collection: string,
    id: string,
    options?: DataOperationOptions,
  ): Promise<boolean>

  /** Query with filters, sorting, and pagination. */
  query<T = Record<string, unknown>>(
    collection: string,
    spec: QuerySpec,
    options?: QueryOptions,
  ): Promise<QueryResult<T>>

  /** Subscribe to real-time changes on a collection. */
  subscribe<T = Record<string, unknown>>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Promise<Subscription>

  /** Health check — returns true if the backend is reachable. */
  ping(): Promise<boolean>

  /** Clean shutdown — close connections, flush buffers. */
  disconnect(): Promise<void>
}

// ─── Adapter Registration ───

/** Metadata about a registered adapter. */
export interface DataAdapterInfo {
  /** Adapter name (e.g., 'supabase', 'mongodb', 'memory'). */
  name: string
  /** Adapter version. */
  version: string
  /** Which features this adapter supports. */
  capabilities: {
    subscribe: boolean
    fullText: boolean
    cursorPagination: boolean
    fieldEncryption: boolean
  }
}
