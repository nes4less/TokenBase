import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * ScaleDimension — what axis this scale measures along.
 *
 * 'magnitude'   — raw size/amount (how much)
 * 'frequency'   — how often something occurs
 * 'complexity'  — structural complexity of an operation or entity
 * 'trust'       — trust level in an agent, user, or data source
 * 'cost'        — resource cost (pairs with Bandwidth)
 * 'priority'    — urgency/importance ranking
 * 'reach'       — how far something propagates (local → global)
 * 'granularity' — level of detail (coarse → fine)
 * 'sensitivity' — data classification level
 * 'custom'      — user-defined dimension
 */
export type ScaleDimension =
  | 'magnitude'
  | 'frequency'
  | 'complexity'
  | 'trust'
  | 'cost'
  | 'priority'
  | 'reach'
  | 'granularity'
  | 'sensitivity'
  | 'custom'

/**
 * ScaleBound — a named threshold on a scale.
 *
 * Scales are continuous, but operations need discrete breakpoints.
 * A bound is a labeled point on the scale that triggers different
 * behavior above vs below it.
 */
export class ScaleBound {
  /** Name of this threshold (e.g. 'low', 'medium', 'high', 'critical') */
  label: string
  /** The numeric threshold value */
  value: number
  /** What happens when this bound is crossed (optional — can be a functionId) */
  action: string | null
  constructor(data?: Partial<ScaleBound>) {
    this.label = data?.label || ''
    this.value = data?.value ?? 0
    this.action = data?.action || null
  }
}

/**
 * Scale — magnitude, proportion, and range context for any entity.
 *
 * In a topology-based system, "how much" is as fundamental as "what"
 * and "where." Scale defines the meaningful range for an entity or
 * operation, with named thresholds that trigger different behavior.
 *
 * Use cases:
 * - Bandwidth throttling: Scale defines what magnitude of operation
 *   triggers rate limiting, queuing, or rejection.
 * - Agent trust: Trust operates at different scales — a new agent
 *   has narrow scale (can do little), a proven agent has wide scale.
 * - Financial terms: Transaction scale affects terms, fees, approval.
 * - Analytics: What's the meaningful range for this metric?
 *   A 1% change in a global metric is massive; in a user metric, noise.
 * - Drill pattern: Each layer operates at a different scale of concern.
 * - Grid layout: Spatial scale determines tile size, zoom level, detail.
 *
 * Scale is relative, not absolute. A Scale attached to a Scope defines
 * "how much matters here." The same entity can have different Scales
 * in different Scopes — a $100 transaction is routine in a business
 * scope but exceptional in a personal scope.
 */
export class Scale {
  static collection: string = 'scales'

  id: string

  /** The entity this scale applies to */
  entityId: string
  entityType: string | null

  /** What axis this measures */
  dimension: ScaleDimension

  /** Custom dimension name (when dimension is 'custom') */
  customDimension: string | null

  /** The scope in which this scale applies (null = universal) */
  scopeId: string | null

  /** Lower bound of the meaningful range */
  min: number

  /** Upper bound of the meaningful range */
  max: number

  /** Current position on the scale (null if scale defines range only) */
  current: number | null

  /** Named thresholds within the range */
  bounds: ScaleBound[]

  /** Unit label (e.g. 'requests/sec', 'USD', 'trust-score', 'nodes') */
  unit: string | null

  /** Whether this scale adapts over time based on observations */
  adaptive: boolean

  /** Rate of adaptation (0 = static, 1 = fully reactive). Ignored if !adaptive */
  adaptRate: number

  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: MetadataEntry[]

  constructor(data?: Partial<Scale>) {
    this.id = data?.id || generateUUID()
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.dimension = data?.dimension || 'magnitude'
    this.customDimension = data?.customDimension || null
    this.scopeId = data?.scopeId || null
    this.min = data?.min ?? 0
    this.max = data?.max ?? 100
    this.current = data?.current ?? null
    this.bounds = data?.bounds?.map(b => new ScaleBound(b)) || []
    this.unit = data?.unit || null
    this.adaptive = data?.adaptive ?? false
    this.adaptRate = data?.adaptRate ?? 0
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.deletedAt = data?.deletedAt || null
    this.metadata = data?.metadata || []
  }
}
