/**
 * ZKProofProvider — Layer B proof system.
 *
 * Server-mediated zero-knowledge proofs. Both parties send encrypted
 * inputs to a prover service. Neither sees the other's data.
 *
 * Architecture:
 * - Implements IProofProvider with full zkVerify() support
 * - Delegates to a configurable prover endpoint
 * - Proofs are opaque strings — the provider doesn't interpret them
 * - Supports comparison operators (eq, gt, lt, gte, lte, neq) on encrypted values
 *
 * The prover service is external — this provider handles the protocol,
 * not the cryptographic circuit. The circuit runs server-side.
 */

import { sha256 } from '@noble/hashes/sha2.js'
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'
import type {
  Commitment,
  CommitmentVerification,
  ZKQuestion,
  ZKVerification,
} from '../types'
import type { IProofProvider } from './IProofProvider'

/** Configuration for connecting to a ZK prover service. */
export interface ZKProverConfig {
  /** The prover service endpoint URL. */
  endpoint: string
  /** Optional API key for authenticating with the prover. */
  apiKey?: string
  /** Request timeout in milliseconds. Default: 30000. */
  timeoutMs?: number
  /** Optional fetch implementation (for testing or custom transports). */
  fetch?: typeof globalThis.fetch
}

/** The shape of a prover service request. */
interface ProverRequest {
  encryptedValue: string  // base64
  operator: string
  comparand: unknown
  entityId?: string
  field?: string
}

/** The shape of a prover service response. */
interface ProverResponse {
  result: boolean
  proof?: string
  error?: string
}

export class ZKProofProvider implements IProofProvider {
  readonly name = 'zk-proof'

  private config: Required<Pick<ZKProverConfig, 'endpoint' | 'timeoutMs'>> & ZKProverConfig

  constructor(config: ZKProverConfig) {
    this.config = {
      ...config,
      timeoutMs: config.timeoutMs ?? 30_000,
    }
  }

  /**
   * Create a commitment — same as Layer A (hash-based).
   * ZK providers can still create commitments for basic equality checks.
   */
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

  /**
   * Verify a commitment — same as Layer A (hash-based).
   */
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
   * Answer a comparison question about an encrypted value
   * without revealing the value itself.
   *
   * Delegates to the external prover service which evaluates
   * the circuit server-side and returns the result with a proof.
   */
  async zkVerify(
    encryptedValue: Uint8Array,
    question: ZKQuestion
  ): Promise<ZKVerification> {
    const fetchFn = this.config.fetch ?? globalThis.fetch

    const body: ProverRequest = {
      encryptedValue: Buffer.from(encryptedValue).toString('base64'),
      operator: question.operator,
      comparand: question.value,
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`
      }

      const response = await fetchFn(`${this.config.endpoint}/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!response.ok) {
        const text = await response.text().catch(() => 'unknown error')
        throw new Error(`Prover service returned ${response.status}: ${text}`)
      }

      const result: ProverResponse = await response.json()

      if (result.error) {
        throw new Error(`Prover error: ${result.error}`)
      }

      return {
        result: result.result,
        proof: result.proof,
        verifiedAt: new Date().toISOString(),
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  // ─── Internal ───

  private computeHash(value: unknown, nonce: Uint8Array): string {
    const canonical = this.canonicalize(value)
    const valueBytes = utf8ToBytes(canonical)
    const combined = new Uint8Array(valueBytes.length + nonce.length)
    combined.set(valueBytes, 0)
    combined.set(nonce, valueBytes.length)
    return bytesToHex(sha256(combined))
  }

  private canonicalize(value: unknown): string {
    if (value === null || value === undefined) return ''
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    return JSON.stringify(value, Object.keys(value as object).sort())
  }
}
