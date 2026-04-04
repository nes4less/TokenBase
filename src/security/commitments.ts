import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'
import { randomBytes } from 'crypto'
import type { Commitment, CommitmentVerification } from './types'
import type { IProofProvider } from './proofs/IProofProvider'

/**
 * HashCommitmentProvider — Layer A proof system.
 *
 * Local hash-based commitments using SHA-256 from @noble/hashes.
 * Always available, no server needed.
 *
 * commit(value, nonce) → SHA-256(canonical(value) || nonce)
 * verify(commitment, candidate, nonce) → hash(candidate || nonce) === commitment.hash
 *
 * Covers: ownership proofs, Handshake commitments, integrity checks,
 * equality verification without revealing the value.
 */
export class HashCommitmentProvider implements IProofProvider {
  readonly name = 'hash-commitment'

  async commit(
    entityId: string,
    field: string,
    value: unknown,
    nonce: Uint8Array
  ): Promise<Commitment> {
    const hash = this.computeHash(value, nonce)
    return {
      hash,
      algorithm: 'sha256',
      createdAt: new Date().toISOString(),
      entityId,
      field,
    }
  }

  async verify(
    commitment: Commitment,
    candidateValue: unknown,
    nonce: Uint8Array
  ): Promise<CommitmentVerification> {
    const candidateHash = this.computeHash(candidateValue, nonce)
    return {
      matches: candidateHash === commitment.hash,
      commitment,
      verifiedAt: new Date().toISOString(),
    }
  }

  /**
   * Compute SHA-256(canonical(value) || nonce).
   *
   * Values are canonicalized to a stable string representation:
   * - strings: UTF-8 bytes directly
   * - numbers: string representation
   * - objects/arrays: JSON.stringify with sorted keys
   * - null/undefined: empty string
   */
  private computeHash(value: unknown, nonce: Uint8Array): string {
    const canonical = this.canonicalize(value)
    const valueBytes = utf8ToBytes(canonical)

    // Concatenate value bytes and nonce
    const combined = new Uint8Array(valueBytes.length + nonce.length)
    combined.set(valueBytes, 0)
    combined.set(nonce, valueBytes.length)

    return bytesToHex(sha256(combined))
  }

  /**
   * Stable canonical form for any value.
   * Objects get sorted keys to ensure deterministic hashing.
   */
  private canonicalize(value: unknown): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return JSON.stringify(value, Object.keys(value as object).sort())
  }
}

/**
 * Generate a cryptographically random nonce for commitments.
 * Uses Node.js crypto.randomBytes.
 */
export function generateNonce(length: number = 32): Uint8Array {
  return new Uint8Array(randomBytes(length))
}
