/**
 * Smoke tests — Encryption round-trips.
 *
 * Verifies key generation, agreement, derivation, and encrypt/decrypt cycles.
 * TODO: Full coverage — test key rotation, algorithm switching, error cases, large payloads.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

import { EncryptionService } from '../src/security/encryption'
import { HashCommitmentProvider, generateNonce } from '../src/security/commitments'
import type { KeyAlgorithm } from '../src/security/types'

describe('EncryptionService', () => {
  const crypto = new EncryptionService()

  describe('Key Generation', () => {
    it('generates key pairs with 32-byte keys', () => {
      const kp = crypto.generateKeyPair()
      assert.equal(kp.publicKey.length, 32)
      assert.equal(kp.privateKey.length, 32)
    })

    it('generates unique key pairs', () => {
      const a = crypto.generateKeyPair()
      const b = crypto.generateKeyPair()
      assert.notDeepEqual(a.publicKey, b.publicKey)
      assert.notDeepEqual(a.privateKey, b.privateKey)
    })
  })

  describe('Key Agreement', () => {
    it('derives the same shared secret for both parties', () => {
      const alice = crypto.generateKeyPair()
      const bob = crypto.generateKeyPair()

      const secretAB = crypto.agree(alice.privateKey, bob.publicKey)
      const secretBA = crypto.agree(bob.privateKey, alice.publicKey)

      assert.deepEqual(secretAB, secretBA)
    })
  })

  describe('Key Derivation', () => {
    it('derives a key with correct properties', () => {
      const alice = crypto.generateKeyPair()
      const bob = crypto.generateKeyPair()
      const shared = crypto.agree(alice.privateKey, bob.publicKey)

      const salt = Buffer.from('test-salt', 'utf-8')
      const derived = crypto.deriveKey(shared, salt, 'tokenbase:scope:test')

      assert.equal(derived.key.length, 32)
      assert.equal(derived.algorithm, 'xchacha20-poly1305')
      assert.ok(derived.fingerprint.length > 0)
      assert.ok(derived.derivedAt.length > 0)
    })

    it('derives different keys for different info strings', () => {
      const alice = crypto.generateKeyPair()
      const bob = crypto.generateKeyPair()
      const shared = crypto.agree(alice.privateKey, bob.publicKey)
      const salt = Buffer.from('salt', 'utf-8')

      const k1 = crypto.deriveKey(shared, salt, 'scope-a')
      const k2 = crypto.deriveKey(shared, salt, 'scope-b')

      assert.notDeepEqual(k1.key, k2.key)
    })
  })

  describe('Encrypt / Decrypt', () => {
    const algorithms: KeyAlgorithm[] = ['xchacha20-poly1305', 'aes-256-gcm']

    for (const algo of algorithms) {
      it(`round-trips with ${algo}`, () => {
        const alice = crypto.generateKeyPair()
        const bob = crypto.generateKeyPair()
        const shared = crypto.agree(alice.privateKey, bob.publicKey)
        const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test', algo)

        const plaintext = new TextEncoder().encode('Hello TokenBase')
        const encrypted = crypto.encrypt(plaintext, key.key, algo)

        assert.ok(encrypted.ciphertext.length > 0)
        assert.ok(encrypted.nonce.length > 0)
        assert.equal(encrypted.algorithm, algo)

        const decrypted = crypto.decrypt(encrypted, key.key)
        assert.deepEqual(decrypted, plaintext)
      })
    }

    it('fails to decrypt with wrong key', () => {
      const alice = crypto.generateKeyPair()
      const bob = crypto.generateKeyPair()
      const shared = crypto.agree(alice.privateKey, bob.publicKey)
      const key = crypto.deriveKey(shared, Buffer.from('salt'), 'test')

      const plaintext = new TextEncoder().encode('secret data')
      const encrypted = crypto.encrypt(plaintext, key.key)

      // Generate a different key
      const wrongKey = crypto.deriveKey(shared, Buffer.from('different-salt'), 'test')

      assert.throws(() => {
        crypto.decrypt(encrypted, wrongKey.key)
      })
    })
  })

  describe('Field Key Derivation', () => {
    it('derives unique sub-keys per field', () => {
      const alice = crypto.generateKeyPair()
      const bob = crypto.generateKeyPair()
      const shared = crypto.agree(alice.privateKey, bob.publicKey)
      const scopeKey = crypto.deriveKey(shared, Buffer.from('salt'), 'test')

      const emailKey = crypto.deriveFieldKey(scopeKey.key, 'email')
      const phoneKey = crypto.deriveFieldKey(scopeKey.key, 'phone')

      assert.notDeepEqual(emailKey.key, phoneKey.key)
    })
  })
})

describe('HashCommitmentProvider', () => {
  const provider = new HashCommitmentProvider()

  it('creates and verifies a commitment', async () => {
    const nonce = generateNonce()
    const commitment = await provider.commit('entity-1', 'email', 'alice@example.com', nonce)

    assert.equal(commitment.algorithm, 'sha256')
    assert.equal(commitment.entityId, 'entity-1')
    assert.equal(commitment.field, 'email')
    assert.ok(commitment.hash.length > 0)

    // Verify with correct value
    const valid = await provider.verify(commitment, 'alice@example.com', nonce)
    assert.equal(valid.matches, true)

    // Verify with wrong value
    const invalid = await provider.verify(commitment, 'bob@example.com', nonce)
    assert.equal(invalid.matches, false)
  })

  it('produces different hashes for different values', async () => {
    const nonce = generateNonce()
    const c1 = await provider.commit('e1', 'f', 'value-a', nonce)
    const c2 = await provider.commit('e1', 'f', 'value-b', nonce)
    assert.notEqual(c1.hash, c2.hash)
  })

  it('produces different hashes for different nonces', async () => {
    const c1 = await provider.commit('e1', 'f', 'same-value', generateNonce())
    const c2 = await provider.commit('e1', 'f', 'same-value', generateNonce())
    assert.notEqual(c1.hash, c2.hash)
  })
})
