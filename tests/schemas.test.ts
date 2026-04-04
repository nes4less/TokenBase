/**
 * Smoke tests — Zod schemas.
 *
 * Verifies that schemas parse valid data and reject invalid types.
 * TODO: Full coverage — test every field constraint, nested types, edge cases.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import {
  ProductCreateSchema,
  ProductUpdateSchema,
} from '../src/schemas/product.schema'

import {
  HandshakeCreateSchema,
} from '../src/schemas/handshake.schema'

import {
  LogEntryCreateSchema,
} from '../src/schemas/log.schema'

import {
  TagCreateSchema,
} from '../src/schemas/tag.schema'

describe('Zod Schemas', () => {
  describe('Product', () => {
    it('parses valid create input', () => {
      const input = {
        title: 'Test Product',
        sku: 'SKU-001',
        taxable: true,
      }
      const result = ProductCreateSchema.safeParse(input)
      assert.equal(result.success, true)
    })

    it('rejects wrong types', () => {
      const result = ProductCreateSchema.safeParse({
        taxable: 'not-a-boolean',
      })
      assert.equal(result.success, false)
    })

    it('parses valid update input (partial)', () => {
      const input = { title: 'Updated Name' }
      const result = ProductUpdateSchema.safeParse(input)
      assert.equal(result.success, true)
    })
  })

  describe('Handshake', () => {
    it('parses valid create input', () => {
      const input = {
        action: 'approve-access',
        parties: ['party-a', 'party-b'],
        status: 'pending',
      }
      const result = HandshakeCreateSchema.safeParse(input)
      assert.equal(result.success, true)
    })

    it('rejects invalid status enum', () => {
      const input = {
        action: 'test',
        parties: ['a'],
        status: 'invalid-status',
      }
      const result = HandshakeCreateSchema.safeParse(input)
      assert.equal(result.success, false)
    })

    it('rejects empty parties array', () => {
      const input = {
        action: 'test',
        parties: [],
      }
      const result = HandshakeCreateSchema.safeParse(input)
      assert.equal(result.success, false)
    })
  })

  describe('LogEntry', () => {
    it('parses valid create input', () => {
      const input = {
        entityId: 'entity-123',
        action: 'create',
        level: 'entity',
      }
      const result = LogEntryCreateSchema.safeParse(input)
      assert.equal(result.success, true)
    })

    it('rejects invalid log level', () => {
      const result = LogEntryCreateSchema.safeParse({
        entityId: 'x',
        level: 'invalid-level',
      })
      assert.equal(result.success, false)
    })
  })

  describe('Tag', () => {
    it('parses valid tag', () => {
      const input = {
        label: 'important',
      }
      const result = TagCreateSchema.safeParse(input)
      assert.equal(result.success, true)
    })
  })
})
