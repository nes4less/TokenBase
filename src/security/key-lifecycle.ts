/**
 * Key Lifecycle Manager — orchestrates the Handshake → Key → Vault flow.
 *
 * This is the glue between Handshake approval and encryption readiness:
 *
 * Handshake approved → generate key pairs → exchange public keys →
 *   derive shared secret → derive scope key → create KeyVault → ready
 *
 * Handshake broken → destroy vault → keys gone → data unreadable
 *
 * The manager is stateless — all durable state lives in the data service
 * (KeyVault records) and the Handshake model (public keys, fingerprints).
 * Key material (private keys, shared secrets) is ephemeral and never persisted
 * by this class — callers are responsible for device-local storage.
 */

import { EncryptionService } from './encryption'
import { KeyVault } from './KeyVault'
import type { IDataService } from '../data/types'
import type { KeyAlgorithm, DerivedKey, KeyPair } from './types'
import type { Handshake } from '../models/Handshake'

// ─── Types ───

/** The result of initiating a key exchange on a Handshake. */
export interface KeyExchangeInit {
  /** The generated key pair. Caller must store privateKey securely. */
  keyPair: KeyPair
  /** Base64-encoded public key (ready to store on the Handshake). */
  publicKeyBase64: string
}

/** The result of completing a key exchange (after both parties have public keys). */
export interface KeyExchangeComplete {
  /** The derived scope key — use for encryption operations. */
  scopeKey: DerivedKey
  /** The KeyVault record that was created. */
  vault: KeyVault
}

/** Options for key derivation. */
export interface DeriveOptions {
  /** Override the default algorithm. Defaults to Handshake's keyAlgorithm. */
  algorithm?: KeyAlgorithm
  /** Custom salt for HKDF. Defaults to scopeId bytes. */
  salt?: Uint8Array
  /** Custom info string for HKDF. Defaults to 'tokenbase:scope:{scopeId}'. */
  info?: string
}

// ─── Manager ───

export class KeyLifecycleManager {
  private crypto: EncryptionService
  private dataService: IDataService

  constructor(dataService: IDataService) {
    this.crypto = new EncryptionService()
    this.dataService = dataService
  }

  /**
   * Step 1: Generate a key pair for a party joining a Handshake.
   *
   * Returns the key pair and the base64-encoded public key.
   * The caller MUST store the private key in device-local secure storage
   * (macOS Keychain, Android Keystore, etc.) and MUST NOT persist it
   * through TokenBase.
   */
  initKeyExchange(): KeyExchangeInit {
    const keyPair = this.crypto.generateKeyPair()
    const publicKeyBase64 = Buffer.from(keyPair.publicKey).toString('base64')
    return { keyPair, publicKeyBase64 }
  }

  /**
   * Step 2: Complete key exchange after a Handshake is approved.
   *
   * Both parties must have published their public keys on the Handshake.
   * This derives the shared secret, creates a scope key, and stores it
   * in a KeyVault.
   *
   * @param handshake - The approved Handshake (must have partyPublicKeys populated)
   * @param myPrivateKey - This party's private key (from device-local storage)
   * @param myPartyId - This party's ID (must be in handshake.parties)
   * @param peerPartyId - The other party's ID (must have a public key on the Handshake)
   * @param scopeId - The scope this key protects (org, project, or environment ID)
   * @param options - Optional derivation overrides
   */
  async completeKeyExchange(
    handshake: Handshake,
    myPrivateKey: Uint8Array,
    myPartyId: string,
    peerPartyId: string,
    scopeId: string,
    options?: DeriveOptions,
  ): Promise<KeyExchangeComplete> {
    // Validate preconditions
    if (handshake.status !== 'approved') {
      throw new Error(`Handshake ${handshake.id} is not approved (status: ${handshake.status})`)
    }

    const peerPublicKeyBase64 = handshake.partyPublicKeys[peerPartyId]
    if (!peerPublicKeyBase64) {
      throw new Error(`No public key found for party '${peerPartyId}' on Handshake ${handshake.id}`)
    }

    // Derive shared secret via X25519
    const peerPublicKey = new Uint8Array(Buffer.from(peerPublicKeyBase64, 'base64'))
    const sharedSecret = this.crypto.agree(myPrivateKey, peerPublicKey)

    // Derive scope key via HKDF
    const algorithm = options?.algorithm ?? handshake.keyAlgorithm
    const salt = options?.salt ?? Buffer.from(scopeId, 'utf-8')
    const info = options?.info ?? `tokenbase:scope:${scopeId}`
    const scopeKey = this.crypto.deriveKey(sharedSecret, salt, info, algorithm)

    // Generate a random master key for the scope, encrypt it with the scope key
    const masterKeyPair = this.crypto.generateKeyPair()
    const masterKeyBytes = masterKeyPair.privateKey // Use 32 random bytes as master key
    const encryptedMasterKey = this.crypto.encrypt(
      masterKeyBytes,
      scopeKey.key,
      algorithm,
      'scope',
    )

    // Store the vault
    const vault = new KeyVault({
      scopeId,
      encryptedMasterKey: JSON.stringify(encryptedMasterKey),
      keyFingerprint: scopeKey.fingerprint,
      algorithm,
      rotations: [{
        rotatedAt: new Date().toISOString(),
        reason: 'initial-key-exchange',
        fingerprint: scopeKey.fingerprint,
      }],
    })

    await this.dataService.create(KeyVault.collection, vault as unknown as Record<string, unknown>)

    return { scopeKey, vault }
  }

