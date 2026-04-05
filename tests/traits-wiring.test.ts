/**
 * Trait wiring tests — Validatable & Interchangeable.
 *
 * Verifies that the Validatable and Interchangeable trait schemas
 * are properly merged into the model schemas that declare them.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { ProductCreateSchema } from '../src/schemas/product.schema'
import { UnitCreateSchema } from '../src/schemas/unit.schema'
import { FinancialTermCreateSchema } from '../src/schemas/financial-term.schema'
import { IdentifierCreateSchema } from '../src/schemas/identifier.schema'

describe('Validatable trait wiring', () => {
  const validatableFields = {
    validity: 'verified' as const,
    confidence: 0.95,
    validFrom: '2024-01-01T00:00:00Z',
    validUntil: '2025-01-01T00:00:00Z',
    verifiedBy: 'system-audit',
  }

  describe('Product', () => {
    it('accepts Validatable fields', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        ...validatableFields,
      })
      assert.equal(result.success, true)
    })

    it('rejects invalid validity enum value', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        validity: 'invalid-status',
      })
      assert.equal(result.success, false)
    })

    it('rejects confidence outside 0-1 range', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        confidence: 1.5,
      })
      assert.equal(result.success, false)
    })

    it('accepts null validity fields', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        validity: null,
        confidence: null,
        validFrom: null,
        validUntil: null,
        verifiedBy: null,
      })
      assert.equal(result.success, true)
    })
  })

  describe('Unit', () => {
    it('accepts Validatable fields', () => {
      const result = UnitCreateSchema.safeParse({
        title: 'Unit A',
        ...validatableFields,
      })
      assert.equal(result.success, true)
    })
  })

  describe('FinancialTerm', () => {
    it('accepts Validatable fields', () => {
      const result = FinancialTermCreateSchema.safeParse({
        term: 'charge',
        value: 100,
        ...validatableFields,
      })
      assert.equal(result.success, true)
    })
  })

  describe('Identifier', () => {
    it('accepts Validatable fields', () => {
      const result = IdentifierCreateSchema.safeParse({
        type: 'barcode',
        value: '123456',
        ...validatableFields,
      })
      assert.equal(result.success, true)
    })
  })

  describe('all validity enum values', () => {
    for (const validity of ['verified', 'unverified', 'disputed', 'expired'] as const) {
      it(`accepts validity="${validity}"`, () => {
        const result = ProductCreateSchema.safeParse({ title: 'Test', validity })
        assert.equal(result.success, true)
      })
    }
  })
})

describe('Interchangeable trait wiring', () => {
  const interchangeableFields = {
    substitutes: [
      {
        entityId: 'prod-456',
        entityType: 'product',
        compatibility: 'full' as const,
        bidirectional: true,
      },
      {
        entityId: 'prod-789',
        entityType: null,
        compatibility: 'partial' as const,
        bidirectional: false,
      },
    ],
  }

  describe('Product', () => {
    it('accepts Interchangeable fields', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget A',
        ...interchangeableFields,
      })
      assert.equal(result.success, true)
    })

    it('rejects invalid compatibility value', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        substitutes: [{
          entityId: 'x',
          compatibility: 'unknown',
          bidirectional: true,
        }],
      })
      assert.equal(result.success, false)
    })

    it('accepts empty substitutes array', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        substitutes: [],
      })
      assert.equal(result.success, true)
    })

    it('requires entityId in substitutes', () => {
      const result = ProductCreateSchema.safeParse({
        title: 'Widget',
        substitutes: [{
          compatibility: 'full',
          bidirectional: true,
        }],
      })
      assert.equal(result.success, false)
    })
  })

  describe('Unit', () => {
    it('accepts Interchangeable fields', () => {
      const result = UnitCreateSchema.safeParse({
        title: 'Unit A',
        ...interchangeableFields,
      })
      assert.equal(result.success, true)
    })
  })

  describe('all compatibility enum values', () => {
    for (const compatibility of ['full', 'partial', 'conditional'] as const) {
      it(`accepts compatibility="${compatibility}"`, () => {
        const result = ProductCreateSchema.safeParse({
          title: 'Test',
          substitutes: [{
            entityId: 'x',
            compatibility,
            bidirectional: false,
          }],
        })
        assert.equal(result.success, true)
      })
    }
  })
})

describe('Combined traits', () => {
  it('Product accepts both Validatable and Interchangeable together', () => {
    const result = ProductCreateSchema.safeParse({
      title: 'Multi-trait Product',
      sku: 'MT-001',
      taxable: true,
      // Validatable
      validity: 'verified',
      confidence: 0.99,
      verifiedBy: 'qa-team',
      // Interchangeable
      substitutes: [{
        entityId: 'alt-product-1',
        entityType: 'product',
        compatibility: 'full',
        bidirectional: true,
      }],
    })
    assert.equal(result.success, true)
  })

  it('Product update schema makes trait fields optional', () => {
    // Import the update schema
    const { ProductUpdateSchema } = require('../src/schemas/product.schema')
    const result = ProductUpdateSchema.safeParse({
      validity: 'disputed',
    })
    assert.equal(result.success, true)
  })
})
