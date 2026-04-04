/**
 * Edge case tests — data service boundaries, null handling, empty collections,
 * filter operators, sort edge cases, full-text search, field selection.
 */

import { describe, it, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { InMemoryDataService } from '../src/data/memory-adapter'
import type { QueryFilter } from '../src/data/types'

describe('InMemoryDataService — Edge Cases', () => {
  let ds: InMemoryDataService

  beforeEach(() => {
    ds = new InMemoryDataService()
  })

  // ─── Read edge cases ───

  describe('read', () => {
    it('returns null for nonexistent id', async () => {
      const result = await ds.read('products', 'nonexistent-id')
      assert.equal(result, null)
    })

    it('returns null for nonexistent collection', async () => {
      const result = await ds.read('ghosts', 'any-id')
      assert.equal(result, null)
    })

    it('returns null for soft-deleted record', async () => {
      const created = await ds.create('products', { title: 'temp' })
      const id = (created.data as Record<string, unknown>).id as string
      await ds.softDelete('products', id)
      const result = await ds.read('products', id)
      assert.equal(result, null)
    })

    it('field selection returns only requested fields + id', async () => {
      const created = await ds.create('products', { title: 'Widget', price: 100, sku: 'W1' })
      const id = (created.data as Record<string, unknown>).id as string
      const result = await ds.read('products', id, { select: ['title'] })
      assert.ok(result)
      const data = result.data as Record<string, unknown>
      assert.equal(data.title, 'Widget')
      assert.equal(data.id, id)
      assert.equal(data.price, undefined) // not selected
    })

    it('field selection with nonexistent field returns only id', async () => {
      const created = await ds.create('products', { title: 'Test' })
      const id = (created.data as Record<string, unknown>).id as string
      const result = await ds.read('products', id, { select: ['nonexistent'] })
      assert.ok(result)
      const data = result.data as Record<string, unknown>
      assert.equal(data.id, id)
      assert.equal(data.nonexistent, undefined)
    })
  })

  // ─── Update edge cases ───

  describe('update', () => {
    it('throws for nonexistent record', async () => {
      await assert.rejects(
        () => ds.update('products', 'ghost', { title: 'x' }),
        /not found/,
      )
    })

    it('throws for soft-deleted record', async () => {
      const created = await ds.create('products', { title: 'temp' })
      const id = (created.data as Record<string, unknown>).id as string
      await ds.softDelete('products', id)
      await assert.rejects(
        () => ds.update('products', id, { title: 'revived' }),
        /soft-deleted/,
      )
    })

    it('preserves id on update (immutable)', async () => {
      const created = await ds.create('products', { title: 'orig' })
      const id = (created.data as Record<string, unknown>).id as string
      const updated = await ds.update('products', id, { id: 'hijacked', title: 'new' } as any)
      assert.equal((updated.data as Record<string, unknown>).id, id)
    })

    it('updates updatedAt timestamp', async () => {
      const created = await ds.create('products', { title: 'orig' })
      const id = (created.data as Record<string, unknown>).id as string
      const origUpdated = (created.data as Record<string, unknown>).updatedAt
      // Small delay to ensure different timestamp
      await new Promise(r => setTimeout(r, 5))
      const updated = await ds.update('products', id, { title: 'new' })
      const newUpdated = (updated.data as Record<string, unknown>).updatedAt
      assert.notEqual(origUpdated, newUpdated)
    })
  })

  // ─── softDelete edge cases ───

  describe('softDelete', () => {
    it('returns false for nonexistent record', async () => {
      assert.equal(await ds.softDelete('products', 'ghost'), false)
    })

    it('returns false for already soft-deleted', async () => {
      const created = await ds.create('products', { title: 'temp' })
      const id = (created.data as Record<string, unknown>).id as string
      assert.equal(await ds.softDelete('products', id), true)
      assert.equal(await ds.softDelete('products', id), false) // second time
    })

    it('returns false for nonexistent collection', async () => {
      assert.equal(await ds.softDelete('ghosts', 'any-id'), false)
    })
  })

  // ─── Query filter operators ───

  describe('query filters', () => {
    beforeEach(async () => {
      await ds.create('items', { name: 'Alpha', price: 10, category: 'A' })
      await ds.create('items', { name: 'Beta', price: 20, category: 'B' })
      await ds.create('items', { name: 'Gamma', price: 30, category: 'A' })
      await ds.create('items', { name: 'Delta', price: 40, category: 'C' })
    })

    it('eq filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'category', operator: 'eq', value: 'A' }] })
      assert.equal(r.data.length, 2)
    })

    it('neq filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'category', operator: 'neq', value: 'A' }] })
      assert.equal(r.data.length, 2)
    })

    it('gt filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'price', operator: 'gt', value: 20 }] })
      assert.equal(r.data.length, 2)
    })

    it('gte filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'price', operator: 'gte', value: 20 }] })
      assert.equal(r.data.length, 3)
    })

    it('lt filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'price', operator: 'lt', value: 20 }] })
      assert.equal(r.data.length, 1)
    })

    it('lte filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'price', operator: 'lte', value: 20 }] })
      assert.equal(r.data.length, 2)
    })

    it('contains filter (case insensitive)', async () => {
      const r = await ds.query('items', { filters: [{ field: 'name', operator: 'contains', value: 'lpha' }] })
      assert.equal(r.data.length, 1)
    })

    it('startsWith filter (case insensitive)', async () => {
      const r = await ds.query('items', { filters: [{ field: 'name', operator: 'startsWith', value: 'del' }] })
      assert.equal(r.data.length, 1)
    })

    it('endsWith filter (case insensitive)', async () => {
      const r = await ds.query('items', { filters: [{ field: 'name', operator: 'endsWith', value: 'ta' }] })
      assert.equal(r.data.length, 2) // Beta, Delta
    })

    it('in filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'category', operator: 'in', value: ['A', 'C'] }] })
      assert.equal(r.data.length, 3)
    })

    it('notIn filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'category', operator: 'notIn', value: ['A', 'C'] }] })
      assert.equal(r.data.length, 1) // only Beta
    })

    it('between filter', async () => {
      const r = await ds.query('items', { filters: [{ field: 'price', operator: 'between', value: [15, 35] }] })
      assert.equal(r.data.length, 2) // Beta(20), Gamma(30)
    })

    it('exists filter (true)', async () => {
      const r = await ds.query('items', { filters: [{ field: 'name', operator: 'exists', value: true }] })
      assert.equal(r.data.length, 4)
    })

    it('exists filter (false) — checks for null/undefined', async () => {
      await ds.create('items', { name: null, price: 50, category: 'D' })
      const r = await ds.query('items', { filters: [{ field: 'name', operator: 'exists', value: false }] })
      assert.equal(r.data.length, 1)
    })

    it('multiple filters combine with AND', async () => {
      const r = await ds.query('items', {
        filters: [
          { field: 'category', operator: 'eq', value: 'A' },
          { field: 'price', operator: 'gt', value: 15 },
        ],
      })
      assert.equal(r.data.length, 1) // only Gamma
    })

    it('unknown operator matches nothing', async () => {
      const r = await ds.query('items', {
        filters: [{ field: 'price', operator: 'magic' as any, value: 10 }],
      })
      assert.equal(r.data.length, 0)
    })
  })

  // ─── Query sorting ───

  describe('query sorting', () => {
    beforeEach(async () => {
      await ds.create('items', { name: 'C', rank: 3 })
      await ds.create('items', { name: 'A', rank: 1 })
      await ds.create('items', { name: 'B', rank: 2 })
    })

    it('sorts ascending', async () => {
      const r = await ds.query('items', { sort: [{ field: 'name', direction: 'asc' }] })
      const names = r.data.map((d: any) => d.name)
      assert.deepEqual(names, ['A', 'B', 'C'])
    })

    it('sorts descending', async () => {
      const r = await ds.query('items', { sort: [{ field: 'rank', direction: 'desc' }] })
      const ranks = r.data.map((d: any) => d.rank)
      assert.deepEqual(ranks, [3, 2, 1])
    })

    it('handles nulls in sort (pushed to end ascending)', async () => {
      await ds.create('items', { name: null, rank: null })
      const r = await ds.query('items', { sort: [{ field: 'rank', direction: 'asc' }] })
      const ranks = r.data.map((d: any) => d.rank)
      assert.equal(ranks[ranks.length - 1], null)
    })
  })

  // ─── Query pagination ───

  describe('query pagination', () => {
    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        await ds.create('items', { idx: i })
      }
    })

    it('respects limit', async () => {
      const r = await ds.query('items', { pagination: { limit: 3 } })
      assert.equal(r.data.length, 3)
      assert.equal(r.meta.total, 10)
      assert.equal(r.meta.hasMore, true)
    })

    it('respects offset', async () => {
      const r = await ds.query('items', { pagination: { limit: 5, offset: 8 } })
      assert.equal(r.data.length, 2)
      assert.equal(r.meta.hasMore, false)
    })

    it('limit larger than total returns all', async () => {
      const r = await ds.query('items', { pagination: { limit: 100 } })
      assert.equal(r.data.length, 10)
      assert.equal(r.meta.hasMore, false)
    })

    it('offset at end returns empty', async () => {
      const r = await ds.query('items', { pagination: { limit: 5, offset: 10 } })
      assert.equal(r.data.length, 0)
      assert.equal(r.meta.hasMore, false)
    })
  })

  // ─── Full-text search ───

  describe('full-text search', () => {
    beforeEach(async () => {
      await ds.create('items', { title: 'Red Widget', description: 'A small red item' })
      await ds.create('items', { title: 'Blue Widget', description: 'A large blue item' })
      await ds.create('items', { title: 'Green Gadget', description: 'An eco gadget' })
    })

    it('searches all string fields by default', async () => {
      const r = await ds.query('items', { fullText: { query: 'widget' } })
      assert.equal(r.data.length, 2)
    })

    it('searches specific fields when specified', async () => {
      const r = await ds.query('items', { fullText: { query: 'red', fields: ['title'] } })
      assert.equal(r.data.length, 1)
    })

    it('is case insensitive', async () => {
      const r = await ds.query('items', { fullText: { query: 'WIDGET' } })
      assert.equal(r.data.length, 2)
    })

    it('returns empty for no matches', async () => {
      const r = await ds.query('items', { fullText: { query: 'purple' } })
      assert.equal(r.data.length, 0)
    })
  })

  // ─── Query field selection ───

  describe('query field selection', () => {
    it('returns only selected fields + id', async () => {
      await ds.create('items', { name: 'Test', price: 100, category: 'A' })
      const r = await ds.query('items', {}, { select: ['name'] })
      const item = r.data[0] as Record<string, unknown>
      assert.equal(item.name, 'Test')
      assert.equal(item.id !== undefined, true)
      assert.equal(item.price, undefined)
    })
  })

  // ─── Query includeSoftDeleted ───

  describe('includeSoftDeleted', () => {
    it('excludes soft-deleted by default', async () => {
      const created = await ds.create('items', { title: 'temp' })
      const id = (created.data as Record<string, unknown>).id as string
      await ds.softDelete('items', id)
      const r = await ds.query('items', {})
      assert.equal(r.data.length, 0)
    })

    it('includes soft-deleted when flag set', async () => {
      const created = await ds.create('items', { title: 'temp' })
      const id = (created.data as Record<string, unknown>).id as string
      await ds.softDelete('items', id)
      const r = await ds.query('items', {}, { includeSoftDeleted: true })
      assert.equal(r.data.length, 1)
    })
  })

  // ─── Create edge cases ───

  describe('create', () => {
    it('auto-generates id, createdAt, updatedAt', async () => {
      const result = await ds.create('items', { name: 'Test' })
      const data = result.data as Record<string, unknown>
      assert.ok(data.id)
      assert.ok(data.createdAt)
      assert.ok(data.updatedAt)
      assert.equal(data.deletedAt, null)
    })

    it('preserves user-provided id', async () => {
      const result = await ds.create('items', { id: 'custom-id', name: 'Test' })
      assert.equal((result.data as Record<string, unknown>).id, 'custom-id')
    })

    it('handles empty data object', async () => {
      const result = await ds.create('items', {})
      const data = result.data as Record<string, unknown>
      assert.ok(data.id)
    })
  })

  // ─── Empty collection queries ───

  describe('empty collections', () => {
    it('query returns empty array with total 0', async () => {
      const r = await ds.query('empty', {})
      assert.deepEqual(r.data, [])
      assert.equal(r.meta.total, 0)
      assert.equal(r.meta.hasMore, false)
    })

    it('query with filters on empty collection returns empty', async () => {
      const r = await ds.query('empty', {
        filters: [{ field: 'x', operator: 'eq', value: 1 }],
      })
      assert.equal(r.data.length, 0)
    })
  })

  // ─── Utility methods ───

  describe('utility methods', () => {
    it('ping returns true', async () => {
      assert.equal(await ds.ping(), true)
    })

    it('disconnect clears all data', async () => {
      await ds.create('items', { name: 'Test' })
      assert.equal(ds.size('items'), 1)
      await ds.disconnect()
      assert.equal(ds.size('items'), 0)
    })

    it('reset clears all data', () => {
      ds.seed('items', [{ id: '1', name: 'A' }, { id: '2', name: 'B' }])
      assert.equal(ds.size('items'), 2)
      ds.reset()
      assert.equal(ds.size('items'), 0)
    })

    it('seed populates collection', async () => {
      ds.seed('items', [
        { id: 'a', name: 'Alpha' },
        { id: 'b', name: 'Beta' },
      ])
      const r = await ds.query('items', {})
      assert.equal(r.data.length, 2)
    })
  })
})
