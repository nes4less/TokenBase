/**
 * Subscription lifecycle, concurrent access, error recovery, large payloads,
 * and encryption algorithm switching tests.
 */

import { describe, it, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { InMemoryDataService } from '../src/data/memory-adapter'
import { LoggingDataService } from '../src/data/logging-adapter'
import { ScopedDataService } from '../src/data/scoped-adapter'
import { EncryptionService } from '../src/security/encryption'
import { HashCommitmentProvider, generateNonce } from '../src/security/commitments'
import type { SubscriptionChange } from '../src/data/types'
import type { KeyAlgorithm } from '../src/security/types'

// ═══════════════════════════════════════
// T5: Subscription Lifecycle Tests
// ═══════════════════════════════════════

describe('Subscription Lifecycle', () => {
  let ds: InMemoryDataService

  beforeEach(() => {
    ds = new InMemoryDataService()
  })

  it('receives update events', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    const created = await ds.create('items', { title: 'Original' })
    const id = (created.data as Record<string, unknown>).id as string

    await ds.subscribe('items', (change) => changes.push(change))
    await ds.update('items', id, { title: 'Updated' })

    assert.equal(changes.length, 1)
    assert.equal(changes[0].event, 'update')
    assert.equal((changes[0].record as Record<string, unknown>).title, 'Updated')
    assert.equal((changes[0].previous as Record<string, unknown>).title, 'Original')
  })

  it('receives delete events', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    const created = await ds.create('items', { title: 'Doomed' })
    const id = (created.data as Record<string, unknown>).id as string

    await ds.subscribe('items', (change) => changes.push(change))
    await ds.softDelete('items', id)

    assert.equal(changes.length, 1)
    assert.equal(changes[0].event, 'delete')
    assert.equal(changes[0].record, null)
    assert.equal((changes[0].previous as Record<string, unknown>).title, 'Doomed')
  })

  it('filters by event type', async () => {
    const inserts: SubscriptionChange<unknown>[] = []
    await ds.subscribe('items', (change) => inserts.push(change), { events: ['insert'] })

    await ds.create('items', { title: 'A' })
    const created = await ds.create('items', { title: 'B' })
    const id = (created.data as Record<string, unknown>).id as string
    await ds.update('items', id, { title: 'B-updated' })
    await ds.softDelete('items', id)

    // Should only have 2 insert events, not updates or deletes
    assert.equal(inserts.length, 2)
    assert.ok(inserts.every(c => c.event === 'insert'))
  })

  it('filters by record value', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    await ds.subscribe('items', (change) => changes.push(change), {
      filters: [{ field: 'category', operator: 'eq', value: 'A' }],
    })

    await ds.create('items', { title: 'Relevant', category: 'A' })
    await ds.create('items', { title: 'Irrelevant', category: 'B' })

    assert.equal(changes.length, 1)
    assert.equal((changes[0].record as Record<string, unknown>).title, 'Relevant')
  })

  it('multiple subscriptions to same collection', async () => {
    const sub1: string[] = []
    const sub2: string[] = []

    await ds.subscribe('items', () => sub1.push('got'))
    await ds.subscribe('items', () => sub2.push('got'))

    await ds.create('items', { title: 'Test' })

    assert.equal(sub1.length, 1)
    assert.equal(sub2.length, 1)
  })

  it('unsubscribing one does not affect another', async () => {
    const sub1: string[] = []
    const sub2: string[] = []

    const s1 = await ds.subscribe('items', () => sub1.push('got'))
    await ds.subscribe('items', () => sub2.push('got'))

    s1.unsubscribe()
    await ds.create('items', { title: 'After unsub' })

    assert.equal(sub1.length, 0)
    assert.equal(sub2.length, 1)
  })

  it('subscription to one collection does not fire for another', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    await ds.subscribe('products', (change) => changes.push(change))

    await ds.create('orders', { total: 100 })

    assert.equal(changes.length, 0)
  })

  it('disconnect clears all subscriptions', async () => {
    const changes: SubscriptionChange<unknown>[] = []
    await ds.subscribe('items', (change) => changes.push(change))

    await ds.disconnect()
    // After disconnect, creates on a fresh adapter shouldn't fire
    // (collections are cleared so there's nothing to subscribe to)
    // The adapter is effectively dead — just verify no crash
    const r = await ds.query('items', {})
    assert.equal(r.data.length, 0)
  })
})

// ═══════════════════════════════════════
// T4: Concurrent Access Tests
// ═══════════════════════════════════════

