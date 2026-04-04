/**
 * Smoke tests — Data service (InMemory adapter, logging, scoping).
 *
 * Verifies CRUD operations, subscriptions, auto-logging, and scope enforcement.
 * TODO: Full coverage — concurrent access, subscription edge cases, error paths.
 */

import { describe, it, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { InMemoryDataService } from '../src/data/memory-adapter'
import { LoggingDataService } from '../src/data/logging-adapter'
import { ScopedDataService } from '../src/data/scoped-adapter'
import type { SubscriptionChange } from '../src/data/types'

describe('InMemoryDataService', () => {
  let ds: InMemoryDataService

  beforeEach(() => {
    ds = new InMemoryDataService()
  })

  it('creates and reads a record', async () => {
    const result = await ds.create('products', { title: 'Widget', sku: 'W001' })
    assert.ok(result.data)

    const record = result.data as Record<string, unknown>
    assert.equal(record.title, 'Widget')
    assert.ok(record.id)
    assert.ok(record.createdAt)

    const read = await ds.read('products', record.id as string)
    assert.ok(read)
    assert.equal((read.data as Record<string, unknown>).title, 'Widget')
  })

  it('updates a record', async () => {
    const created = await ds.create('products', { title: 'Old' })
    const id = (created.data as Record<string, unknown>).id as string

    const updated = await ds.update('products', id, { title: 'New' })
    assert.equal((updated.data as Record<string, unknown>).title, 'New')
  })

  it('soft-deletes a record', async () => {
    const created = await ds.create('products', { title: 'Doomed' })
    const id = (created.data as Record<string, unknown>).id as string

    const deleted = await ds.softDelete('products', id)
    assert.equal(deleted, true)

    // Read should return null for soft-deleted
    const read = await ds.read('products', id)
    assert.equal(read, null)
  })

  it('queries with filters', async () => {
    await ds.create('products', { title: 'A', price: 10 })
    await ds.create('products', { title: 'B', price: 20 })
    await ds.create('products', { title: 'C', price: 30 })

    const result = await ds.query('products', {
      filters: [{ field: 'price', operator: 'gt', value: 15 }],
    })

    assert.equal(result.data.length, 2)
  })

  it('queries with pagination', async () => {
    for (let i = 0; i < 5; i++) {
      await ds.create('products', { title: `P${i}` })
    }

    const page = await ds.query('products', {
      pagination: { limit: 2 },
    })

    assert.equal(page.data.length, 2)
    assert.equal(page.meta.hasMore, true)
    assert.equal(page.meta.total, 5)
  })

  it('fires subscription on create', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    await ds.subscribe('products', (change) => changes.push(change), {
      events: ['insert'],
    })

    await ds.create('products', { title: 'Subscribed' })

    assert.equal(changes.length, 1)
    assert.equal(changes[0].event, 'insert')
    assert.equal((changes[0].record as Record<string, unknown>).title, 'Subscribed')
  })

  it('unsubscribe stops events', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    const sub = await ds.subscribe('products', (change) => changes.push(change))

    await ds.create('products', { title: 'First' })
    assert.equal(changes.length, 1)

    sub.unsubscribe()
    await ds.create('products', { title: 'Second' })
    assert.equal(changes.length, 1) // No new events
  })
})

describe('LoggingDataService', () => {
  let inner: InMemoryDataService
  let ds: LoggingDataService

  beforeEach(() => {
    inner = new InMemoryDataService()
    ds = new LoggingDataService(inner, { actorId: 'test-agent', actorType: 'agent' })
  })

  it('creates log entries on create', async () => {
    await ds.create('products', { title: 'Logged' })

    const logs = await inner.query('logs', {})
    assert.ok(logs.data.length >= 1)
    const log = logs.data[0] as Record<string, unknown>
    assert.equal(log.action, 'create')
    assert.equal(log.entityType, 'products')
    assert.equal(log.actorId, 'test-agent')
  })

  it('creates field-level logs on update', async () => {
    const result = await ds.create('products', { title: 'Before' })
    const id = (result.data as Record<string, unknown>).id as string

    await ds.update('products', id, { title: 'After' })

    const logs = await inner.query('logs', {
      filters: [{ field: 'action', operator: 'eq', value: 'update' }],
    })
    assert.ok(logs.data.length >= 1)

    const fieldLog = logs.data.find(
      (l) => (l as Record<string, unknown>).field === 'title'
    ) as Record<string, unknown>
    assert.ok(fieldLog)
    assert.equal(fieldLog.fromValue, 'Before')
    assert.equal(fieldLog.toValue, 'After')
  })

  it('creates log on soft-delete', async () => {
    const result = await ds.create('products', { title: 'ToDelete' })
    const id = (result.data as Record<string, unknown>).id as string

    await ds.softDelete('products', id)

    const logs = await inner.query('logs', {
      filters: [{ field: 'action', operator: 'eq', value: 'delete' }],
    })
    assert.equal(logs.data.length, 1)
  })

  it('does not log writes to the logs collection', async () => {
    await ds.create('logs', { message: 'meta-log' })

    const logs = await inner.query('logs', {})
    // Should have exactly 1 record (the one we created), not 2 (which would mean it logged itself)
    assert.equal(logs.data.length, 1)
  })
})

describe('ScopedDataService', () => {
  let inner: InMemoryDataService
  let ds: ScopedDataService

  beforeEach(() => {
    inner = new InMemoryDataService()
    ds = new ScopedDataService(inner, { scopeId: 'scope-A' })
  })

  it('tags created records with scopeId', async () => {
    const result = await ds.create('products', { title: 'Scoped' })
    const record = result.data as Record<string, unknown>
    assert.equal(record.scopeId, 'scope-A')
  })

  it('only reads records in its scope', async () => {
    // Create in scope-A via scoped adapter
    const result = await ds.create('products', { title: 'In Scope' })
    const inScopeId = (result.data as Record<string, unknown>).id as string

    // Create in scope-B directly on inner
    const other = await inner.create('products', { title: 'Out of Scope', scopeId: 'scope-B' })
    const outScopeId = (other.data as Record<string, unknown>).id as string

    // Scoped read should find in-scope
    const found = await ds.read('products', inScopeId)
    assert.ok(found)

    // Scoped read should NOT find out-of-scope
    const notFound = await ds.read('products', outScopeId)
    assert.equal(notFound, null)
  })

  it('filters queries to scope', async () => {
    await ds.create('products', { title: 'A-1' })
    await ds.create('products', { title: 'A-2' })
    await inner.create('products', { title: 'B-1', scopeId: 'scope-B' })

    const result = await ds.query('products', {})
    assert.equal(result.data.length, 2)
  })

  it('prevents updating out-of-scope records', async () => {
    const other = await inner.create('products', { title: 'Foreign', scopeId: 'scope-B' })
    const id = (other.data as Record<string, unknown>).id as string

    await assert.rejects(
      () => ds.update('products', id, { title: 'Hacked' }),
      /does not belong to scope/,
    )
  })

  it('prevents deleting out-of-scope records', async () => {
    const other = await inner.create('products', { title: 'Foreign', scopeId: 'scope-B' })
    const id = (other.data as Record<string, unknown>).id as string

    const deleted = await ds.softDelete('products', id)
    assert.equal(deleted, false)
  })
})
