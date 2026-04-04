/**
 * Secure Data Service — transparent encryption wrapper.
 *
 * Decorates any IDataService with field-level encryption/decryption.
 * Data is encrypted before writes and decrypted after reads, using
 * the EncryptionService and per-model encryption configs.
 *
 * The wrapped service sees only encrypted blobs for configured fields.
 * The caller sees plaintext. No code change needed on either side.
 */

import { EncryptionService } from '../security/encryption'
import type { EncryptionConfig, DerivedKey, EncryptedPayload } from '../security/types'
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
} from '../data/types'
import type { SecureModelConfig } from './types'

export class SecureDataService implements IDataService {
  private inner: IDataService
  private crypto: EncryptionService
  private configs: Map<string, EncryptionConfig>
  private keyResolver: (collection: string, field?: string) => DerivedKey | null

  /**
   * @param inner - The underlying data service to wrap
   * @param keyResolver - Returns the encryption key for a collection (and optionally a field).
   *   Return null to skip encryption for that collection/field.
   * @param modelConfigs - Per-model encryption configuration
   */
  constructor(
    inner: IDataService,
    keyResolver: (collection: string, field?: string) => DerivedKey | null,
    modelConfigs?: SecureModelConfig[],
  ) {
    this.inner = inner
    this.crypto = new EncryptionService()
    this.keyResolver = keyResolver
    this.configs = new Map()

    if (modelConfigs) {
      for (const config of modelConfigs) {
        this.configs.set(config.collection, config.encryption)
      }
    }
  }

  async create<T = Record<string, unknown>>(
    collection: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const encrypted = this.encryptRecord(collection, data as Record<string, unknown>)
    const result = await this.inner.create<T>(collection, encrypted as Partial<T>, options)
    return { data: this.decryptRecord(collection, result.data as Record<string, unknown>) as T }
  }

  async read<T = Record<string, unknown>>(
    collection: string,
    id: string,
    options?: ReadOptions,
  ): Promise<SingleResult<T> | null> {
    const result = await this.inner.read<T>(collection, id, options)
    if (!result) return null
    return { data: this.decryptRecord(collection, result.data as Record<string, unknown>) as T }
  }

  async update<T = Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
    options?: WriteOptions,
  ): Promise<SingleResult<T>> {
    const encrypted = this.encryptRecord(collection, data as Record<string, unknown>)
    const result = await this.inner.update<T>(collection, id, encrypted as Partial<T>, options)
    return { data: this.decryptRecord(collection, result.data as Record<string, unknown>) as T }
  }

  async softDelete(
    collection: string,
    id: string,
    options?: DataOperationOptions,
  ): Promise<boolean> {
    return this.inner.softDelete(collection, id, options)
  }

  async query<T = Record<string, unknown>>(
    collection: string,
    spec: QuerySpec,
    options?: QueryOptions,
  ): Promise<QueryResult<T>> {
    // Note: querying on encrypted fields won't work with standard filters.
    // This is by design — encrypted fields can only be queried via commitments.
    const result = await this.inner.query<T>(collection, spec, options)
    return {
      data: result.data.map(r => this.decryptRecord(collection, r as Record<string, unknown>) as T),
      meta: result.meta,
    }
  }

  async subscribe<T = Record<string, unknown>>(
    collection: string,
    callback: (change: SubscriptionChange<T>) => void,
    options?: SubscribeOptions,
  ): Promise<Subscription> {
    // Wrap callback to decrypt incoming changes
    const wrappedCallback = (change: SubscriptionChange<T>) => {
      callback({
        ...change,
        record: change.record
          ? this.decryptRecord(collection, change.record as Record<string, unknown>) as T
          : null,
        previous: change.previous
          ? this.decryptRecord(collection, change.previous as Record<string, unknown>) as T
          : null,
      })
    }

    return this.inner.subscribe<T>(collection, wrappedCallback, options)
  }

  async ping(): Promise<boolean> {
    return this.inner.ping()
  }

  async disconnect(): Promise<void> {
    return this.inner.disconnect()
  }

  // ─── Encryption Logic ───

  /** Encrypt configured fields in a record before writing. */
  private encryptRecord(
    collection: string,
    record: Record<string, unknown>,
  ): Record<string, unknown> {
    const config = this.configs.get(collection)
    if (!config?.encryptedFields?.length) return record

    const result = { ...record }
    for (const field of config.encryptedFields) {
      if (!(field in result) || result[field] === null || result[field] === undefined) continue

      const key = this.keyResolver(collection, field)
      if (!key) continue

      const plaintext = JSON.stringify(result[field])
      const encrypted = this.crypto.encrypt(
        new TextEncoder().encode(plaintext),
        key.key,
        key.algorithm,
        'field',
        field,
      )

      // Store the encrypted payload as a JSON blob in the field
      result[field] = encrypted
    }

    return result
  }

  /** Decrypt configured fields in a record after reading. */
  private decryptRecord(
    collection: string,
    record: Record<string, unknown>,
  ): Record<string, unknown> {
    const config = this.configs.get(collection)
    if (!config?.encryptedFields?.length) return record

    const result = { ...record }
    for (const field of config.encryptedFields) {
      if (!(field in result) || result[field] === null || result[field] === undefined) continue

      // Check if the value looks like an encrypted payload
      const value = result[field] as Record<string, unknown>
      if (!value || typeof value !== 'object' || !('ciphertext' in value)) continue

      const key = this.keyResolver(collection, field)
      if (!key) continue

      try {
        const decrypted = this.crypto.decrypt(value as unknown as EncryptedPayload, key.key)
        result[field] = JSON.parse(new TextDecoder().decode(decrypted))
      } catch {
        // If decryption fails (wrong key, corrupted data), leave the encrypted blob
        // This is observable — the field will be an EncryptedPayload object instead of plaintext
      }
    }

    return result
  }
}