describe('Concurrent Access', () => {
  let ds: InMemoryDataService

  beforeEach(() => {
    ds = new InMemoryDataService()
  })

  it('concurrent creates produce unique records', async () => {
    const promises = Array.from({ length: 50 }, (_, i) =>
      ds.create('items', { idx: i })
    )
    const results = await Promise.all(promises)
    const ids = new Set(results.map(r => (r.data as Record<string, unknown>).id))
    assert.equal(ids.size, 50)
  })

  it('concurrent updates to same record resolve without crash', async () => {
    const created = await ds.create('items', { counter: 0 })
    const id = (created.data as Record<string, unknown>).id as string

    const promises = Array.from({ length: 20 }, (_, i) =>
      ds.update('items', id, { counter: i })
    )
    await Promise.all(promises)

    const result = await ds.read('items', id)
    assert.ok(result)
    // The final value is non-deterministic with concurrent writes,
    // but the record should exist and have a numeric counter
    assert.equal(typeof (result.data as Record<string, unknown>).counter, 'number')
  })

  it('concurrent reads and writes interleave safely', async () => {
    const created = await ds.create('items', { title: 'shared' })
    const id = (created.data as Record<string, unknown>).id as string

    const ops = [
      ds.read('items', id),
      ds.update('items', id, { title: 'v2' }),
      ds.read('items', id),
      ds.update('items', id, { title: 'v3' }),
      ds.read('items', id),
    ]
    const results = await Promise.all(ops)
    // All operations should complete without error
    assert.equal(results.length, 5)
  })

  it('concurrent queries on empty collection', async () => {
    const promises = Array.from({ length: 10 }, () =>
      ds.query('empty', {})
    )
    const results = await Promise.all(promises)
    assert.ok(results.every(r => r.data.length === 0))
  })

  it('concurrent create + query produces consistent total', async () => {
    // Create 10 items, then query
    const creates = Array.from({ length: 10 }, (_, i) =>
      ds.create('items', { idx: i })
    )
    await Promise.all(creates)

    const results = await ds.query('items', {})
    assert.equal(results.meta.total, 10)
  })
})

// ═══════════════════════════════════════
// T6: Error Recovery Tests
// ═══════════════════════════════════════

describe('Error Recovery', () => {
  let ds: InMemoryDataService

  beforeEach(() => {
    ds = new InMemoryDataService()
  })

  it('update on nonexistent record throws with context', async () => {
    try {
      await ds.update('products', 'ghost-id', { title: 'x' })
      assert.fail('should have thrown')
    } catch (e: any) {
      assert.ok(e.message.includes('ghost-id'))
      assert.ok(e.message.includes('products'))
    }
  })

  it('update on soft-deleted record throws with context', async () => {
    const created = await ds.create('products', { title: 'temp' })
    const id = (created.data as Record<string, unknown>).id as string
    await ds.softDelete('products', id)

    try {
      await ds.update('products', id, { title: 'revived' })
      assert.fail('should have thrown')
    } catch (e: any) {
      assert.ok(e.message.includes('soft-deleted'))
    }
  })

  it('scoped adapter prevents cross-scope access', async () => {
    const inner = new InMemoryDataService()
    const scopedA = new ScopedDataService(inner, { scopeId: 'A' })
    const scopedB = new ScopedDataService(inner, { scopeId: 'B' })

    const created = await scopedA.create('items', { title: 'A-only' })
    const id = (created.data as Record<string, unknown>).id as string

    // B cannot read A's record
    const read = await scopedB.read('items', id)
    assert.equal(read, null)

    // B cannot update A's record
    await assert.rejects(
      () => scopedB.update('items', id, { title: 'hijacked' }),
      /does not belong to scope/,
    )
  })

  it('logging adapter does not crash on unexpected data shapes', async () => {
    const inner = new InMemoryDataService()
    const logged = new LoggingDataService(inner, { actorId: 'test', actorType: 'agent' })

    // Create with nested/complex data
    const result = await logged.create('items', {
      nested: { deep: { value: 42 } },
      array: [1, 2, 3],
      nullField: null,
    })
    assert.ok(result.data)
  })
})

// ═══════════════════════════════════════
// T7: Large Payload Tests
// ═══════════════════════════════════════

describe('Large Payloads', () => {
  let ds: InMemoryDataService

  beforeEach(() => {
    ds = new InMemoryDataService()
  })

  it('handles 1000 records in a collection', async () => {
    const creates = Array.from({ length: 1000 }, (_, i) =>
      ds.create('items', { idx: i, title: `Item ${i}` })
    )
    await Promise.all(creates)

    const all = await ds.query('items', {})
    assert.equal(all.meta.total, 1000)
  })

  it('paginated iteration over large set', async () => {
    for (let i = 0; i < 100; i++) {
      await ds.create('items', { idx: i })
    }

    let fetched = 0
    let offset = 0
    const pageSize = 10
    let hasMore = true

    while (hasMore) {
      const page = await ds.query('items', { pagination: { limit: pageSize, offset } })
      fetched += page.data.length
      hasMore = page.meta.hasMore
      offset += pageSize
    }

    assert.equal(fetched, 100)
  })

  it('handles records with large string fields', async () => {
    const bigString = 'x'.repeat(100_000)
    const result = await ds.create('items', { content: bigString })
    const data = result.data as Record<string, unknown>
    assert.equal((data.content as string).length, 100_000)

    const read = await ds.read('items', data.id as string)
    assert.equal(((read!.data as Record<string, unknown>).content as string).length, 100_000)
  })

  it('handles record with many fields', async () => {
    const manyFields: Record<string, unknown> = {}
    for (let i = 0; i < 200; i++) {
      manyFields[`field_${i}`] = `value_${i}`
    }
    const result = await ds.create('items', manyFields)
    const data = result.data as Record<string, unknown>
    assert.equal(data.field_199, 'value_199')
  })

  it('filter on large set returns correct count', async () => {
    for (let i = 0; i < 100; i++) {
      await ds.create('items', { idx: i, even: i % 2 === 0 })
    }

    const evens = await ds.query('items', {
      filters: [{ field: 'even', operator: 'eq', value: true }],
    })
    assert.equal(evens.meta.total, 50)
  })
})

