import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Range — a bounded numeric interval.
 *
 * Ranges define min/max boundaries with units, scoping, and
 * inclusivity. They're polymorphic (attached to any entity)
 * and named for identification.
 *
 * Use cases: age restrictions, price ranges, distance bounds,
 * score thresholds, capacity limits. Any domain concept that
 * has "from X to Y" semantics.
 *
 * Distinct from Scale (which defines magnitude/proportion
 * context with adaptive thresholds). Range is a simple bounded
 * interval; Scale is a dimensional measurement system.
 */
export class Range extends Entity {
  static collection: string = 'ranges'

  description: string | null
  entityId: string | null
  entityType: string | null

  /** Whether min/max are inclusive (default true) */
  inclusive: boolean

  /** The field or dimension this range constrains */
  key: string | null

  max: number | null
  metadata: MetadataEntry[]
  min: number | null
  name: string | null
  scope: string | null
  tags: string[]

  /** Unit of measurement (e.g., 'km', 'USD', 'years') */
  unit: string | null

  constructor(data?: Partial<Range>) {
    super(data)
    this.description = data?.description || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.inclusive = data?.inclusive ?? true
    this.key = data?.key || null
    this.max = data?.max ?? null
    this.metadata = data?.metadata || []
    this.min = data?.min ?? null
    this.name = data?.name || null
    this.scope = data?.scope || null
    this.tags = data?.tags || []
    this.unit = data?.unit || null
  }
}
