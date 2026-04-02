import { generateDateString, generateUUID } from '../utils'

/**
 * Handshake — mutual agreement protocol.
 *
 * Two or more parties must acknowledge/approve before proceeding.
 * Proposals, approvals, rejections, counters.
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
  metadata: Record<string, string>
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
    this.metadata = data?.metadata || {}
  }
}
