import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import type { KeyAlgorithm } from '../security/types'

/**
 * Handshake — mutual agreement protocol with key agreement.
 *
 * Two or more parties must acknowledge/approve before proceeding.
 * Proposals, approvals, rejections, counters.
 *
 * When approved, ephemeral key pairs establish a shared secret via ECDH.
 * The shared secret derives scope-level encryption keys through HKDF.
 * When broken, private keys are deleted — shared secret is unrecoverable.
 */

export type HandshakeStatus = 'pending' | 'approved' | 'rejected' | 'countered' | 'expired' | 'cancelled'

export class Handshake {
  static collection: string = 'handshakes'
  id: string
  /** What action/entity this handshake is about */
  action: string
  entityId: string | null
  entityType: string | null
  /** Who initiated */
  initiatorId: string | null
  /** All parties involved */
  parties: string[]
  /** Who has agreed so far */
  agreedBy: string[]
  /** Who has rejected */
  rejectedBy: string[]
  status: HandshakeStatus
  /** Whether all parties must agree (true) or any one (false) */
  unanimous: boolean
  message: string | null
  /** Proposed changes (key → { from, to }) */
  changes: Record<string, { from: string | null; to: string | null }>
  createdAt: string
  resolvedAt: string | null
  expiresAt: string | null
  metadata: MetadataEntry[]

  // ─── Key Agreement Fields (Phase 2b) ───

  /** Public key of the initiator (ephemeral, per-handshake, base64). */
  initiatorPublicKey: string | null
  /** Public keys of each party (map: partyId → base64-encoded public key). */
  partyPublicKeys: Record<string, string>
  /** SHA-256 fingerprint of the derived shared key. */
  keyFingerprint: string | null
  /** Encryption algorithm for this handshake's scope. */
  keyAlgorithm: KeyAlgorithm
  /** When the derived key was last rotated. */
  keyRotatedAt: string | null

  constructor(data?: Partial<Handshake>) {
    this.id = data?.id || generateUUID()
    this.action = data?.action || ''
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.initiatorId = data?.initiatorId || null
    this.parties = data?.parties || []
    this.agreedBy = data?.agreedBy || []
    this.rejectedBy = data?.rejectedBy || []
    this.status = data?.status || 'pending'
    this.unanimous = data?.unanimous ?? true
    this.message = data?.message || null
    this.changes = data?.changes || {}
    this.createdAt = data?.createdAt || generateDateString()
    this.resolvedAt = data?.resolvedAt || null
    this.expiresAt = data?.expiresAt || null
    this.metadata = data?.metadata || []

    // Key agreement
    this.initiatorPublicKey = data?.initiatorPublicKey || null
    this.partyPublicKeys = data?.partyPublicKeys || {}
    this.keyFingerprint = data?.keyFingerprint || null
    this.keyAlgorithm = data?.keyAlgorithm || 'xchacha20-poly1305'
    this.keyRotatedAt = data?.keyRotatedAt || null
  }
}