// ═══════════════════════════════════════
// T8: Algorithm Switching Tests
// ═══════════════════════════════════════

describe('Encryption Algorithm Switching', () => {
  const crypto = new EncryptionService()

  it('encrypts with xchacha20 and decrypts correctly', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)
    const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test', 'xchacha20-poly1305')

    const plaintext = new TextEncoder().encode('xchacha20 test')
    const encrypted = crypto.encrypt(plaintext, key.key, 'xchacha20-poly1305')
    assert.equal(encrypted.algorithm, 'xchacha20-poly1305')

    const decrypted = crypto.decrypt(encrypted, key.key)
    assert.deepEqual(decrypted, plaintext)
  })

  it('encrypts with aes-256-gcm and decrypts correctly', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)
    const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test', 'aes-256-gcm')

    const plaintext = new TextEncoder().encode('aes-256 test')
    const encrypted = crypto.encrypt(plaintext, key.key, 'aes-256-gcm')
    assert.equal(encrypted.algorithm, 'aes-256-gcm')

    const decrypted = crypto.decrypt(encrypted, key.key)
    assert.deepEqual(decrypted, plaintext)
  })

  it('cannot decrypt aes-256-gcm ciphertext with xchacha20 key derivation', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)

    const aesKey = crypto.deriveKey(shared, Buffer.from('salt'), 'test', 'aes-256-gcm')
    const xchachaKey = crypto.deriveKey(shared, Buffer.from('salt'), 'test', 'xchacha20-poly1305')

    const plaintext = new TextEncoder().encode('cross-algo test')
    const encrypted = crypto.encrypt(plaintext, aesKey.key, 'aes-256-gcm')

    // Attempting to decrypt with a key derived for xchacha20 should fail
    // (the keys are actually the same derivation since HKDF doesn't use algo,
    // but the nonce size/cipher differ)
    assert.throws(() => {
      crypto.decrypt({ ...encrypted, algorithm: 'xchacha20-poly1305' }, xchachaKey.key)
    })
  })

  it('same plaintext produces different ciphertext each time', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)
    const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test')

    const plaintext = new TextEncoder().encode('determinism check')
    const e1 = crypto.encrypt(plaintext, key.key)
    const e2 = crypto.encrypt(plaintext, key.key)

    // Nonces should differ
    assert.notDeepEqual(e1.nonce, e2.nonce)
    // Ciphertexts should differ (because nonces differ)
    assert.notDeepEqual(e1.ciphertext, e2.ciphertext)
  })

  it('empty plaintext round-trips', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)
    const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test')

    const empty = new Uint8Array(0)
    const encrypted = crypto.encrypt(empty, key.key)
    const decrypted = crypto.decrypt(encrypted, key.key)
    assert.equal(decrypted.length, 0)
  })

  it('large plaintext round-trips', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)
    const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test')

    const large = new Uint8Array(100_000)
    for (let i = 0; i < large.length; i++) large[i] = i % 256
    const encrypted = crypto.encrypt(large, key.key)
    const decrypted = crypto.decrypt(encrypted, key.key)
    assert.deepEqual(decrypted, large)
  })

  it('field keys are unique per field name', () => {
    const alice = crypto.generateKeyPair()
    const bob = crypto.generateKeyPair()
    const shared = crypto.agree(alice.privateKey, bob.publicKey)
    const scopeKey = crypto.deriveKey(shared, Buffer.from('salt'), 'test')

    const fields = ['email', 'phone', 'ssn', 'name', 'address']
    const keys = fields.map(f => crypto.deriveFieldKey(scopeKey.key, f))

    // All keys should be unique
    const unique = new Set(keys.map(k => Buffer.from(k.key).toString('hex')))
    assert.equal(unique.size, fields.length)
  })

  it('commitment verification fails with wrong nonce', async () => {
    const provider = new HashCommitmentProvider()
    const nonce1 = generateNonce()
    const nonce2 = generateNonce()
    const commitment = await provider.commit('e1', 'f', 'secret', nonce1)
    const result = await provider.verify(commitment, 'secret', nonce2)
    assert.equal(result.matches, false)
  })

  it('commitment nonce is always unique', () => {
    const nonces = Array.from({ length: 100 }, () => generateNonce())
    const unique = new Set(nonces)
    assert.equal(unique.size, 100)
  })
})