  /**
   * Derive the scope key from an active Handshake.
   *
   * Used to re-derive the key on each session (keys are never stored —
   * they're re-derived from the private key + peer public key).
   */
  deriveFromHandshake(
    handshake: Handshake,
    myPrivateKey: Uint8Array,
    peerPartyId: string,
    scopeId: string,
    options?: DeriveOptions,
  ): DerivedKey {
    const peerPublicKeyBase64 = handshake.partyPublicKeys[peerPartyId]
    if (!peerPublicKeyBase64) {
      throw new Error(`No public key found for party '${peerPartyId}' on Handshake ${handshake.id}`)
    }

    const peerPublicKey = new Uint8Array(Buffer.from(peerPublicKeyBase64, 'base64'))
    const sharedSecret = this.crypto.agree(myPrivateKey, peerPublicKey)

    const algorithm = options?.algorithm ?? handshake.keyAlgorithm
    const salt = options?.salt ?? Buffer.from(scopeId, 'utf-8')
    const info = options?.info ?? `tokenbase:scope:${scopeId}`

    return this.crypto.deriveKey(sharedSecret, salt, info, algorithm)
  }

  /**
   * Destroy all key material for a Handshake.
   *
   * Called when a Handshake is broken (revoked, expired, cancelled).
   * Deletes the KeyVault record. The caller MUST also delete their
   * private key from device-local storage.
   *
   * After this, the encrypted data protected by this scope is unreadable.
   * This is by design — security by destruction.
   */
  async destroyKeys(scopeId: string): Promise<{ vaultsDestroyed: number }> {
    // Find all vaults for this scope
    const result = await this.dataService.query(KeyVault.collection, {
      filters: [{ field: 'scopeId', operator: 'eq', value: scopeId }],
    })

    let destroyed = 0
    for (const vault of result.data) {
      const vaultRecord = vault as Record<string, unknown>
      await this.dataService.softDelete(KeyVault.collection, vaultRecord.id as string)
      destroyed++
    }

    return { vaultsDestroyed: destroyed }
  }

  /**
   * Rotate the scope key.
   *
   * Generates a new master key, encrypts it with the current scope key,
   * and appends a rotation entry to the vault. Old data remains encrypted
   * with the previous key — re-encryption is the caller's responsibility.
   */
  async rotateKey(
    scopeId: string,
    currentScopeKey: DerivedKey,
    reason: string,
  ): Promise<KeyVault | null> {
    // Find the current vault
    const result = await this.dataService.query(KeyVault.collection, {
      filters: [{ field: 'scopeId', operator: 'eq', value: scopeId }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
      pagination: { limit: 1 },
    })

    if (!result.data.length) return null
    const vaultRecord = result.data[0] as Record<string, unknown>
    const vaultId = vaultRecord.id as string

    // Generate new master key
    const newMasterKey = this.crypto.generateKeyPair().privateKey
    const encrypted = this.crypto.encrypt(
      newMasterKey,
      currentScopeKey.key,
      currentScopeKey.algorithm,
      'scope',
    )

    const rotation = {
      rotatedAt: new Date().toISOString(),
      reason,
      fingerprint: currentScopeKey.fingerprint,
    }

    const existingRotations = (vaultRecord.rotations as Array<unknown>) ?? []
    const updateResult = await this.dataService.update(KeyVault.collection, vaultId, {
      encryptedMasterKey: JSON.stringify(encrypted),
      keyFingerprint: currentScopeKey.fingerprint,
      rotations: [...existingRotations, rotation],
    })

    return new KeyVault(updateResult.data as Partial<KeyVault>)
  }

  /**
   * Look up the KeyVault for a scope.
   */
  async getVault(scopeId: string): Promise<KeyVault | null> {
    const result = await this.dataService.query(KeyVault.collection, {
      filters: [{ field: 'scopeId', operator: 'eq', value: scopeId }],
      sort: [{ field: 'createdAt', direction: 'desc' }],
      pagination: { limit: 1 },
    })

    if (!result.data.length) return null
    return new KeyVault(result.data[0] as Partial<KeyVault>)
  }
}
