import type { ScopedMCP, MCPToolDefinition, MCPOperation } from './types'

/**
 * Serialize a scoped MCP instance to MCP protocol tool definitions.
 *
 * Each model operation becomes a tool in the format:
 *   name: "model.operation" (e.g., "product.create")
 *   inputSchema: JSON Schema from the scoped model's create/update schema
 *
 * This makes the MCP compatible with AI SDK tool calling, Claude MCP,
 * and any MCP-compatible client.
 */
export function scopedMCPToTools(scoped: ScopedMCP): MCPToolDefinition[] {
  const tools: MCPToolDefinition[] = []

  for (const [modelName, config] of Object.entries(scoped.models)) {
    const lowerName = modelName.charAt(0).toLowerCase() + modelName.slice(1)

    for (const operation of config.operations) {
      tools.push({
        name: `${lowerName}.${operation}`,
        description: describeOperation(modelName, operation, config.collection),
        inputSchema: resolveInputSchema(operation, config),
      })
    }
  }

  return tools
}

/**
 * Generate human-readable descriptions for tool operations.
 */
function describeOperation(modelName: string, operation: MCPOperation, collection: string): string {
  switch (operation) {
    case 'create':
      return `Create a new ${modelName} in ${collection}`
    case 'read':
      return `Read a ${modelName} by ID from ${collection}`
    case 'update':
      return `Update an existing ${modelName} in ${collection}`
    case 'softDelete':
      return `Soft-delete a ${modelName} from ${collection} (sets deletedAt)`
    case 'query':
      return `Query ${collection} with filters, sorting, and pagination`
    case 'subscribe':
      return `Subscribe to real-time changes on ${collection}`
    default:
      return `${operation} on ${modelName}`
  }
}

/**
 * Map operations to appropriate input schemas.
 */
function resolveInputSchema(
  operation: MCPOperation,
  config: { createInputSchema: Record<string, unknown>; updateInputSchema: Record<string, unknown> }
): Record<string, unknown> {
  switch (operation) {
    case 'create':
      return config.createInputSchema

    case 'update':
      return {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'ID of the record to update' },
          data: config.updateInputSchema,
        },
        required: ['id', 'data'],
      }

    case 'read':
      return {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'ID of the record to read' },
        },
        required: ['id'],
      }

    case 'softDelete':
      return {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', description: 'ID of the record to soft-delete' },
        },
        required: ['id'],
      }

    case 'query':
      return {
        type: 'object',
        properties: {
          filters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', description: 'Field to filter on' },
                operator: {
                  type: 'string',
                  enum: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in', 'notIn', 'between', 'exists'],
                  description: 'Filter operator',
                },
                value: { description: 'Value to compare against' },
              },
              required: ['field', 'operator', 'value'],
            },
            description: 'Array of filter conditions',
          },
          sort: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                direction: { type: 'string', enum: ['asc', 'desc'] },
              },
              required: ['field', 'direction'],
            },
            description: 'Sort order',
          },
          pagination: {
            type: 'object',
            properties: {
              limit: { type: 'integer', minimum: 1, maximum: 100 },
              offset: { type: 'integer', minimum: 0 },
              cursor: { type: 'string' },
            },
            description: 'Pagination controls',
          },
        },
      }

    case 'subscribe':
      return {
        type: 'object',
        properties: {
          filters: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                operator: { type: 'string' },
                value: {},
              },
            },
            description: 'Optional filters for the subscription',
          },
        },
      }

    default:
      return { type: 'object' }
  }
}
