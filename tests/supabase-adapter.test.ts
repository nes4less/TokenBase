/**
 * Supabase Data Adapter tests.
 *
 * Tests SupabaseDataService against a mock Supabase client.
 * Verifies CRUD operations, query building, filter application,
 * subscriptions, soft-delete, and error handling.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'
import { SupabaseDataService } from '../src/data/supabase-adapter'
import type { SupabaseClient } from '../src/data/supabase-adapter'

// ─── Mock Supabase Client ───

interface MockCall {
  method: string
  args: unknown[]
}

function createMockClient(options?: {
  data?: unknown
  error?: unknown
  onCalls?: (calls: MockCall[]) => void
}): SupabaseClient {
  const { data = null, error = null, onCalls } = options ?? {}
  const calls: MockCall[] = []

  function createBuilder(): any {
    const builder: Record<string, unknown> = {}

    const chainMethods = [
      'select', 'insert', 'update',
      'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
      'like', 'ilike', 'in', 'is', 'not',
      'order', 'range', 'limit', 'single', 'maybeSingle',
      'textSearch',
    ]

    for (const method of chainMethods) {
      builder[method] = (...args: unknown[]) => {
        calls.push({ method, args })
        return builder
      }
    }

    builder.then = (fn: (value: { data: unknown; error: unknown }) => unknown) => {
      onCalls?.(calls)
      return Promise.resolve().then(() => fn({ data, error }))
    }

    return builder
  }

  return {
    from(table: string) {
      calls.push({ method: 'from', args: [table] })
      return createBuilder()
    },
    channel(name: string) {
      const handlers: Array<{ event: string; opts: Record<string, unknown>; callback: Function }> = []
      return {
        on(event: string, opts: Record<string, unknown>, callback: Function) {
          handlers.push({ event, opts, callback })
          return this
        },
        subscribe() { return this },
        unsubscribe() {},
        _handlers: handlers,
      } as any
    },
    removeChannel(_channel: any) {},
  }
}

describe('SupabaseDataService', () => {
  describe('create', () => {
    it('inserts a record with system fields', async () => {
      const mockData = { id: 'abc-123', title: 'Test', created_at: '2024-01-01' }
      let capturedCalls: MockCall[] = []
      const client = createMockClient({
        data: mockData,
        onCalls: (calls) => { capturedCalls = calls },
      })
      const svc = new SupabaseDataService(client)

      const result = await svc.create('products', { title: 'Test' })

      assert.deepEqual(result.data, mockData)
      // Should call: from → insert → select → single → then
      const methods = capturedCalls.map(c => c.method)
      assert.ok(methods.includes('from'))
      assert.ok(methods.includes('insert'))
      assert.ok(methods.includes('select'))
      assert.ok(methods.includes('single'))
    })

    it('generates id and timestamps for new records', async () => {
      let insertedData: Record<string, unknown> = {}
      const client = createMockClient({ data: {} })
      // Capture the insert call
      const origFrom = client.from.bind(client)
      client.from = (table: string) => {
        const builder = origFrom(table)
        const origInsert = builder.insert.bind(builder)
        builder.insert = (data: Record<string, unknown>) => {
          insertedData = data
          return origInsert(data)
        }
        return builder
      }

      const svc = new SupabaseDataService(client)
      await svc.create('products', { title: 'New' })

      assert.ok(insertedData.id, 'should generate an id')
      assert.ok(insertedData.created_at, 'should set created_at')
      assert.ok(insertedData.updated_at, 'should set updated_at')
      assert.equal(insertedData.deleted_at, null, 'deleted_at should be null')
    })
  })

  describe('read', () => {
    it('reads a record by id', async () => {
      const mockData = { id: '123', title: 'Found' }
      const client = createMockClient({ data: mockData })
      const svc = new SupabaseDataService(client)

      const result = await svc.read('products', '123')

      assert.ok(result)
      assert.deepEqual(result.data, mockData)
    })

    it('returns null when record not found', async () => {
      const client = createMockClient({ data: null })
      const svc = new SupabaseDataService(client)

      const result = await svc.read('products', 'nonexistent')

      assert.equal(result, null)
    })

    it('respects select option for column projection', async () => {
      let capturedCalls: MockCall[] = []
      const client = createMockClient({
        data: { id: '1', title: 'T' },
        onCalls: (calls) => { capturedCalls = calls },
      })
      const svc = new SupabaseDataService(client)

      await svc.read('products', '1', { select: ['id', 'title'] })

      const selectCall = capturedCalls.find(c => c.method === 'select')
      assert.ok(selectCall)
      assert.equal(selectCall.args[0], 'id,title')
    })
  })

  describe('update', () => {
    it('updates a record by id', async () => {
      const mockData = { id: '123', title: 'Updated' }
      const client = createMockClient({ data: mockData })
      const svc = new SupabaseDataService(client)

      const result = await svc.update('products', '123', { title: 'Updated' })

      assert.deepEqual(result.data, mockData)
    })

    it('sets updated_at and strips immutable fields', async () => {
      let updatedData: Record<string, unknown> = {}
      const client = createMockClient({ data: {} })
      const origFrom = client.from.bind(client)
      client.from = (table: string) => {
        const builder = origFrom(table)
        const origUpdate = builder.update.bind(builder)
        builder.update = (data: Record<string, unknown>) => {
          updatedData = data
          return origUpdate(data)
        }
        return builder
      }

      const svc = new SupabaseDataService(client)
      await svc.update('products', '123', {
        title: 'New',
        id: 'should-be-stripped',
        created_at: 'should-be-stripped',
      } as any)

      assert.ok(updatedData.updated_at, 'should set updated_at')
      assert.equal(updatedData.id, undefined, 'should strip id')
      assert.equal(updatedData.created_at, undefined, 'should strip created_at')
      assert.equal(updatedData.title, 'New')
    })
  })

  describe('softDelete', () => {
    it('sets deleted_at on the record', async () => {
      const client = createMockClient({ data: { id: '123' } })
      const svc = new SupabaseDataService(client)

      const result = await svc.softDelete('products', '123')

      assert.equal(result, true)
    })

    it('returns false when record does not exist', async () => {
      const client = createMockClient({ error: { message: 'not found' } })
      const svc = new SupabaseDataService(client)

      const result = await svc.softDelete('products', 'nonexistent')

      assert.equal(result, false)
    })
  })

  describe('query', () => {
    it('queries with default options', async () => {
      const mockData = [{ id: '1' }, { id: '2' }]
      const client = createMockClient({ data: mockData })
      const svc = new SupabaseDataService(client)

      const result = await svc.query('products', {})

      assert.equal(result.data.length, 2)
      assert.equal(result.meta.total, 2)
    })

    it('applies filters correctly', async () => {
      let capturedCalls: MockCall[] = []
      const client = createMockClient({
        data: [{ id: '1' }],
        onCalls: (calls) => { capturedCalls = calls },
      })
      const svc = new SupabaseDataService(client)

      await svc.query('products', {
        filters: [
          { field: 'status', operator: 'eq', value: 'active' },
          { field: 'amount', operator: 'gt', value: 100 },
        ],
      })

      const eqCall = capturedCalls.find(c => c.method === 'eq' && c.args[0] === 'status')
      const gtCall = capturedCalls.find(c => c.method === 'gt')
      assert.ok(eqCall, 'should apply eq filter')
      assert.ok(gtCall, 'should apply gt filter')
    })

    it('applies sort ordering', async () => {
      let capturedCalls: MockCall[] = []
      const client = createMockClient({
        data: [],
        onCalls: (calls) => { capturedCalls = calls },
      })
      const svc = new SupabaseDataService(client)

      await svc.query('products', {
        sort: [{ field: 'title', direction: 'asc' }],
      })

      const orderCall = capturedCalls.find(c => c.method === 'order')
      assert.ok(orderCall)
      assert.equal(orderCall.args[0], 'title')
      assert.deepEqual(orderCall.args[1], { ascending: true })
    })

    it('applies pagination via range', async () => {
      let capturedCalls: MockCall[] = []
      const client = createMockClient({
        data: [],
        onCalls: (calls) => { capturedCalls = calls },
      })
      const svc = new SupabaseDataService(client)

      await svc.query('products', {
        pagination: { limit: 10, offset: 20 },
      })

      const rangeCall = capturedCalls.find(c => c.method === 'range')
      assert.ok(rangeCall)
      assert.equal(rangeCall.args[0], 20)  // from
      assert.equal(rangeCall.args[1], 29)  // to (offset + limit - 1)
    })

    it('reports hasMore when results fill the page', async () => {
      const fullPage = Array.from({ length: 10 }, (_, i) => ({ id: String(i) }))
      const client = createMockClient({ data: fullPage })
      const svc = new SupabaseDataService(client)

      const result = await svc.query('products', {
        pagination: { limit: 10 },
      })

      assert.equal(result.meta.hasMore, true)
    })

    it('reports hasMore=false when results are less than limit', async () => {
      const partialPage = [{ id: '1' }, { id: '2' }]
      const client = createMockClient({ data: partialPage })
      const svc = new SupabaseDataService(client)

      const result = await svc.query('products', {
        pagination: { limit: 10 },
      })

      assert.equal(result.meta.hasMore, false)
    })

    it('applies full-text search', async () => {
      let capturedCalls: MockCall[] = []
      const client = createMockClient({
        data: [],
        onCalls: (calls) => { capturedCalls = calls },
      })
      const svc = new SupabaseDataService(client)

      await svc.query('products', {
        fullText: { query: 'widget', fields: ['title'] },
      })

      const ftsCall = capturedCalls.find(c => c.method === 'textSearch')
      assert.ok(ftsCall)
      assert.equal(ftsCall.args[0], 'title')
      assert.equal(ftsCall.args[1], 'widget')
    })

    it('applies all filter operators', async () => {
      const operators = [
        { operator: 'eq', method: 'eq' },
        { operator: 'neq', method: 'neq' },
        { operator: 'gt', method: 'gt' },
        { operator: 'gte', method: 'gte' },
        { operator: 'lt', method: 'lt' },
        { operator: 'lte', method: 'lte' },
        { operator: 'contains', method: 'ilike' },
        { operator: 'startsWith', method: 'ilike' },
        { operator: 'endsWith', method: 'ilike' },
        { operator: 'in', method: 'in' },
      ] as const

      for (const { operator, method } of operators) {
        let capturedCalls: MockCall[] = []
        const client = createMockClient({
          data: [],
          onCalls: (calls) => { capturedCalls = calls },
        })
        const svc = new SupabaseDataService(client)

        const value = operator === 'in' ? ['a', 'b'] : 'test'
        await svc.query('products', {
          filters: [{ field: 'f', operator: operator as any, value }],
        })

        const filterCall = capturedCalls.find(c => c.method === method && c.args[0] === 'f')
        assert.ok(filterCall, `operator '${operator}' should produce '${method}' call`)
      }
    })
  })

  describe('subscribe', () => {
    it('sets up subscription with correct events', async () => {
      const client = createMockClient()
      const svc = new SupabaseDataService(client)

      const changes: unknown[] = []
      const sub = await svc.subscribe('products', (change) => {
        changes.push(change)
      })

      assert.ok(sub.unsubscribe)
    })

    it('can unsubscribe', async () => {
      const client = createMockClient()
      const svc = new SupabaseDataService(client)

      const sub = await svc.subscribe('products', () => {})
      // Should not throw
      sub.unsubscribe()
    })
  })

  describe('ping', () => {
    it('returns true when connection is healthy', async () => {
      const client = createMockClient({ data: [] })
      const svc = new SupabaseDataService(client)

      const result = await svc.ping()
      assert.equal(result, true)
    })

    it('returns true even on query error (connection still works)', async () => {
      const client = createMockClient({ error: { message: 'table not found' } })
      const svc = new SupabaseDataService(client)

      // ping catches errors and returns true (404 means connection works)
      const result = await svc.ping()
      assert.equal(result, true)
    })
  })

  describe('disconnect', () => {
    it('cleans up channels', async () => {
      let removedChannels = 0
      const client = createMockClient()
      client.removeChannel = () => { removedChannels++ }
      const svc = new SupabaseDataService(client)

      await svc.subscribe('products', () => {})
      await svc.subscribe('orders', () => {})
      await svc.disconnect()

      assert.equal(removedChannels, 2)
    })
  })

  describe('static info', () => {
    it('reports adapter metadata', () => {
      assert.equal(SupabaseDataService.info.name, 'supabase')
      assert.equal(SupabaseDataService.info.capabilities.subscribe, true)
      assert.equal(SupabaseDataService.info.capabilities.fullText, true)
      assert.equal(SupabaseDataService.info.capabilities.cursorPagination, false)
    })
  })
})
