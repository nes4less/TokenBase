import { generateDateString, generateUUID } from '../utils'

/**
 * Note — a polymorphic annotation attached to any entity.
 *
 * Notes are the "sticky note on anything" primitive. Attach
 * commentary, observations, or instructions to any record in
 * the system via the noteableId/noteableType reference.
 *
 * Origin: GameroomKit GKNote (2018).
 */
export class Note {
  static collection: string = 'notes'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  id: string
  /** The note content */
  info: string | null
  metadata: Record<string, string>
  /** The entity this note is attached to */
  noteableId: string | null
  noteableType: string | null
  updatedAt: string
  /** Who wrote this note */
  userId: string | null
  constructor(data?: Partial<Note>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.id = data?.id || generateUUID()
    this.info = data?.info || null
    this.metadata = data?.metadata || {}
    this.noteableId = data?.noteableId || null
    this.noteableType = data?.noteableType || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.userId = data?.userId || null
  }
}
