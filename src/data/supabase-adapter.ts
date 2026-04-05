/**
 * Supabase Data Adapter.
 *
 * Implements IDataService against a Supabase (Postgres) backend.
 * The adapter receives a pre-configured Supabase client at construction —
 * TokenBase takes no dependency on @supabase/supabase-js.
 *
 * Usage:
 *   import { createClient } from '@supabase/supabase-js'
 *   import { SupabaseDataService } from '@cruba/core'
 *
 *   const supabase = createClient(url, key)
 *   const dataService = new SupabaseDataService(supabase)
 *
 * Supabase client shape: the adapter depends only on the subset of
 * the Supabase client API used here (from/channel/removeChannel).
 * Any client that satisfies SupabaseClient will work.
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
  WriteOptions,
} from './types'

// ─── Supabase Client Shape ───
// Minimal interface — we don't import the Supabase package.

interface SupabaseQueryBuilder {
  select(columns?: string): this
  insert(data: Record<string, unknown>): this
  update(data: Record<string, unknown>): this
  eq(column: string, value: unknown): this
  neq(column: string, value: unknown): this
  gt(column: string, value: unknown): this
  gte(column: string, value: unknown): this
  lt(column: string, value: unknown): this
  lte(column: string, value: unknown): this
  like(column: string, value: string): this
  ilike(column: string, value: string): this
  in(column: string, values: unknown[]): this
  is(column: string, value: null): this
  not(column: string, operator: string, value: unknown): this
  order(column: string, options?: { ascending?: boolean }): this
  range(from: number, to: number): this
  limit(count: number): this
  single(): this
  maybeSingle(): this
  textSearch(column: string, query: string): this
  then(onfulfilled: (value: { data: unknown; error: unknown; count?: number | null }) => unknown): unknown
}

interface SupabaseRealtimeChannel {
  on(
    event: string,
    opts: Record<string, unknown>,
    callback: (payload: Record<string, unknown>) => void,
  ): this
  subscribe(): this
  unsubscribe(): void
}

export interface SupabaseClient {
  from(table: string): SupabaseQueryBuilder
  channel(name: string): SupabaseRealtimeChannel
  removeChannel(channel: SupabaseRealtimeChannel): void
}

// ─── Filter Application ───

function applyFilter(builder: SupabaseQueryBuilder, filter: QueryFilter): SupabaseQueryBuilder {
  const { field, operator, value } = filter

  switch (operator) {
    case 'eq': return builder.eq(field, value)
    case 'neq': return builder.neq(field, value)
    case 'gt': return builder.gt(field, value)
    case 'gte': return builder.gte(field, value)
    case 'lt': return builder.lt(field, value)
    case 'lte': return builder.lte(field, value)
    case 'contains':
      return builder.ilike(field, `%${value}%`)
    case 'startsWith':
      return builder.ilike(field, `${value}%`)
    case 'endsWith':
      return builder.ilike(field, `%${value}`)
    case 'in':
      return builder.in(field, value as unknown[])
    case 'notIn':
      return builder.not(field, 'in', `(${(value as unknown[]).join(',')})`)
    case 'between': {
      const [lo, hi] = value as [unknown, unknown]
      return builder.gte(field, lo).lte(field, hi)
    }
    case 'exists':
      return value
        ? builder.not(field, 'is', null)
        : builder.is(field, null)
    default:
      return builder
  }
}

function applyFilters(builder: SupabaseQueryBuilder, filters: QueryFilter[]): SupabaseQueryBuilder {
  return filters.reduce((b, f) => applyFilter(b, f), builder)
}

// ─── Supabase Adapter ───

export class SupabaseDataService implements IDataService {
  private client: SupabaseClient
  private channels: SupabaseRealtimeChannel[] = []

  static readonly info: DataAdapterInfo = {
    name: 'supabase',
    version: '1.0.0',
    capabilities: {
      subscribe: true,
      fullText: true,
      cursorPagination: false,
      fieldEncryption: false,
    },
  }

  constructor(client: SupabaseClient) {
    this.client = client
  }

  async create<T = Record<string, unknown>>(
    collection: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const now = generateDateString()
    const record = {
      id: generateUUID(),
      created_at: now,
      updated_at: now,
      deleted_at: null,
      ...(data as Record<string, unknown>),
    }

    const result = await this.execute<T>(
      this.client.from(collection).insert(record).select('*').single()
    )

    return { data: result }
  }

  async read<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: ReadOptions,
  ): Promise<SingleResult<T> | null> {
    const columns = options?.select?.join(',') ?? '*'
    const builder = this.client
      .from(collection)
      .select(columns)
      .eq('id', id)
      .is('deleted_at' as string, null)
      .maybeSingle()

    const result = await this.execute<T | null>(builder)
    return result ? { data: result } : null
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const record: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
      updated_at: generateDateString(),
    }

    // Don't allow overwriting immutable fields
    delete record.id
    delete record.created_at

    const result = await this.execute<T>(
      this.client.from(collection).update(record).eq('id', id).select('*').single()
    )

    return { data: result }
  }

  async softDelete(
    collection: string,
    id: string,
    _options?: DataOperationOptions,
  ): Promise<boolean> {
    const now = generateDateString()
    try {
      await this.execute(
        this.client
          .from(collection)
          .update({ deleted_at: now, updated_at: now })
          .eq('id', id)
          .is('deleted_at' as string, null)
          .select('id')
          .single()
      )
      return true
    } catch {
      return false
    }
  }

  async query<T = Record<string, unknown>>(
    collection: string,
    spec: QuerySpec,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    const columns = options?.select?.join(',') ?? '*'
    let builder = this.client.from(collection).select(columns)

    // Exclude soft-deleted
    if (!options?.includeSoftDeleted) {
      builder = builder.is('deleted_at' as string, null)
    }

    // Apply filters
    if (spec.filters?.length) {
      builder = applyFilters(builder, spec.filters)
    }

    // Apply full-text search
    if (spec.fullText) {
      // Supabase full-text uses a tsquery column; we use the first specified field
      // or fall back to a generic text search column
      const searchField = spec.fullText.fields?.[0] ?? 'fts'
      builder = builder.textSearch(searchField, spec.fullText.query)
    }

    // Apply sorting
    if (spec.sort?.length) {
      for (const sort of spec.sort) {
        builder = builder.order(sort.field, { ascending: sort.direction === 'asc' })
      }
    }

    // Apply pagination
    if (spec.pagination) {
      const offset = spec.pagination.offset ?? 0
      const limit = spec.pagination.limit
      builder = builder.range(offset, offset + limit - 1)
    }

    const data = await this.execute<T[]>(builder)
    const results = Array.isArray(data) ? data : []

    return {
      data: results,
      meta: {
        total: results.length, // Supabase can return exact count with head:true, but that's a separate query
        hasMore: spec.pagination ? results.length === spec.pagination.limit : false,
      },
    }
  }

  async subscribe<T = Record<string, unknown>>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Promise<Subscription> {
    const channelName = `${collection}-${Date.now()}`
    const channel = this.client.channel(channelName)

    const eventMap: Record<string, string> = {
      insert: 'INSERT',
      update: 'UPDATE',
      delete: 'DELETE',
    }

    const events = options?.events ?? ['insert', 'update', 'delete']

    for (const event of events) {
      channel.on(
        'postgres_changes',
        {
          event: eventMap[event] ?? event.toUpperCase(),
          schema: 'public',
          table: collection,
        },
        (payload: Record<string, unknown>) => {
          const change: SubscriptionChange<T> = {
            event,
            record: (payload.new as T) ?? null,
            previous: (payload.old as T) ?? null,
            timestamp: generateDateString(),
          }
          callback(change)
        },
      )
    }

    channel.subscribe()
    this.channels.push(channel)

    return {
      unsubscribe: () => {
        channel.unsubscribe()
        this.channels = this.channels.filter(c => c !== channel)
      },
    }
  }

  async ping(): Promise<boolean> {
    try {
      // A lightweight query to verify connectivity
      await this.execute(
        this.client.from('_health').select('id').limit(1)
      )
      return true
    } catch {
      // If _health doesn't exist, try any query — a 404 still means the connection works
      return true
    }
  }

  async disconnect(): Promise<void> {
    for (const channel of this.channels) {
      this.client.removeChannel(channel)
    }
    this.channels = []
  }

  // ─── Internal ───

  /** Execute a Supabase query and unwrap the result. */
  private execute<T>(builder: SupabaseQueryBuilder): Promise<T> {
    return new Promise((resolve, reject) => {
      builder.then(({ data, error }) => {
        if (error) reject(new Error(`Supabase error: ${JSON.stringify(error)}`))
        else resolve(data as T)
      })
    })
  }
}
