import { generateDateString, generateUUID } from '../utils'

/**
 * Timecard status values.
 */
export type TimecardStatus = 'started' | 'ended' | 'corrected' | 'approved' | 'declined'

/**
 * Timecard — a work session record for time tracking.
 *
 * Records clock-in/clock-out with optional corrections.
 * Status tracks the approval workflow: started → ended → approved/declined.
 * Corrections override the original times when adjustments are needed.
 *
 * Origin: GameroomKit GKTimecard (2018).
 */
export class Timecard {
  static collection: string = 'timecards'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  /** Corrected end time (overrides endedAt when present) */
  endedCorrection: string | null
  endedAt: string | null
  id: string
  info: string | null
  metadata: Record<string, string>
  /** Corrected start time (overrides startedAt when present) */
  startedCorrection: string | null
  startedAt: string
  status: TimecardStatus
  updatedAt: string
  /** The user this timecard belongs to */
  userId: string | null
  constructor(data?: Partial<Timecard>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.endedCorrection = data?.endedCorrection || null
    this.endedAt = data?.endedAt || null
    this.id = data?.id || generateUUID()
    this.info = data?.info || null
    this.metadata = data?.metadata || {}
    this.startedCorrection = data?.startedCorrection || null
    this.startedAt = data?.startedAt || generateDateString()
    this.status = data?.status || 'started'
    this.updatedAt = data?.updatedAt || generateDateString()
    this.userId = data?.userId || null
  }

  /** Effective start time — uses correction if present */
  get effectiveStart(): string {
    return this.startedCorrection || this.startedAt
  }

  /** Effective end time — uses correction if present */
  get effectiveEnd(): string | null {
    return this.endedCorrection || this.endedAt
  }
}
