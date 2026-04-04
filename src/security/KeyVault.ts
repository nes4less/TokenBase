import { generateDateString, generateUUID } from '../utils'
import type { KeyAlgorithm, KeyRotation } from './types'

/**
 * KeyVault — per-scope key store.
 *
 * Stores the encrypted master key for a scope. The master key is encrypted
 * with the Handshake-derived shared secret, so it's useless without an
 * active Handshake.
 *
 * When a Handshake breaks:
 * 1. The parties' private keys are deleted (device-local)
 * 2. The shared secret is unrecoverable
 * 3. This vault's encryptedMasterKey becomes undecryptable
 * 4. The vault record can be deleted — the data it protected is unreadable
 *
 * Key rotation appends to the rotations array. Old fingerprints let
 * the system re-encrypt data that was encrypted with a previous key.
 */
export class KeyVault {
  static collection: string = 'key_vaults'

  id: string
  /** Which scope this vault protects (org, project, or environment ID). */
  scopeId: string
  /** The scope master key, encrypted with the Handshake-derived key (base64). */
  encryptedMasterKey: string
  /** SHA-256 fingerprint of the current key — for quick lookup. */
  keyFingerprint: string
  /** Which symmetric algorithm the master key is for. */
  algorithm: KeyAlgorithm
  /** Key rotation history (append-only). */
  rotations: KeyRotation[]

  createdAt: string
  updatedAt: string

  constructor(data?: Partial<KeyVault>) {
    this.id = data?.id || generateUUID()
    this.scopeId = data?.scopeId || ''
    this.encryptedMasterKey = data?.encryptedMasterKey || ''
    this.keyFingerprint = data?.keyFingerprint || ''
    this.algorithm = data?.algorithm || 'xchacha20-poly1305'
    this.rotations = data?.rotations || []
    this.createdAt = data?.createdAt || generateDateString()
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
