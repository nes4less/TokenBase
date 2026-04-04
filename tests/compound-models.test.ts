/**
 * Compound model tests — Business, Container, Order, Product, Reader, Till, Timecard, Unit.
 *
 * Covers construction defaults, data passthrough, nested model instantiation,
 * derived getters (Order calculations, Till balance, Timecard effective times),
 * and edge cases.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { Business } from '../src/compound/Business'
import { Container, ContainerStatus } from '../src/compound/Container'
import { Order, OrderItem, OrderDiscount, OrderTax, OrderPayment } from '../src/compound/Order'
import { Product } from '../src/compound/Product'
import { Reader } from '../src/compound/Reader'
import { Till, TillCorrection } from '../src/compound/Till'
import { Timecard } from '../src/compound/Timecard'
import { Unit, UnitStatus } from '../src/compound/Unit'

// ─── Business ───

describe('Business', () => {
  it('constructs with defaults', () => {
    const b = new Business()
    assert.ok(b.id.length > 0)
    assert.ok(b.createdAt.length > 0)
    assert.equal(b.title, null)
    assert.equal(b.email, null)
    assert.equal(b.phone, null)
    assert.equal(b.stripeAccountId, null)
    assert.equal(b.taxAmount, 0)
    assert.equal(b.taxPercent, 0)
    assert.deepEqual(b.images, [])
    assert.deepEqual(b.metadata, [])
    assert.equal(b.deletedAt, null)
  })

  it('accepts all fields via constructor', () => {
    const b = new Business({
      title: 'Test Shop',
      email: 'shop@test.com',
      phone: '555-1234',
      address1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      taxAmount: 1.5,
      taxPercent: 0.0825,
      stripeAccountId: 'acct_123',
    })
    assert.equal(b.title, 'Test Shop')
    assert.equal(b.email, 'shop@test.com')
    assert.equal(b.taxAmount, 1.5)
    assert.equal(b.taxPercent, 0.0825)
    assert.equal(b.stripeAccountId, 'acct_123')
    assert.equal(b.city, 'Austin')
  })

  it('has static collection name', () => {
    assert.equal(Business.collection, 'businesses')
  })

  it('instantiates nested Image objects', () => {
    const b = new Business({
      images: [{ value: 'https://img.test/1.png' } as any],
    })
    assert.equal(b.images.length, 1)
    assert.equal(b.images[0].value, 'https://img.test/1.png')
  })
})

// ─── Container ───

describe('Container', () => {
  it('constructs with defaults', () => {
    const c = new Container()
    assert.ok(c.id)
    assert.equal(c.title, null)
    assert.deepEqual(c.statuses, [])
    assert.equal(Container.collection, 'containers')
  })

  it('instantiates nested ContainerStatus objects', () => {
    const c = new Container({
      statuses: [{ value: 'active' }, { value: 'vacancy' }],
    })
    assert.equal(c.statuses.length, 2)
    assert.ok(c.statuses[0] instanceof ContainerStatus)
    assert.equal(c.statuses[0].value, 'active')
    assert.equal(c.statuses[1].value, 'vacancy')
  })
})

describe('ContainerStatus', () => {
  it('defaults to pending', () => {
    const s = new ContainerStatus()
    assert.equal(s.value, 'pending')
    assert.ok(s.id)
    assert.ok(s.createdAt)
  })
})

// ─── Product ───

describe('Product', () => {
  it('constructs with defaults', () => {
    const p = new Product()
    assert.ok(p.id)
    assert.equal(p.title, null)
    assert.equal(p.sku, null)
    assert.equal(p.taxable, true)
    assert.equal(p.catalogId, null)
    assert.deepEqual(p.identifiers, [])
    assert.deepEqual(p.images, [])
    assert.deepEqual(p.tags, [])
    assert.equal(Product.collection, 'products')
  })

  it('passes through all fields', () => {
    const p = new Product({
      title: 'Widget',
      sku: 'W-001',
      taxable: false,
      description: 'A fine widget',
      catalogId: 'cat-1',
    })
    assert.equal(p.title, 'Widget')
    assert.equal(p.sku, 'W-001')
    assert.equal(p.taxable, false)
    assert.equal(p.description, 'A fine widget')
    assert.equal(p.catalogId, 'cat-1')
  })

  it('instantiates nested models', () => {
    const p = new Product({
      tags: [{ title: 'sale' } as any],
      images: [{ url: 'img.png' } as any],
      identifiers: [{ value: '12345', type: 'barcode' } as any],
    })
    assert.equal(p.tags.length, 1)
    assert.equal(p.images.length, 1)
    assert.equal(p.identifiers.length, 1)
  })
})

// ─── Reader ───

describe('Reader', () => {
  it('constructs with defaults', () => {
    const r = new Reader()
    assert.ok(r.id)
    assert.equal(r.title, null)
    assert.equal(r.businessId, null)
    assert.equal(r.deviceType, null)
    assert.equal(r.stripeReaderId, null)
    assert.equal(Reader.collection, 'readers')
  })

  it('accepts device type', () => {
    const r = new Reader({ deviceType: 'bbpos_wisepos_e', businessId: 'biz-1' })
    assert.equal(r.deviceType, 'bbpos_wisepos_e')
    assert.equal(r.businessId, 'biz-1')
  })
})

// ─── Timecard ───

describe('Timecard', () => {
  it('constructs with defaults', () => {
    const tc = new Timecard()
    assert.ok(tc.id)
    assert.ok(tc.startedAt)
    assert.equal(tc.status, 'started')
    assert.equal(tc.endedAt, null)
    assert.equal(tc.userId, null)
    assert.equal(tc.startedCorrection, null)
    assert.equal(tc.endedCorrection, null)
    assert.equal(Timecard.collection, 'timecards')
  })

  it('effectiveStart returns startedAt when no correction', () => {
    const tc = new Timecard({ startedAt: '2025-01-01T09:00:00Z' })
    assert.equal(tc.effectiveStart, '2025-01-01T09:00:00Z')
  })

  it('effectiveStart returns correction when present', () => {
    const tc = new Timecard({
      startedAt: '2025-01-01T09:00:00Z',
      startedCorrection: '2025-01-01T08:45:00Z',
    })
    assert.equal(tc.effectiveStart, '2025-01-01T08:45:00Z')
  })

  it('effectiveEnd returns null when not ended', () => {
    const tc = new Timecard()
    assert.equal(tc.effectiveEnd, null)
  })

  it('effectiveEnd returns endedAt when no correction', () => {
    const tc = new Timecard({ endedAt: '2025-01-01T17:00:00Z' })
    assert.equal(tc.effectiveEnd, '2025-01-01T17:00:00Z')
  })

  it('effectiveEnd returns correction when present', () => {
    const tc = new Timecard({
      endedAt: '2025-01-01T17:00:00Z',
      endedCorrection: '2025-01-01T17:15:00Z',
    })
    assert.equal(tc.effectiveEnd, '2025-01-01T17:15:00Z')
  })
})

// ─── Unit ───

describe('Unit', () => {
  it('constructs with defaults', () => {
    const u = new Unit()
    assert.ok(u.id)
    assert.equal(u.amount, 0)
    assert.equal(u.taxable, true)
    assert.equal(u.productId, null)
    assert.equal(u.containerId, null)
    assert.deepEqual(u.statuses, [])
    assert.deepEqual(u.tags, [])
    assert.equal(Unit.collection, 'units')
  })

  it('instantiates nested UnitStatus', () => {
    const u = new Unit({
      statuses: [{ value: 'active' }, { value: 'sold' }],
    })
    assert.equal(u.statuses.length, 2)
    assert.ok(u.statuses[0] instanceof UnitStatus)
    assert.equal(u.statuses[0].value, 'active')
    assert.equal(u.statuses[1].value, 'sold')
  })
})

describe('UnitStatus', () => {
  it('defaults to pending', () => {
    const s = new UnitStatus()
    assert.equal(s.value, 'pending')
    assert.ok(s.id)
  })
})

// ─── OrderItem, OrderDiscount, OrderTax, OrderPayment ───

describe('OrderItem', () => {
  it('constructs with defaults', () => {
    const item = new OrderItem()
    assert.equal(item.amount, 0)
    assert.equal(item.quantity, 1)
    assert.equal(item.taxable, true)
    assert.equal(item.title, null)
    assert.equal(item.productId, null)
  })

  it('accepts all fields', () => {
    const item = new OrderItem({ amount: 999, quantity: 3, taxable: false, title: 'Coffee' })
    assert.equal(item.amount, 999)
    assert.equal(item.quantity, 3)
    assert.equal(item.taxable, false)
  })
})

describe('OrderDiscount', () => {
  it('defaults amount and percent to 0', () => {
    const d = new OrderDiscount()
    assert.equal(d.amount, 0)
    assert.equal(d.percent, 0)
  })
})

describe('OrderTax', () => {
  it('defaults amount and percent to 0', () => {
    const t = new OrderTax()
    assert.equal(t.amount, 0)
    assert.equal(t.percent, 0)
  })
})

describe('OrderPayment', () => {
  it('defaults amount to 0, type to null', () => {
    const p = new OrderPayment()
    assert.equal(p.amount, 0)
    assert.equal(p.type, null)
    assert.equal(p.paidAt, null)
  })
})

// ─── Order — construction ───

describe('Order', () => {
  it('constructs with defaults', () => {
    const o = new Order()
    assert.ok(o.id)
    assert.equal(o.businessId, null)
    assert.equal(o.completedAt, null)
    assert.equal(o.heldAt, null)
    assert.deepEqual(o.items, [])
    assert.deepEqual(o.discounts, [])
    assert.deepEqual(o.taxes, [])
    assert.deepEqual(o.payments, [])
    assert.equal(Order.collection, 'orders')
  })

  it('instantiates nested sub-models', () => {
    const o = new Order({
      items: [{ amount: 500, quantity: 2 }],
      discounts: [{ amount: 100 }],
      taxes: [{ percent: 0.08 }],
      payments: [{ amount: 1000 }],
    })
    assert.ok(o.items[0] instanceof OrderItem)
    assert.ok(o.discounts[0] instanceof OrderDiscount)
    assert.ok(o.taxes[0] instanceof OrderTax)
    assert.ok(o.payments[0] instanceof OrderPayment)
  })

  // ─── Derived status ───

  describe('status', () => {
    it('is pending when no completedAt or heldAt', () => {
      const o = new Order()
      assert.equal(o.status, 'pending')
    })

    it('is held when heldAt is set', () => {
      const o = new Order({ heldAt: '2025-01-01T00:00:00Z' })
      assert.equal(o.status, 'held')
    })

    it('is completed when completedAt is set and has payments', () => {
      const o = new Order({
        completedAt: '2025-01-01T00:00:00Z',
        payments: [{ amount: 100 }],
      })
      assert.equal(o.status, 'completed')
    })

    it('is noSale when completedAt is set but no payments', () => {
      const o = new Order({ completedAt: '2025-01-01T00:00:00Z' })
      assert.equal(o.status, 'noSale')
    })
  })

  // ─── Calculations ───

  describe('calculations', () => {
    it('calculates quantity from items', () => {
      const o = new Order({
        items: [{ quantity: 2 }, { quantity: 3 }],
      })
      assert.equal(o.quantity, 5)
    })

    it('quantity is 0 with no items', () => {
      assert.equal(new Order().quantity, 0)
    })

    it('calculates taxable vs non-taxable pretotals', () => {
      const o = new Order({
        items: [
          { amount: 1000, quantity: 2, taxable: true },
          { amount: 500, quantity: 1, taxable: false },
        ],
      })
      assert.equal(o.taxablePretotal, 2000)
      assert.equal(o.nonTaxablePretotal, 500)
      assert.equal(o.pretotal, 2500)
    })

    it('calculates tax total (fixed + percentage)', () => {
      const o = new Order({
        items: [{ amount: 1000, quantity: 1, taxable: true }],
        taxes: [
          { amount: 50, percent: 0 },      // $0.50 fixed
          { amount: 0, percent: 0.08 },     // 8% on taxable
        ],
      })
      // fixed: 50, percent: 1000 * 0.08 = 80
      assert.equal(o.taxTotal, 130)
    })

    it('calculates discount total (fixed + percentage)', () => {
      const o = new Order({
        items: [
          { amount: 1000, quantity: 1, taxable: true },
          { amount: 500, quantity: 1, taxable: false },
        ],
        discounts: [
          { amount: 100, percent: 0 },      // $1 fixed
          { amount: 0, percent: 0.1 },       // 10% on pretotal
        ],
      })
      // pretotal = 1500, fixed: 100, percent: 1500 * 0.1 = 150
      assert.equal(o.discountTotal, 250)
    })

    it('calculates subtotal (pretotal - discounts)', () => {
      const o = new Order({
        items: [{ amount: 1000, quantity: 2 }],
        discounts: [{ amount: 200 }],
      })
      // pretotal = 2000, discount = 200
      assert.equal(o.subtotal, 1800)
    })

    it('calculates total (subtotal + tax)', () => {
      const o = new Order({
        items: [{ amount: 1000, quantity: 1, taxable: true }],
        taxes: [{ amount: 0, percent: 0.1 }],
        discounts: [{ amount: 100 }],
      })
      // pretotal: 1000, discount: 100, subtotal: 900
      // taxTotal: 1000 * 0.1 = 100 (tax on taxable pretotal, not subtotal)
      // total: 900 + 100 = 1000
      assert.equal(o.subtotal, 900)
      assert.equal(o.taxTotal, 100)
      assert.equal(o.total, 1000)
    })

    it('calculates amount due (total - payments)', () => {
      const o = new Order({
        items: [{ amount: 1000, quantity: 1 }],
        payments: [{ amount: 800 }],
      })
      assert.equal(o.due, 200)
    })

    it('handles overpayment (negative due)', () => {
      const o = new Order({
        items: [{ amount: 500, quantity: 1 }],
        payments: [{ amount: 600 }],
      })
      assert.equal(o.due, -100)
    })

    it('handles empty order (all zeros)', () => {
      const o = new Order()
      assert.equal(o.pretotal, 0)
      assert.equal(o.taxTotal, 0)
      assert.equal(o.discountTotal, 0)
      assert.equal(o.subtotal, 0)
      assert.equal(o.total, 0)
      assert.equal(o.due, 0)
    })
  })
})

// ─── Till ───

describe('Till', () => {
  it('constructs with defaults', () => {
    const t = new Till()
    assert.ok(t.id)
    assert.equal(t.businessId, null)
    assert.deepEqual(t.corrections, [])
    assert.equal(Till.collection, 'tills')
  })

  it('instantiates nested TillCorrection', () => {
    const t = new Till({
      corrections: [{ action: 'audit', amount: 100 }],
    })
    assert.ok(t.corrections[0] instanceof TillCorrection)
    assert.equal(t.corrections[0].action, 'audit')
  })

  describe('balance', () => {
    it('is 0 with no corrections', () => {
      const t = new Till()
      assert.equal(t.balance, 0)
    })

    it('sums all corrections when no audit exists', () => {
      const t = new Till({
        corrections: [
          { action: 'credit', amount: 100, correctedAt: '2025-01-01T10:00:00Z' },
          { action: 'credit', amount: 50, correctedAt: '2025-01-01T11:00:00Z' },
          { action: 'debit', amount: -30, correctedAt: '2025-01-01T12:00:00Z' },
        ],
      })
      assert.equal(t.balance, 120)
    })

    it('uses most recent audit as baseline', () => {
      const t = new Till({
        corrections: [
          { action: 'credit', amount: 500, correctedAt: '2025-01-01T08:00:00Z' },
          { action: 'audit', amount: 200, correctedAt: '2025-01-01T10:00:00Z' },
          { action: 'credit', amount: 50, correctedAt: '2025-01-01T11:00:00Z' },
        ],
      })
      // Baseline = 200 (audit), + 50 (credit after audit) = 250
      assert.equal(t.balance, 250)
    })

    it('ignores credits/debits before the latest audit', () => {
      const t = new Till({
        corrections: [
          { action: 'credit', amount: 9999, correctedAt: '2025-01-01T01:00:00Z' },
          { action: 'audit', amount: 100, correctedAt: '2025-01-01T12:00:00Z' },
        ],
      })
      assert.equal(t.balance, 100)
    })

    it('handles multiple audits (uses most recent)', () => {
      const t = new Till({
        corrections: [
          { action: 'audit', amount: 100, correctedAt: '2025-01-01T08:00:00Z' },
          { action: 'audit', amount: 500, correctedAt: '2025-01-01T16:00:00Z' },
          { action: 'credit', amount: 20, correctedAt: '2025-01-01T17:00:00Z' },
        ],
      })
      // Latest audit = 500, + 20 credit = 520
      assert.equal(t.balance, 520)
    })
  })
})

describe('TillCorrection', () => {
  it('defaults to audit action with 0 amount', () => {
    const c = new TillCorrection()
    assert.equal(c.action, 'audit')
    assert.equal(c.amount, 0)
    assert.equal(c.orderId, null)
  })
})
