/**
 * Smoke tests — MCP generation, registry, bridge, and transport.
 *
 * Verifies scoped MCP generation, tool serialization, registry lifecycle,
 * bridge authorization, and transport routing.
 * TODO: Full coverage — all model operations, recipe filtering, persistent registry.
 */

import { describe, it, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { generateScopedMCP } from '../src/mcp/generate'
import { scopedMCPToTools } from '../src/mcp/serialize'
import { MCPRegistry } from '../src/mcp/registry'
import { MCPTransport } from '../src/mcp/transport'
import { MCPDataBridge } from '../src/integration/mcp-bridge'
import { InMemoryDataService } from '../src/data/memory-adapter'
import type { MCPDefinition, MCPScope } from '../src/mcp/types'

// ─── Fixtures ───

const testMaster: MCPDefinition = {
  version: '1.0',
  models: {
    Product: {
      collection: 'products',
      operations: ['create', 'read', 'update', 'softDelete', 'query', 'subscribe'],
      queryCapabilities: { filters: ['eq', 'contains'], sort: true, pagination: true },
      compositions: ['catalog-screen'],
      createSchema: 'ProductCreateSchema',
      updateSchema: 'ProductUpdateSchema',
      fieldAccess: {
        public: ['id', 'title', 'sku'],
        internal: ['catalogId'],
        system: ['createdAt', 'updatedAt', 'deletedAt'],
      },
    },
    Order: {
      collection: 'orders',
      operations: ['create', 'read', 'query'],
      queryCapabilities: { filters: ['eq'], sort: true, pagination: true },
      compositions: [],
      createSchema: 'OrderCreateSchema',
      updateSchema: 'OrderUpdateSchema',
      fieldAccess: {
        public: ['id', 'status'],
        internal: ['total'],
        system: ['createdAt'],
      },
    },
  },
  recipes: {
    'catalog-screen': {
      description: 'Build a product catalog view',
      models: ['Product'],
      steps: [
        { model: 'Product', operation: 'query', description: 'List products' },
      ],
    },
  },
}

const publicScope: MCPScope = {
  handshakeId: 'hs-001',
  role: 'agent',
  scopeType: 'project',
  scopeId: 'proj-123',
  models: {
    Product: { operations: ['read', 'query'], fields: [], maxTier: 'public' },
  },
  recipes: ['catalog-screen'],
}

const adminScope: MCPScope = {
  handshakeId: 'hs-002',
  role: 'human',
  scopeType: 'org',
  scopeId: 'org-456',
  models: {
    Product: { operations: ['create', 'read', 'update', 'softDelete', 'query'], fields: [], maxTier: 'system' },
    Order: { operations: ['create', 'read', 'query'], fields: [], maxTier: 'internal' },
  },
  recipes: ['catalog-screen'],
}

// ─── Tests ───

describe('generateScopedMCP', () => {
  it('generates a scoped instance with only granted models', () => {
    const scoped = generateScopedMCP(testMaster, publicScope)
    assert.ok(scoped.models.Product)
    assert.equal(scoped.models.Order, undefined) // Not in scope
  })

  it('filters operations to only those granted', () => {
    const scoped = generateScopedMCP(testMaster, publicScope)
    assert.deepEqual(scoped.models.Product.operations, ['read', 'query'])
  })

  it('resolves visible fields by tier', () => {
    const scoped = generateScopedMCP(testMaster, publicScope)
    // Public tier = only public fields
    assert.deepEqual(scoped.models.Product.visibleFields, ['id', 'title', 'sku'])
  })

  it('includes higher tiers when granted', () => {
    const scoped = generateScopedMCP(testMaster, adminScope)
    const fields = scoped.models.Product.visibleFields
    // System tier = all fields
    assert.ok(fields.includes('id'))
    assert.ok(fields.includes('catalogId'))
    assert.ok(fields.includes('createdAt'))
  })

  it('filters recipes to only those with in-scope models', () => {
    const scoped = generateScopedMCP(testMaster, publicScope)
    assert.ok(scoped.recipes['catalog-screen'])
  })
})

describe('scopedMCPToTools', () => {
  it('generates tool definitions from scoped MCP', () => {
    const scoped = generateScopedMCP(testMaster, adminScope)
    const tools = scopedMCPToTools(scoped)

    assert.ok(tools.length > 0)

    const names = tools.map(t => t.name)
    assert.ok(names.includes('product.create'))
    assert.ok(names.includes('product.read'))
    assert.ok(names.includes('order.create'))
  })

  it('tool names follow model.operation format', () => {
    const scoped = generateScopedMCP(testMaster, publicScope)
    const tools = scopedMCPToTools(scoped)

    for (const tool of tools) {
      assert.match(tool.name, /^[a-z].*\.(create|read|update|softDelete|query|subscribe)$/)
    }
  })
})

describe('MCPRegistry', () => {
  let registry: MCPRegistry

  beforeEach(() => {
    registry = new MCPRegistry()
  })

  it('registers and retrieves a scoped MCP', () => {
    const scoped = registry.register(testMaster, publicScope)
    assert.ok(scoped)
    assert.equal(scoped.handshakeId, 'hs-001')

    const retrieved = registry.get('hs-001')
    assert.deepEqual(retrieved, scoped)
  })

  it('destroys a scoped MCP', () => {
    registry.register(testMaster, publicScope)
    assert.equal(registry.has('hs-001'), true)

    const destroyed = registry.destroy('hs-001')
    assert.equal(destroyed, true)
    assert.equal(registry.has('hs-001'), false)
    assert.equal(registry.get('hs-001'), undefined)
  })

  it('returns false when destroying nonexistent', () => {
    assert.equal(registry.destroy('nonexistent'), false)
  })

  it('refreshes a scoped MCP', () => {
    const original = registry.register(testMaster, publicScope)
    const refreshed = registry.refresh('hs-001', testMaster)
    assert.ok(refreshed)
    // After refresh, the registry should hold the refreshed instance
    const current = registry.get('hs-001')
    assert.equal(current, refreshed)
    // The refreshed instance should have the same scope
    assert.equal(refreshed!.scope.handshakeId, original.scope.handshakeId)
  })

  it('emits events', () => {
    const events: string[] = []
    registry.onEvent((event) => events.push(event))

    registry.register(testMaster, publicScope)
    registry.destroy('hs-001')

    assert.deepEqual(events, ['created', 'destroyed'])
  })

  it('tracks active handshakes', () => {
    registry.register(testMaster, publicScope)
    registry.register(testMaster, adminScope)

    assert.equal(registry.size(), 2)
    assert.deepEqual(registry.activeHandshakes().sort(), ['hs-001', 'hs-002'])
  })
})

describe('MCPDataBridge', () => {
  let ds: InMemoryDataService
  let bridge: MCPDataBridge

  beforeEach(() => {
    ds = new InMemoryDataService()
    const scoped = generateScopedMCP(testMaster, adminScope)
    bridge = new MCPDataBridge(ds, scoped)
  })

  it('creates a record through the bridge', async () => {
    const result = await bridge.execute({
      handshakeId: 'hs-002',
      model: 'Product',
      operation: 'create',
      data: { title: 'Bridged Product' },
    })

    assert.equal(result.ok, true)
    assert.ok(result.data)
  })

  it('reads a record through the bridge', async () => {
    const created = await bridge.execute({
      handshakeId: 'hs-002',
      model: 'Product',
      operation: 'create',
      data: { title: 'Readable' },
    })

    const record = created.data as Record<string, unknown>
    const read = await bridge.execute({
      handshakeId: 'hs-002',
      model: 'Product',
      operation: 'read',
      id: record.id as string,
    })

    assert.equal(read.ok, true)
  })

  it('denies operations on out-of-scope models', async () => {
    // publicScope only has Product with read/query
    const scoped = generateScopedMCP(testMaster, publicScope)
    const restrictedBridge = new MCPDataBridge(ds, scoped)

    const result = await restrictedBridge.execute({
      handshakeId: 'hs-001',
      model: 'Order',
      operation: 'create',
      data: {},
    })

    assert.equal(result.ok, false)
    assert.equal(result.error?.code, 'MODEL_NOT_FOUND')
  })

  it('denies operations not in scope', async () => {
    const scoped = generateScopedMCP(testMaster, publicScope)
    const restrictedBridge = new MCPDataBridge(ds, scoped)

    const result = await restrictedBridge.execute({
      handshakeId: 'hs-001',
      model: 'Product',
      operation: 'create',
      data: { title: 'Sneaky' },
    })

    assert.equal(result.ok, false)
    assert.equal(result.error?.code, 'OPERATION_DENIED')
  })
})

describe('MCPTransport', () => {
  let registry: MCPRegistry
  let ds: InMemoryDataService
  let transport: MCPTransport

  beforeEach(() => {
    registry = new MCPRegistry()
    ds = new InMemoryDataService()
    transport = new MCPTransport(registry, ds)

    registry.register(testMaster, adminScope)
  })

  it('lists tools for a scope', async () => {
    const response = await transport.handle({
      method: 'GET',
      path: '/tools',
      handshakeId: 'hs-002',
    })

    assert.equal(response.status, 200)
    const body = response.body as { tools: unknown[] }
    assert.ok(body.tools.length > 0)
  })

  it('executes an operation', async () => {
    const response = await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-002',
      body: {
        model: 'Product',
        operation: 'create',
        data: { title: 'Transport Created' },
      },
    })

    assert.equal(response.status, 200)
    const body = response.body as { ok: boolean }
    assert.equal(body.ok, true)
  })

  it('returns 401 for unknown handshake', async () => {
    const response = await transport.handle({
      method: 'GET',
      path: '/tools',
      handshakeId: 'nonexistent',
    })

    assert.equal(response.status, 401)
  })

  it('returns scope metadata', async () => {
    const response = await transport.handle({
      method: 'GET',
      path: '/scope',
      handshakeId: 'hs-002',
    })

    assert.equal(response.status, 200)
    const body = response.body as { handshakeId: string; models: unknown[] }
    assert.equal(body.handshakeId, 'hs-002')
    assert.ok(body.models.length > 0)
  })
})
