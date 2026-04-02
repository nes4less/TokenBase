import { generateDateString, generateUUID } from '../utils'
import { Image } from './Image'

/**
 * Container status types.
 */
export type ContainerStatusValue = 'active' | 'inactive' | 'pending' | 'vacancy' | 'noVacancy'

/**
 * ContainerStatus — timestamped status entry for tracking container state.
 */
export class ContainerStatus {
  createdAt: string
  id: string
  value: ContainerStatusValue
  constructor(data?: Partial<ContainerStatus>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.id = data?.id || generateUUID()
    this.value = data?.value || 'pending'
  }
}

/**
 * Container — a physical storage location for inventory.
 *
 * Boxes, bins, pallets, shelves, warehouses — any physical thing
 * that holds units. Containers have status tracking (vacancy, active)
 * and can be assigned to users.
 *
 * Origin: CashierFu inventory system.
 */
export class Container {
  static collection: string = 'containers'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  images: Image[]
  metadata: Record<string, string>
  sku: string | null
  statuses: ContainerStatus[]
  subtitle: string | null
  title: string | null
  updatedAt: string
  constructor(data?: Partial<Container>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.images = data?.images?.map(i => new Image(i)) || []
    this.metadata = data?.metadata || {}
    this.sku = data?.sku || null
    this.statuses = data?.statuses?.map(s => new ContainerStatus(s)) || []
    this.subtitle = data?.subtitle || null
    this.title = data?.title || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
