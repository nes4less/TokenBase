/**
 * MCP full coverage — all model CRUD through transport, recipe filtering,
 * scope boundaries, field tier resolution, registry lifecycle, bridge
 * update/softDelete/query operations.
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

// ─── Extended fixtures ───

const master: MCPDefinition = {
  version: '1.0',
  models: {
    Product: {
      collection: 'products',
      operations: ['create', 'read', 'update', 'softDelete', 'query', 'subscribe'],
      queryCapabilities: { filters: ['eq', 'contains'], sort: true, pagination: true },
      compositions: ['catalog-screen', 'inventory-check'],
      createSchema: 'ProductCreateSchema',
      updateSchema: 'ProductUpdateSchema',
      fieldAccess: {
        public: ['id', 'title', 'sku'],
        internal: ['catalogId', 'cost'],
        system: ['createdAt', 'updatedAt', 'deletedAt'],
      },
    },
    Order: {
      collection: 'orders',
      operations: ['create', 'read', 'update', 'query'],
      queryCapabilities: { filters: ['eq'], sort: true, pagination: true },
      compositions: ['sales-report'],
      createSchema: 'OrderCreateSchema',
      updateSchema: 'OrderUpdateSchema',
      fieldAccess: {
        public: ['id', 'status'],
        internal: ['total', 'businessId'],
        system: ['createdAt'],
      },
    },
    Reader: {
      collection: 'readers',
      operations: ['create', 'read', 'softDelete'],
      queryCapabilities: { filters: ['eq'], sort: false, pagination: false },
      compositions: [],
      createSchema: 'ReaderCreateSchema',
      updateSchema: 'ReaderUpdateSchema',
      fieldAccess: {
        public: ['id', 'title'],
        internal: ['stripeReaderId'],
        system: ['createdAt'],
      },
    },
  },
  recipes: {
    'catalog-screen': {
      description: 'Product catalog view',
      models: ['Product'],
      steps: [{ model: 'Product', operation: 'query', description: 'List products' }],
    },
    'inventory-check': {
      description: 'Check inventory levels',
      models: ['Product'],
      steps: [{ model: 'Product', operation: 'query', description: 'Query by SKU' }],
    },
    'sales-report': {
      description: 'Generate sales report',
      models: ['Order'],
      steps: [{ model: 'Order', operation: 'query', description: 'Query orders' }],
    },
    'full-audit': {
      description: 'Cross-model audit',
      models: ['Product', 'Order'],
      steps: [
        { model: 'Product', operation: 'query', description: 'List products' },
        { model: 'Order', operation: 'query', description: 'List orders' },
      ],
    },
  },
}

// ─── Scope generation edge cases ───

describe('generateScopedMCP — extended', () => {
  it('excludes recipes when required models are out of scope', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-partial',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Product: { operations: ['read', 'query'], fields: [], maxTier: 'public' },
      },
      recipes: ['full-audit'], // needs both Product AND Order
    }
    const scoped = generateScopedMCP(master, scope)
    assert.equal(scoped.recipes['full-audit'], undefined)
  })

  it('includes recipe when all models are in scope', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-full',
      role: 'human',
      scopeType: 'org',
      scopeId: 'o1',
      models: {
        Product: { operations: ['query'], fields: [], maxTier: 'public' },
        Order: { operations: ['query'], fields: [], maxTier: 'public' },
      },
      recipes: ['full-audit'],
    }
    const scoped = generateScopedMCP(master, scope)
    assert.ok(scoped.recipes['full-audit'])
    assert.equal(scoped.recipes['full-audit'].steps.length, 2)
  })

  it('filters recipe steps to only granted operations', () => {
    // Create a recipe where one step requires create but scope only grants read
    const scope: MCPScope = {
      handshakeId: 'hs-readonly',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Product: { operations: ['read'], fields: [], maxTier: 'public' },
      },
      recipes: ['catalog-screen'], // catalog-screen needs query
    }
    const scoped = generateScopedMCP(master, scope)
    // The recipe step requires 'query' but scope only grants 'read'
    // So the recipe should be excluded (0 valid steps)
    assert.equal(scoped.recipes['catalog-screen'], undefined)
  })

  it('handles scope referencing non-existent model in master', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-ghost',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Ghost: { operations: ['read'], fields: [], maxTier: 'public' },
      },
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope)
    assert.equal(Object.keys(scoped.models).length, 0)
  })

  it('handles scope with no valid operations for a model', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-noop',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        // subscribe is available in master but let's grant an op not in master
        Reader: { operations: ['subscribe' as any], fields: [], maxTier: 'public' },
      },
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope)
    // subscribe isn't in Reader's master ops, so 0 valid ops → model excluded
    assert.equal(scoped.models.Reader, undefined)
  })

  it('field tier: internal includes public + internal', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-int',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Product: { operations: ['read'], fields: [], maxTier: 'internal' },
      },
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope)
    const fields = scoped.models.Product.visibleFields
    // Should include public + internal
    assert.ok(fields.includes('id'))
    assert.ok(fields.includes('title'))
    assert.ok(fields.includes('catalogId'))
    assert.ok(fields.includes('cost'))
    // But NOT system
    assert.ok(!fields.includes('createdAt'))
  })

  it('explicit field list intersects with tier', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-explicit',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Product: { operations: ['read'], fields: ['id', 'title', 'createdAt'], maxTier: 'public' },
      },
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope)
    const fields = scoped.models.Product.visibleFields
    // createdAt is system tier — not visible at public tier
    assert.deepEqual(fields, ['id', 'title'])
  })

  it('passes schema resolver when provided', () => {
    const resolver = (name: string) => ({ type: 'object', name })
    const scope: MCPScope = {
      handshakeId: 'hs-resolver',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Product: { operations: ['create'], fields: [], maxTier: 'public' },
      },
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope, resolver)
    assert.equal((scoped.models.Product.createInputSchema as any).name, 'ProductCreateSchema')
  })
})

// ─── Tool serialization edge cases ───

describe('scopedMCPToTools — extended', () => {
  it('generates one tool per model+operation combination', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-tools',
      role: 'human',
      scopeType: 'org',
      scopeId: 'o1',
      models: {
        Product: { operations: ['create', 'read', 'update', 'softDelete', 'query'], fields: [], maxTier: 'system' },
        Order: { operations: ['create', 'read'], fields: [], maxTier: 'public' },
      },
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope)
    const tools = scopedMCPToTools(scoped)
    assert.equal(tools.length, 7) // 5 Product + 2 Order
  })

  it('produces no tools for empty scoped MCP', () => {
    const scope: MCPScope = {
      handshakeId: 'hs-empty',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {},
      recipes: [],
    }
    const scoped = generateScopedMCP(master, scope)
    const tools = scopedMCPToTools(scoped)
    assert.equal(tools.length, 0)
  })
})

// ─── MCPDataBridge — full CRUD ───

describe('MCPDataBridge — full CRUD', () => {
  let ds: InMemoryDataService
  let bridge: MCPDataBridge

  const adminScope: MCPScope = {
    handshakeId: 'hs-admin',
    role: 'human',
    scopeType: 'org',
    scopeId: 'o1',
    models: {
      Product: { operations: ['create', 'read', 'update', 'softDelete', 'query'], fields: [], maxTier: 'system' },
      Order: { operations: ['create', 'read', 'query'], fields: [], maxTier: 'internal' },
    },
    recipes: ['catalog-screen'],
  }

  beforeEach(() => {
    ds = new InMemoryDataService()
    const scoped = generateScopedMCP(master, adminScope)
    bridge = new MCPDataBridge(ds, scoped)
  })

  it('updates a record through the bridge', async () => {
    const created = await bridge.execute({
      handshakeId: 'hs-admin',
      model: 'Product',
      operation: 'create',
      data: { title: 'Original' },
    })
    const id = (created.data as Record<string, unknown>).id as string

    const updated = await bridge.execute({
      handshakeId: 'hs-admin',
      model: 'Product',
      operation: 'update',
      id,
      data: { title: 'Updated' },
    })
    assert.equal(updated.ok, true)
    assert.equal((updated.data as Record<string, unknown>).title, 'Updated')
  })

  it('soft-deletes through the bridge', async () => {
    const created = await bridge.execute({
      handshakeId: 'hs-admin',
      model: 'Product',
      operation: 'create',
      data: { title: 'Doomed' },
    })
    const id = (created.data as Record<string, unknown>).id as string

    const deleted = await bridge.execute({
      handshakeId: 'hs-admin',
      model: 'Product',
      operation: 'softDelete',
      id,
    })
    assert.equal(deleted.ok, true)

    // Verify it's gone from reads
    const read = await bridge.execute({
      handshakeId: 'hs-admin',
      model: 'Product',
      operation: 'read',
      id,
    })
    assert.equal(read.ok, false)
    assert.equal(read.error?.code, 'NOT_FOUND')
  })

  it('queries through the bridge', async () => {
    await bridge.execute({ handshakeId: 'hs-admin', model: 'Product', operation: 'create', data: { title: 'A' } })
    await bridge.execute({ handshakeId: 'hs-admin', model: 'Product', operation: 'create', data: { title: 'B' } })

    const result = await bridge.execute({
      handshakeId: 'hs-admin',
      model: 'Product',
      operation: 'query',
      query: {},
    })
    assert.equal(result.ok, true)
    const queryResult = result.data as { data: unknown[]; meta: { total: number } }
    assert.equal(queryResult.data.length, 2)
    assert.equal(queryResult.meta.total, 2)
  })

  it('denies update when not in scope', async () => {
    const scoped = generateScopedMCP(master, {
      handshakeId: 'hs-readonly',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {
        Product: { operations: ['read'], fields: [], maxTier: 'public' },
      },
      recipes: [],
    })
    const readonlyBridge = new MCPDataBridge(ds, scoped)

    const result = await readonlyBridge.execute({
      handshakeId: 'hs-readonly',
      model: 'Product',
      operation: 'update',
      id: 'any',
      data: { title: 'Hack' },
    })
    assert.equal(result.ok, false)
    assert.equal(result.error?.code, 'OPERATION_DENIED')
  })
})

// ─── Transport — full operation coverage ───

describe('MCPTransport — extended', () => {
  let registry: MCPRegistry
  let ds: InMemoryDataService
  let transport: MCPTransport

  const adminScope: MCPScope = {
    handshakeId: 'hs-admin',
    role: 'human',
    scopeType: 'org',
    scopeId: 'o1',
    models: {
      Product: { operations: ['create', 'read', 'update', 'softDelete', 'query'], fields: [], maxTier: 'system' },
    },
    recipes: ['catalog-screen'],
  }

  beforeEach(() => {
    registry = new MCPRegistry()
    ds = new InMemoryDataService()
    transport = new MCPTransport(registry, ds)
    registry.register(master, adminScope)
  })

  it('executes update via transport', async () => {
    // Create first
    const createResp = await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-admin',
      body: { model: 'Product', operation: 'create', data: { title: 'Original' } },
    })
    const id = ((createResp.body as any).data as Record<string, unknown>).id

    // Update
    const updateResp = await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-admin',
      body: { model: 'Product', operation: 'update', id, data: { title: 'Updated' } },
    })
    assert.equal(updateResp.status, 200)
    assert.equal(((updateResp.body as any).data as Record<string, unknown>).title, 'Updated')
  })

  it('executes softDelete via transport', async () => {
    const createResp = await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-admin',
      body: { model: 'Product', operation: 'create', data: { title: 'Temp' } },
    })
    const id = ((createResp.body as any).data as Record<string, unknown>).id

    const deleteResp = await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-admin',
      body: { model: 'Product', operation: 'softDelete', id },
    })
    assert.equal(deleteResp.status, 200)
  })

  it('executes query via transport', async () => {
    await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-admin',
      body: { model: 'Product', operation: 'create', data: { title: 'P1' } },
    })

    const queryResp = await transport.handle({
      method: 'POST',
      path: '/execute',
      handshakeId: 'hs-admin',
      body: { model: 'Product', operation: 'query', query: {} },
    })
    assert.equal(queryResp.status, 200)
  })

  it('returns 404 for unknown path', async () => {
    const resp = await transport.handle({
      method: 'GET',
      path: '/unknown',
      handshakeId: 'hs-admin',
    })
    assert.equal(resp.status, 404)
  })

  it('returns recipes in scope metadata', async () => {
    const resp = await transport.handle({
      method: 'GET',
      path: '/scope',
      handshakeId: 'hs-admin',
    })
    assert.equal(resp.status, 200)
    const body = resp.body as any
    assert.ok(body.recipes)
  })
})

// ─── Registry — extended lifecycle ───

describe('MCPRegistry — extended', () => {
  let registry: MCPRegistry

  beforeEach(() => {
    registry = new MCPRegistry()
  })

  it('refresh returns null for nonexistent handshake', () => {
    const refreshed = registry.refresh('nonexistent', master)
    assert.equal(refreshed, null)
  })

  it('registers multiple scopes and lists them', () => {
    const scopes = ['hs-1', 'hs-2', 'hs-3'].map(id => ({
      handshakeId: id,
      role: 'agent' as const,
      scopeType: 'project' as const,
      scopeId: 'p1',
      models: { Product: { operations: ['read' as const], fields: [], maxTier: 'public' as const } },
      recipes: [],
    }))
    for (const scope of scopes) {
      registry.register(master, scope)
    }
    assert.equal(registry.size(), 3)
    assert.deepEqual(registry.activeHandshakes().sort(), ['hs-1', 'hs-2', 'hs-3'])
  })

  it('destroy returns false for already-destroyed', () => {
    registry.register(master, {
      handshakeId: 'hs-once',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: {},
      recipes: [],
    })
    assert.equal(registry.destroy('hs-once'), true)
    assert.equal(registry.destroy('hs-once'), false) // second time
  })

  it('events fire in order: created, refreshed, destroyed', () => {
    const events: string[] = []
    registry.onEvent((event) => events.push(event))

    registry.register(master, {
      handshakeId: 'hs-lifecycle',
      role: 'agent',
      scopeType: 'project',
      scopeId: 'p1',
      models: { Product: { operations: ['read'], fields: [], maxTier: 'public' } },
      recipes: [],
    })
    registry.refresh('hs-lifecycle', master)
    registry.destroy('hs-lifecycle')

    assert.deepEqual(events, ['created', 'refreshed', 'destroyed'])
  })
})
