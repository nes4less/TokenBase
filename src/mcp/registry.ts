/**
 * MCP Registry — stores and manages scoped MCP instances.
 *
 * One MCP per Handshake. The registry is a key-value store keyed by
 * Handshake ID. When a Handshake breaks, the MCP is deleted. There's
 * nothing to "hack" because the artifact no longer exists.
 *
 * Two implementations:
 * - In-memory (default, for development/testing)
 * - Persistent (via IDataService, for production)
 *
 * The registry is the single authority on what scoped MCPs exist.
 */

import type { ScopedMCP, MCPScope, MCPDefinition } from './types'
import type { IDataService } from '../data/types'
import { generateScopedMCP } from './generate'

/** Events emitted by the registry. */
export type RegistryEvent = 'created' | 'destroyed' | 'refreshed'

export interface RegistryListener {
  (event: RegistryEvent, handshakeId: string, mcp?: ScopedMCP): void
}

// ─── In-Memory Registry ───

export class MCPRegistry {
  private instances = new Map<string, ScopedMCP>()
  private listeners: RegistryListener[] = []

  /**
   * Generate and store a scoped MCP instance for a Handshake.
   *
   * If an instance already exists for this handshakeId, it's replaced.
   */
  register(
    master: MCPDefinition,
    scope: MCPScope,
    schemaResolver?: (schemaName: string) => Record<string, unknown>,
  ): ScopedMCP {
    const scoped = generateScopedMCP(master, scope, schemaResolver)
    this.instances.set(scope.handshakeId, scoped)
    this.emit('created', scope.handshakeId, scoped)
    return scoped
  }

  /**
   * Store a pre-generated scoped MCP instance.
   */
  put(handshakeId: string, scoped: ScopedMCP): void {
    this.instances.set(handshakeId, scoped)
    this.emit('created', handshakeId, scoped)
  }

  /**
   * Retrieve the scoped MCP for a Handshake.
   * Returns undefined if the Handshake has no MCP (destroyed or never created).
   */
  get(handshakeId: string): ScopedMCP | undefined {
    return this.instances.get(handshakeId)
  }

  /**
   * Check if a Handshake has an active MCP.
   */
  has(handshakeId: string): boolean {
    return this.instances.has(handshakeId)
  }

  /**
   * Destroy the scoped MCP for a Handshake.
   *
   * Called when a Handshake breaks. The MCP is gone — nothing to hack.
   * Returns true if an MCP was found and destroyed, false if it didn't exist.
   */
  destroy(handshakeId: string): boolean {
    const existed = this.instances.delete(handshakeId)
    if (existed) {
      this.emit('destroyed', handshakeId)
    }
    return existed
  }

  /**
   * Regenerate a scoped MCP from the same scope but against a new master.
   * Used when the master definition changes (new models, new recipes).
   */
  refresh(
    handshakeId: string,
    master: MCPDefinition,
    schemaResolver?: (schemaName: string) => Record<string, unknown>,
  ): ScopedMCP | null {
    const existing = this.instances.get(handshakeId)
    if (!existing) return null

    const refreshed = generateScopedMCP(master, existing.scope, schemaResolver)
    this.instances.set(handshakeId, refreshed)
    this.emit('refreshed', handshakeId, refreshed)
    return refreshed
  }

  /**
   * List all active Handshake IDs in the registry.
   */
  activeHandshakes(): string[] {
    return Array.from(this.instances.keys())
  }

  /**
   * How many scoped MCPs are currently active.
   */
  size(): number {
    return this.instances.size
  }

  /**
   * Subscribe to registry events (created, destroyed, refreshed).
   */
  onEvent(listener: RegistryListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Clear all instances. Useful for testing.
   */
  clear(): void {
    const ids = Array.from(this.instances.keys())
    this.instances.clear()
    for (const id of ids) {
      this.emit('destroyed', id)
    }
  }

  private emit(event: RegistryEvent, handshakeId: string, mcp?: ScopedMCP): void {
    for (const listener of this.listeners) {
      listener(event, handshakeId, mcp)
    }
  }
}

// ─── Persistent Registry ───

/**
 * Persistent MCP Registry — backed by IDataService.
 *
 * Stores scoped MCPs as serialized JSON in a collection, so they
 * survive process restarts. Falls back to in-memory cache for reads.
 */
export class PersistentMCPRegistry {
  private cache = new Map<string, ScopedMCP>()
  private dataService: IDataService
  private collection: string
  private listeners: RegistryListener[] = []

  constructor(dataService: IDataService, collection: string = 'mcp_instances') {
    this.dataService = dataService
    this.collection = collection
  }

  async register(
    master: MCPDefinition,
    scope: MCPScope,
    schemaResolver?: (schemaName: string) => Record<string, unknown>,
  ): Promise<ScopedMCP> {
    const scoped = generateScopedMCP(master, scope, schemaResolver)

    // Upsert: try to find existing, then create or update
    const existing = await this.dataService.query(this.collection, {
      filters: [{ field: 'handshakeId', operator: 'eq', value: scope.handshakeId }],
      pagination: { limit: 1 },
    })

    if (existing.data.length) {
      const record = existing.data[0] as Record<string, unknown>
      await this.dataService.update(this.collection, record.id as string, {
        handshakeId: scope.handshakeId,
        payload: JSON.stringify(scoped),
      })
    } else {
      await this.dataService.create(this.collection, {
        handshakeId: scope.handshakeId,
        payload: JSON.stringify(scoped),
      })
    }

    this.cache.set(scope.handshakeId, scoped)
    this.emit('created', scope.handshakeId, scoped)
    return scoped
  }

  async get(handshakeId: string): Promise<ScopedMCP | undefined> {
    // Check cache first
    const cached = this.cache.get(handshakeId)
    if (cached) return cached

    // Fall back to data service
    const result = await this.dataService.query(this.collection, {
      filters: [{ field: 'handshakeId', operator: 'eq', value: handshakeId }],
      pagination: { limit: 1 },
    })

    if (!result.data.length) return undefined

    const record = result.data[0] as Record<string, unknown>
    const scoped = JSON.parse(record.payload as string) as ScopedMCP
    this.cache.set(handshakeId, scoped)
    return scoped
  }

  async destroy(handshakeId: string): Promise<boolean> {
    this.cache.delete(handshakeId)

    const result = await this.dataService.query(this.collection, {
      filters: [{ field: 'handshakeId', operator: 'eq', value: handshakeId }],
      pagination: { limit: 1 },
    })

    if (!result.data.length) return false

    const record = result.data[0] as Record<string, unknown>
    await this.dataService.softDelete(this.collection, record.id as string)
    this.emit('destroyed', handshakeId)
    return true
  }

  onEvent(listener: RegistryListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private emit(event: RegistryEvent, handshakeId: string, mcp?: ScopedMCP): void {
    for (const listener of this.listeners) {
      listener(event, handshakeId, mcp)
    }
  }
}
