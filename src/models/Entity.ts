import { generateDateString, generateUUID } from '../utils'

/**
 * Entity — the universal base for all storable records.
 *
 * Every model in the system carries these fields. This is the
 * TypeScript equivalent of GameroomKit's GKStorable + GKTimestampable.
 *
 * Not a class you instantiate directly — use it as a base for
 * concrete models, or implement the interface on your own classes.
 *
 * Origin: GameroomKit (2017). The foundation everything else builds on.
 */
export interface IEntity {
  id: string
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  updatedAt: string
}

/**
 * Entity base class — concrete implementation of IEntity.
 *
 * Extend this for any storable model. Provides id, timestamps,
 * createdBy, and soft-delete out of the box.
 */
export class Entity implements IEntity {
  id: string
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  updatedAt: string
  constructor(data?: Partial<Entity>) {
    this.id = data?.id || generateUUID()
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
