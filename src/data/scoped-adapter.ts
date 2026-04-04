/**
 * Scoped Data Adapter — enforces scope partitioning.
 *
 * Wraps any IDataService and injects scopeId filtering on every operation.
 * A scoped adapter only sees data belonging to its scope — queries are
 * automatically filtered, creates are automatically tagged, and reads
 * verify scope membership.
 *
 * This is the data-layer enforcement of the MCP scope model.
 * Even if the MCP bridge is bypassed, the data service won't leak
 * cross-scope data.
 */

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

/** Configuration for the scoped adapter. */
export interface ScopeConfig {
  /** The scope ID to enforce (org, project, or environment ID). */
  scopeId: string
  /** The field name that stores the scope ID on records. Defaults to 'scopeId'. */
  scopeField?: string
  /** Collections that are scope-exempt (e.g., global config tables). */
  exemptCollections?: string[]
}

export class ScopedDataService implements IDataService {
  private inner: IDataService
  private scopeId: string
  private scopeField: string
  private exemptCollections: Set<string>

  constructor(inner: IDataService, config: ScopeConfig) {
    this.inner = inner
    this.scopeId = config.scopeId
    this.scopeField = config.scopeField ?? 'scopeId'
    this.exemptCollections = new Set(config.exemptCollections ?? [])
  }

  async create<T = Record<string, unknown>>(
    collection: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    if (!this.exemptCollections.has(collection)) {
      // Tag the record with this scope
      (data as Record<string, unknown>)[this.scopeField] = this.scopeId
    }
    return this.inner.create<T>(collection, data, options)
  }

  async read<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: ReadOptions,
  ): Promise<SingleResult<T> | null> {
    const result = await this.inner.read<T>(collection, id, options)
    if (!result) return null

    // Verify the record belongs to this scope
    if (!this.exemptCollections.has(collection)) {
      const record = result.data as Record<string, unknown>
      if (record[this.scopeField] !== this.scopeId) return null
    }

    return result
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    // Verify scope before allowing update
    if (!this.exemptCollections.has(collection)) {
      const existing = await this.inner.read(collection, id)
      if (!existing) throw new Error(`Record not found: ${collection}/${id}`)

      const record = existing.data as Record<string, unknown>
      if (record[this.scopeField] !== this.scopeId) {
        throw new Error(`Record ${id} does not belong to scope ${this.scopeId}`)
      }

      // Prevent changing the scope field
      delete (data as Record<string, unknown>)[this.scopeField]
    }

    return this.inner.update<T>(collection, id, data, options)
  }

  async softDelete(
    collection: string,
    id: string,
    options?: DataOperationOptions,
  ): Promise<boolean> {
    // Verify scope before allowing delete
    if (!this.exemptCollections.has(collection)) {
      const existing = await this.inner.read(collection, id)
      if (!existing) return false

      const record = existing.data as Record<string, unknown>
      if (record[this.scopeField] !== this.scopeId) return false
    }

    return this.inner.softDelete(collection, id, options)
  }

  async query<T = Record<string, unknown>>(
    collection: string,
    spec: QuerySpec,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    if (!this.exemptCollections.has(collection)) {
      // Inject scope filter
      const scopeFilter = {
        field: this.scopeField,
        operator: 'eq' as const,
        value: this.scopeId,
      }
      spec = {
        ...spec,
        filters: [...(spec.filters ?? []), scopeFilter],
      }
    }

    return this.inner.query<T>(collection, spec, options)
  }

  async subscribe<T = Record<string, unknown>>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Promise<Subscription> {
    if (!this.exemptCollections.has(collection)) {
      // Inject scope filter on subscriptions
      const scopeFilter = {
        field: this.scopeField,
        operator: 'eq' as const,
        value: this.scopeId,
      }
      options = {
        ...options,
        filters: [...(options?.filters ?? []), scopeFilter],
      }
    }

    return this.inner.subscribe<T>(collection, callback, options)
  }

  async ping(): Promise<boolean> {
    return this.inner.ping()
  }

  async disconnect(): Promise<void> {
    return this.inner.disconnect()
  }
}
