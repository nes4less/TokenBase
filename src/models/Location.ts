import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Location — a spatial position in physical or virtual space.
 *
 * Locations are polymorphic (attached to any entity) and support
 * both geographic (lat/lng/alt) and abstract (x/y/z) coordinates.
 * Indoor positioning (floor, zone) and path-based addressing
 * are first-class.
 *
 * Note: the Locatable trait (in Traits) provides lat/lng/alt/address
 * as a composable mixin. This model is for standalone location
 * entities that exist as their own nodes in the graph.
 */
export class Location extends Entity {
  static collection: string = 'locations'

  address: string | null
  altitude: number | null
  description: string | null
  entityId: string | null
  entityType: string | null
  floor: number | null
  indoor: boolean
  latitude: number | null
  longitude: number | null
  metadata: MetadataEntry[]
  name: string | null

  /** Hierarchical path (e.g., 'building/floor/room') */
  path: string | null

  tags: string[]

  /** Abstract coordinates for non-geographic spaces */
  x: number | null
  y: number | null
  z: number | null

  /** Named zone or region */
  zone: string | null

  constructor(data?: Partial<Location>) {
    super(data)
    this.address = data?.address || null
    this.altitude = data?.altitude ?? null
    this.description = data?.description || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.floor = data?.floor ?? null
    this.indoor = data?.indoor ?? false
    this.latitude = data?.latitude ?? null
    this.longitude = data?.longitude ?? null
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.path = data?.path || null
    this.tags = data?.tags || []
    this.x = data?.x ?? null
    this.y = data?.y ?? null
    this.z = data?.z ?? null
    this.zone = data?.zone || null
  }
}
