import { x25519 } from '@noble/curves/ed25519.js'
import { hkdf } from '@noble/hashes/hkdf.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js'
import { gcm } from '@noble/ciphers/aes.js'
import { bytesToHex } from '@noble/hashes/utils.js'
import { managedNonce } from '@noble/ciphers/utils.js'
import type {
  KeyAlgorithm,
  KeyPair,
  DerivedKey,
  EncryptedPayload,
  EncryptionGranularity,
} from './types'

/**
 * EncryptionService — stateless crypto operations.
 *
 * All functions are pure — no stored state, no side effects.
 * Key material is passed in and never retained.
 *
 * Key agreement: X25519 (Curve25519 ECDH)
 * Key derivation: HKDF-SHA256
 * Encryption: XChaCha20-Poly1305 (default) or AES-256-GCM
 *
 * Design Decision D3: Noble (@noble/ciphers + @noble/curves + @noble/hashes)
 */
export class EncryptionService {

  // ─── Key Generation ───

  /**
   * Generate an ephemeral X25519 key pair for Handshake key agreement.
   * Private key should be stored in device-local keychain only.
   */
  generateKeyPair(): KeyPair {
    const privateKey = x25519.utils.randomSecretKey()
    const publicKey = x25519.getPublicKey(privateKey)
    return { publicKey, privateKey }
  }

  /**
   * Compute the SHA-256 fingerprint of a public key.
   * Used for quick identification without exposing the key.
   */
  fingerprint(publicKey: Uint8Array): string {
    return bytesToHex(sha256(publicKey))
  }

  // ─── Key Agreement ───

  /**
   * Perform X25519 key agreement between two parties.
   *
   * Each party calls this with their private key and the other party's
   * public key. Both arrive at the same shared secret.
   */
  agree(privateKey: Uint8Array, peerPublicKey: Uint8Array): Uint8Array {
    return x25519.getSharedSecret(privateKey, peerPublicKey)
  }

  // ─── Key Derivation ───

  /**
   * Derive a scope encryption key from a shared secret using HKDF-SHA256.
   *
   * The info parameter binds the derived key to a specific context,
   * preventing key reuse across different scopes or purposes.
   */
  deriveKey(
    sharedSecret: Uint8Array,
    salt: Uint8Array,
    info: string,
    algorithm: KeyAlgorithm = 'xchacha20-poly1305'
  ): DerivedKey {
    const keyLength = 32 // Both algorithms use 256-bit keys
    const infoBytes = Buffer.from(info, 'utf-8')
    const key = hkdf(sha256, sharedSecret, salt, infoBytes, keyLength)

    return {
      key,
      fingerprint: bytesToHex(sha256(key)),
      algorithm,
      derivedAt: new Date().toISOString(),
    }
  }

  /**
   * Derive a field-specific sub-key from a scope key.
   * Each encrypted field gets its own key via HKDF with the field name as info.
   */
  deriveFieldKey(
    scopeKey: Uint8Array,
    fieldName: string,
    algorithm: KeyAlgorithm = 'xchacha20-poly1305'
  ): DerivedKey {
    return this.deriveKey(
      scopeKey,
      Buffer.from('field-key', 'utf-8'),
      `tokenbase:field:${fieldName}`,
      algorithm
    )
  }

  // ─── Encrypt / Decrypt ───

  /**
   * Encrypt data with the given key.
   *
   * Uses managedNonce which prepends a random nonce to the ciphertext,
   * eliminating nonce management entirely.
   */
  encrypt(
    data: Uint8Array,
    key: Uint8Array,
    algorithm: KeyAlgorithm = 'xchacha20-poly1305',
    granularity: EncryptionGranularity = 'scope',
    field?: string
  ): EncryptedPayload {
    const cipher = this.getCipher(algorithm, key)
    const encrypted = cipher.encrypt(data)

    // managedNonce prepends nonce to ciphertext — split them for storage
    const nonceLength = algorithm === 'xchacha20-poly1305' ? 24 : 12
    const nonce = encrypted.slice(0, nonceLength)
    const ciphertext = encrypted.slice(nonceLength)

    return {
      ciphertext: Buffer.from(ciphertext).toString('base64'),
      nonce: Buffer.from(nonce).toString('base64'),
      algorithm,
      keyFingerprint: bytesToHex(sha256(key)),
      granularity,
      field,
    }
  }

  /**
   * Decrypt an encrypted payload with the given key.
   */
  decrypt(payload: EncryptedPayload, key: Uint8Array): Uint8Array {
    const cipher = this.getCipher(payload.algorithm, key)
    const nonce = new Uint8Array(Buffer.from(payload.nonce, 'base64'))
    const ciphertext = new Uint8Array(Buffer.from(payload.ciphertext, 'base64'))

    // Reconstruct the managedNonce format: nonce || ciphertext
    const combined = new Uint8Array(nonce.length + ciphertext.length)
    combined.set(nonce, 0)
    combined.set(ciphertext, nonce.length)

    return cipher.decrypt(combined)
  }

  // ─── Helpers ───

  /**
   * Get the appropriate AEAD cipher with managed nonce.
   */
  private getCipher(algorithm: KeyAlgorithm, key: Uint8Array) {
    switch (algorithm) {
      case 'xchacha20-poly1305':
        return managedNonce(xchacha20poly1305)(key)
      case 'aes-256-gcm':
        return managedNonce(gcm)(key)
      default:
        throw new Error(`Unsupported algorithm: ${algorithm}`)
    }
  }
}
