/**
 * Smoke tests — Key lifecycle manager.
 *
 * Verifies the full Handshake → key exchange → vault → destroy flow.
 * TODO: Full coverage — rotation, concurrent exchanges, error recovery.
 */

import { describe, it, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'

import { KeyLifecycleManager } from '../src/security/key-lifecycle'
import { EncryptionService } from '../src/security/encryption'
import { Handshake } from '../src/models/Handshake'
import { KeyVault } from '../src/security/KeyVault'
import { InMemoryDataService } from '../src/data/memory-adapter'

describe('KeyLifecycleManager', () => {
  let ds: InMemoryDataService
  let manager: KeyLifecycleManager
  const crypto = new EncryptionService()

  beforeEach(() => {
    ds = new InMemoryDataService()
    manager = new KeyLifecycleManager(ds)
  })

  it('generates a key pair for exchange', () => {
    const init = manager.initKeyExchange()
    assert.ok(init.keyPair.publicKey.length === 32)
    assert.ok(init.keyPair.privateKey.length === 32)
    assert.ok(init.publicKeyBase64.length > 0)
  })

  it('completes key exchange and creates a vault', async () => {
    // Simulate two parties
    const aliceInit = manager.initKeyExchange()
    const bobInit = manager.initKeyExchange()

    const handshake = new Handshake({
      action: 'test-exchange',
      parties: ['alice', 'bob'],
      agreedBy: ['alice', 'bob'],
      status: 'approved',
      partyPublicKeys: {
        alice: aliceInit.publicKeyBase64,
        bob: bobInit.publicKeyBase64,
      },
    })

    const result = await manager.completeKeyExchange(
      handshake,
      aliceInit.keyPair.privateKey,
      'alice',
      'bob',
      'scope-1',
    )

    assert.ok(result.scopeKey.key.length === 32)
    assert.ok(result.vault.scopeId === 'scope-1')
    assert.ok(result.vault.keyFingerprint.length > 0)

    // Vault should be in the data service
    const stored = await ds.query(KeyVault.collection, {
      filters: [{ field: 'scopeId', operator: 'eq', value: 'scope-1' }],
    })
    assert.equal(stored.data.length, 1)
  })

  it('rejects exchange on unapproved handshake', async () => {
    const init = manager.initKeyExchange()
    const handshake = new Handshake({
      status: 'pending',
      parties: ['alice', 'bob'],
      partyPublicKeys: { bob: init.publicKeyBase64 },
    })

    await assert.rejects(
      () => manager.completeKeyExchange(handshake, init.keyPair.privateKey, 'alice', 'bob', 's1'),
      /not approved/,
    )
  })

  it('derives the same scope key from both parties', () => {
    const aliceInit = manager.initKeyExchange()
    const bobInit = manager.initKeyExchange()

    const handshake = new Handshake({
      action: 'derive-test',
      parties: ['alice', 'bob'],
      status: 'approved',
      partyPublicKeys: {
        alice: aliceInit.publicKeyBase64,
        bob: bobInit.publicKeyBase64,
      },
    })

    const aliceKey = manager.deriveFromHandshake(
      handshake, aliceInit.keyPair.privateKey, 'bob', 'scope-1',
    )
    const bobKey = manager.deriveFromHandshake(
      handshake, bobInit.keyPair.privateKey, 'alice', 'scope-1',
    )

    assert.deepEqual(aliceKey.key, bobKey.key)
    assert.equal(aliceKey.fingerprint, bobKey.fingerprint)
  })

  it('destroys vaults for a scope', async () => {
    // Set up a vault
    const aliceInit = manager.initKeyExchange()
    const bobInit = manager.initKeyExchange()
    const handshake = new Handshake({
      action: 'destroy-test',
      parties: ['alice', 'bob'],
      agreedBy: ['alice', 'bob'],
      status: 'approved',
      partyPublicKeys: {
        alice: aliceInit.publicKeyBase64,
        bob: bobInit.publicKeyBase64,
      },
    })

    await manager.completeKeyExchange(
      handshake, aliceInit.keyPair.privateKey, 'alice', 'bob', 'doomed-scope',
    )

    // Verify vault exists
    const vault = await manager.getVault('doomed-scope')
    assert.ok(vault)

    // Destroy
    const result = await manager.destroyKeys('doomed-scope')
    assert.equal(result.vaultsDestroyed, 1)

    // Vault should be gone (soft-deleted)
    const afterDestroy = await manager.getVault('doomed-scope')
    assert.equal(afterDestroy, null)
  })

  it('rotates a scope key', async () => {
    // Set up initial vault
    const aliceInit = manager.initKeyExchange()
    const bobInit = manager.initKeyExchange()
    const handshake = new Handshake({
      action: 'rotate-test',
      parties: ['alice', 'bob'],
      agreedBy: ['alice', 'bob'],
      status: 'approved',
      partyPublicKeys: {
        alice: aliceInit.publicKeyBase64,
        bob: bobInit.publicKeyBase64,
      },
    })

    const initial = await manager.completeKeyExchange(
      handshake, aliceInit.keyPair.privateKey, 'alice', 'bob', 'rotate-scope',
    )

    // Rotate
    const rotated = await manager.rotateKey('rotate-scope', initial.scopeKey, 'scheduled-rotation')
    assert.ok(rotated)
    assert.equal(rotated!.rotations.length, 2) // Initial + rotation
    assert.equal(rotated!.rotations[1].reason, 'scheduled-rotation')
  })
})
