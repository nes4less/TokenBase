/**
 * MCP Transport — HTTP request/response handler for MCP operations.
 *
 * Framework-agnostic: accepts and returns plain objects. The consumer
 * wraps this in their HTTP framework (Express, Next.js route handler,
 * Hono, etc.).
 *
 * Request flow:
 * 1. Extract handshakeId from request (header or body)
 * 2. Look up the scoped MCP in the registry
 * 3. Create an MCPDataBridge for this scope
 * 4. Dispatch the operation
 * 5. Return the MCPResponse
 *
 * This layer adds:
 * - Tool listing (GET /tools → MCPToolDefinition[])
 * - Request parsing and validation
 * - Error wrapping for transport-level failures
 */

import type { MCPRequest, MCPResponse } from '../integration/types'
import type { IDataService } from '../data/types'
import type { ScopedMCP, MCPToolDefinition, MCPOperation } from './types'
import type { SchemaRegistry } from '../integration/schema-registry'
import type { MCPRegistry, PersistentMCPRegistry } from './registry'
import { MCPDataBridge } from '../integration/mcp-bridge'
import { scopedMCPToTools } from './serialize'

// ─── Request Types ───

/** An incoming HTTP request shape (framework-agnostic). */
export interface TransportRequest {
  /** HTTP method. */
  method: 'GET' | 'POST' | 'DELETE'
  /** The path after the MCP base URL (e.g., '/tools', '/execute'). */
  path: string
  /** The Handshake ID — from Authorization header, query param, or body. */
  handshakeId: string
  /** The request body (parsed JSON). */
  body?: Record<string, unknown>
}

/** An outgoing HTTP response shape (framework-agnostic). */
export interface TransportResponse {
  status: number
  body: unknown
  headers?: Record<string, string>
}

// ─── Transport ───

export class MCPTransport {
  private registry: MCPRegistry | PersistentMCPRegistry
  private dataService: IDataService
  private schemas: SchemaRegistry | null

  constructor(
    registry: MCPRegistry | PersistentMCPRegistry,
    dataService: IDataService,
    schemas?: SchemaRegistry,
  ) {
    this.registry = registry
    this.dataService = dataService
    this.schemas = schemas ?? null
  }

  /**
   * Handle an incoming MCP request.
   *
   * Routes:
   * - GET  /tools   → list available tools for this scope
   * - POST /execute → execute an MCP operation
   * - GET  /scope   → return the scope metadata (no data, just capabilities)
   */
  async handle(req: TransportRequest): Promise<TransportResponse> {
    try {
      // Resolve the scoped MCP
      const scoped = await this.resolveScope(req.handshakeId)
      if (!scoped) {
        return this.errorResponse(401, 'SCOPE_NOT_FOUND', 'No active MCP for this Handshake')
      }

      switch (req.path) {
        case '/tools':
          return this.handleListTools(scoped)
        case '/execute':
          return this.handleExecute(scoped, req)
        case '/scope':
          return this.handleGetScope(scoped)
        default:
          return this.errorResponse(404, 'NOT_FOUND', `Unknown path: ${req.path}`)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal server error'
      return this.errorResponse(500, 'INTERNAL_ERROR', message)
    }
  }

  // ─── Route Handlers ───

  private handleListTools(scoped: ScopedMCP): TransportResponse {
    const tools = scopedMCPToTools(scoped)
    return {
      status: 200,
      body: { tools },
      headers: { 'content-type': 'application/json' },
    }
  }

  private async handleExecute(scoped: ScopedMCP, req: TransportRequest): Promise<TransportResponse> {
    if (req.method !== 'POST') {
      return this.errorResponse(405, 'METHOD_NOT_ALLOWED', 'Execute requires POST')
    }

    const body = req.body
    if (!body) {
      return this.errorResponse(400, 'MISSING_BODY', 'Execute requires a request body')
    }

    // Parse the MCP request from the body
    const mcpRequest = this.parseRequest(body, req.handshakeId)
    if (!mcpRequest) {
      return this.errorResponse(400, 'INVALID_REQUEST', 'Missing required fields: model, operation')
    }

    // Create a bridge and execute
    const bridge = new MCPDataBridge(this.dataService, scoped, this.schemas ?? undefined)
    const result = await bridge.execute(mcpRequest)

    return {
      status: result.ok ? 200 : 400,
      body: result,
      headers: { 'content-type': 'application/json' },
    }
  }

  private handleGetScope(scoped: ScopedMCP): TransportResponse {
    // Return scope metadata without any data — just capabilities
    return {
      status: 200,
      body: {
        handshakeId: scoped.handshakeId,
        generatedAt: scoped.generatedAt,
        models: Object.entries(scoped.models).map(([name, config]) => ({
          name,
          collection: config.collection,
          operations: config.operations,
          fieldCount: config.visibleFields.length,
        })),
        recipes: Object.keys(scoped.recipes),
      },
      headers: { 'content-type': 'application/json' },
    }
  }

  // ─── Internal ───

  private async resolveScope(handshakeId: string): Promise<ScopedMCP | undefined> {
    if ('get' in this.registry && typeof this.registry.get === 'function') {
      const result = this.registry.get(handshakeId)
      // Handle both sync (MCPRegistry) and async (PersistentMCPRegistry)
      return result instanceof Promise ? await result : result
    }
    return undefined
  }

  private parseRequest(body: Record<string, unknown>, handshakeId: string): MCPRequest | null {
    const model = body.model as string
    const operation = body.operation as string

    if (!model || !operation) return null

    return {
      handshakeId,
      model,
      operation: operation as MCPOperation,
      id: body.id as string | undefined,
      data: body.data as Record<string, unknown> | undefined,
      query: body.query as MCPRequest['query'],
    }
  }

  private errorResponse(status: number, code: string, message: string): TransportResponse {
    return {
      status,
      body: { ok: false, error: { code, message } },
      headers: { 'content-type': 'application/json' },
    }
  }
}
