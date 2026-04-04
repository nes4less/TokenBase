import type { Commitment, CommitmentVerification, ZKQuestion, ZKVerification } from '../types'

/**
 * IProofProvider — interface for proof systems.
 *
 * Two layers:
 * - Layer A (commitments): Local hash-based proofs. Always available,
 *   no server needed. Uses @noble/hashes.
 * - Layer B (ZK): Server-mediated zero-knowledge proofs. Both parties
 *   send encrypted inputs to a prover service. Neither sees the other's data.
 *
 * Models declare `static proofLevel = 'commitment' | 'zk'` to opt in.
 * The system picks the appropriate provider at runtime.
 */
export interface IProofProvider {
  /** Provider name for logging/diagnostics. */
  readonly name: string

  /**
   * Create a commitment for a value.
   * commit(value, nonce) → hash. The nonce prevents rainbow table attacks.
   */
  commit(
    entityId: string,
    field: string,
    value: unknown,
    nonce: Uint8Array
  ): Promise<Commitment>

  /**
   * Verify a candidate value against an existing commitment.
   * Returns true if hash(candidate + nonce) matches the commitment.
   */
  verify(
    commitment: Commitment,
    candidateValue: unknown,
    nonce: Uint8Array
  ): Promise<CommitmentVerification>

  /**
   * Answer a comparison question about an encrypted value
   * without revealing the value itself.
   *
   * Layer A: Not supported (throws). Commitments can only do equality.
   * Layer B: Server evaluates the circuit and returns proof + result.
   */
  zkVerify?(
    encryptedValue: Uint8Array,
    question: ZKQuestion
  ): Promise<ZKVerification>
}
