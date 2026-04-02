import { generateDateString, generateUUID } from '../utils'

/**
 * Status values — comprehensive lifecycle states.
 *
 * Unified from GameroomKit's GKStatus.Status + GKLine.Status + GKTimecard.Status.
 * Covers order lifecycle, fulfillment, repair workflow, and time tracking.
 */
export type StatusValue =
  // General lifecycle
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'faulted'
  | 'hold'
  // Financial
  | 'paid'
  | 'refunded'
  | 'returned'
  // Fulfillment
  | 'pickedUp'
  | 'shipped'
  | 'purchasing'
  | 'ordered'
  | 'picked'
  | 'packed'
  // Repair / service
  | 'quoted'
  | 'received'
  | 'partsOrdered'
  | 'partsReceived'
  | 'repaired'
  | 'readyForPickup'
  // Time tracking
  | 'started'
  | 'ended'
  | 'corrected'
  | 'approved'
  | 'declined'
  // Inventory
  | 'audited'
  | 'sold'
  | 'damaged'
  | 'inactive'
  // Custom
  | string

/**
 * StatusChange — a timestamped, polymorphic status entry.
 *
 * Attaches to any entity via statusableId/statusableType.
 * Records who changed the status and when. Build a full
 * status history by collecting all StatusChanges for an entity.
 *
 * Origin: GameroomKit GKStatus (2019).
 */
export class StatusChange {
  static collection: string = 'status_changes'
  createdAt: string
  id: string
  metadata: Record<string, string>
  /** The new status value */
  status: StatusValue
  /** The entity this status applies to */
  statusableId: string | null
  statusableType: string | null
  /** Who changed the status */
  userId: string | null
  constructor(data?: Partial<StatusChange>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.status = data?.status || 'pending'
    this.statusableId = data?.statusableId || null
    this.statusableType = data?.statusableType || null
    this.userId = data?.userId || null
  }
}
