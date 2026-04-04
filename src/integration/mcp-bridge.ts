/**
 * MCP Data Bridge — routes MCP operations to the data service.
 *
 * This is the central orchestration point:
 * 1. Receive an MCP request (from a scoped instance)
 * 2. Validate against the scoped MCP (authorization check)
 * 3. Validate the payload against Zod schemas (if registered)
 * 4. Delegate to IDataService
 * 5. Return a typed MCPResponse
 *
 * The bridge is stateless — all state lives in the data service,
 * the scoped MCP instance, and the schema registry.
 */

import type { ScopedMCP, MCPOperation, MCPFilterOperator } from '../mcp/types'
import type { IDataService, QueryFilter, QuerySpec } from '../data/types'
import type { MCPRequest, MCPResponse } from './types'
import type { SchemaRegistry } from './schema-registry'

export class MCPDataBridge {
  private dataService: IDataService
  private scopedMCP: ScopedMCP
  private schemas: SchemaRegistry | null

  constructor(
    dataService: IDataService,
    scopedMCP: ScopedMCP,
    schemas?: SchemaRegistry,
  ) {
    this.dataService = dataService
    this.scopedMCP = scopedMCP
    this.schemas = schemas ?? null
  }

  /**
   * Execute an MCP operation.
   *
   * Authorization is checked against the scoped MCP instance.
   * If the operation isn't in the scope, it doesn't exist — structural absence.
   */
  async execute(request: MCPRequest): Promise<MCPResponse> {
    // 1. Authorization: model must exist in scope
    const modelConfig = this.scopedMCP.models[request.model]
    if (!modelConfig) {
      return this.error('MODEL_NOT_FOUND', `Model '${request.model}' is not available in this scope`)
    }

    // 2. Authorization: operation must be granted
    if (!modelConfig.operations.includes(request.operation)) {
      return this.error('OPERATION_DENIED', `Operation '${request.operation}' is not available for '${request.model}'`)
    }

    // 3. Dispatch by operation
    switch (request.operation) {
      case 'create': return this.handleCreate(request, modelConfig.collection)
      case 'read': return this.handleRead(request, modelConfig.collection)
      case 'update': return this.handleUpdate(request, modelConfig.collection)
      case 'softDelete': return this.handleSoftDelete(request, modelConfig.collection)
      case 'query': return this.handleQuery(request, modelConfig.collection)
      case 'subscribe':
        return this.error('SUBSCRIBE_VIA_API', 'Subscriptions must be set up through the subscribe() method, not execute()')
      default:
        return this.error('UNKNOWN_OPERATION', `Unknown operation: ${request.operation}`)
    }
  }

  /**
   * Set up a subscription through the bridge (with authorization check).
   */
  async subscribe(
    model: string,
    callback: (event: { operation: string; data: unknown }) => void,
  ): Promise<{ unsubscribe: () => void } | MCPResponse> {
    const modelConfig = this.scopedMCP.models[model]
    if (!modelConfig) {
      return this.error('MODEL_NOT_FOUND', `Model '${model}' is not available in this scope`)
    }
    if (!modelConfig.operations.includes('subscribe')) {
      return this.error('OPERATION_DENIED', `Subscriptions are not available for '${model}'`)
    }

    const subscription = await this.dataService.subscribe(
      modelConfig.collection,
      (change) => {
        callback({
          operation: change.event,
          data: change.record ?? change.previous,
        })
      },
    )

    return subscription
  }

  // ─── Operation Handlers ───

  private async handleCreate(request: MCPRequest, collection: string): Promise<MCPResponse> {
    if (!request.data) {
      return this.error('MISSING_DATA', 'Create operations require a data payload')
    }

    // Validate against schema if registered
    if (this.schemas?.has(request.model)) {
      const validation = this.schemas.validateCreate(request.model, request.data)
      if (!validation.ok) {
        return this.error('VALIDATION_FAILED', 'Data failed schema validation', validation.errors)
      }
      // Use the validated (cleaned) data
      request.data = validation.data!
    }

    const result = await this.dataService.create(collection, request.data, {
      handshakeId: request.handshakeId,
    })

    return this.ok(result.data)
  }

  private async handleRead(request: MCPRequest, collection: string): Promise<MCPResponse> {
    if (!request.id) {
      return this.error('MISSING_ID', 'Read operations require a record ID')
    }

    // Use visible fields from scope for field-level access control
    const modelConfig = this.scopedMCP.models[request.model]
    const select = modelConfig?.visibleFields.length
      ? modelConfig.visibleFields
      : undefined

    const result = await this.dataService.read(collection, request.id, {
      handshakeId: request.handshakeId,
      select,
    })

    if (!result) {
      return this.error('NOT_FOUND', `Record not found: ${request.id}`)
    }

    return this.ok(result.data)
  }

  private async handleUpdate(request: MCPRequest, collection: string): Promise<MCPResponse> {
    if (!request.id) {
      return this.error('MISSING_ID', 'Update operations require a record ID')
    }
    if (!request.data) {
      return this.error('MISSING_DATA', 'Update operations require a data payload')
    }

    // Filter data to only visible fields (can't update fields you can't see)
    const modelConfig = this.scopedMCP.models[request.model]
    if (modelConfig?.visibleFields.length) {
      const allowed = new Set(modelConfig.visibleFields)
      const filtered: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(request.data)) {
        if (allowed.has(key)) filtered[key] = value
      }
      request.data = filtered
    }

    // Validate against schema if registered
    if (this.schemas?.has(request.model)) {
      const validation = this.schemas.validateUpdate(request.model, request.data)
      if (!validation.ok) {
        return this.error('VALIDATION_FAILED', 'Data failed schema validation', validation.errors)
      }
      request.data = validation.data!
    }

    const result = await this.dataService.update(collection, request.id, request.data, {
      handshakeId: request.handshakeId,
    })

    return this.ok(result.data)
  }

  private async handleSoftDelete(request: MCPRequest, collection: string): Promise<MCPResponse> {
    if (!request.id) {
      return this.error('MISSING_ID', 'SoftDelete operations require a record ID')
    }

    const deleted = await this.dataService.softDelete(collection, request.id, {
      handshakeId: request.handshakeId,
    })

    if (!deleted) {
      return this.error('NOT_FOUND', `Record not found or already deleted: ${request.id}`)
    }

    return this.ok({ deleted: true, id: request.id })
  }

  private async handleQuery(request: MCPRequest, collection: string): Promise<MCPResponse> {
    const spec: QuerySpec = {}

    if (request.query?.filters) {
      spec.filters = request.query.filters.map(f => ({
        field: f.field,
        operator: f.operator as MCPFilterOperator,
        value: f.value,
      }))
    }

    if (request.query?.sort) {
      spec.sort = request.query.sort
    }

    if (request.query?.pagination) {
      spec.pagination = request.query.pagination
    }

    if (request.query?.fullText) {
      spec.fullText = request.query.fullText
    }

    // Use visible fields from scope
    const modelConfig = this.scopedMCP.models[request.model]
    const select = modelConfig?.visibleFields.length
      ? modelConfig.visibleFields
      : undefined

    const result = await this.dataService.query(collection, spec, {
      handshakeId: request.handshakeId,
      select,
    })

    return this.ok(result)
  }

  // ─── Response Builders ───

  private ok(data: unknown): MCPResponse {
    return { ok: true, data }
  }

  private error(code: string, message: string, details?: unknown): MCPResponse {
    return { ok: false, error: { code, message, details } }
  }
}
