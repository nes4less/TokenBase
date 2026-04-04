import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * Direction of a time term's effect on a reference point.
 */
export type TimeDirection = 'forward' | 'backward'

/**
 * Whether the term represents a relative duration or an absolute point.
 */
export type TimeMode = 'relative' | 'absolute'

/**
 * Unit of time measurement.
 */
export type TimeUnit =
  | 'milliseconds'
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'quarters'
  | 'years'

/**
 * All recognized time term types.
 *
 * Same philosophy as FinancialTermType: by naming every temporal
 * operation, complex scheduling becomes composable named operations
 * instead of raw date math.
 */
export type TimeTermType =
  // Durations — how long something takes or lasts
  | 'duration'       // Generic span of time
  | 'timeout'        // Maximum allowed duration before failure
  | 'cooldown'       // Minimum wait before retry
  | 'warmup'         // Ramp-up period before full operation
  | 'buffer'         // Safety margin added to an estimate
  | 'window'         // Bounded time range during which something is valid
  | 'ttl'            // Time to live — expiration countdown
  // Cadence — how often something repeats
  | 'interval'       // Fixed gap between occurrences
  | 'cadence'        // Regular rhythm (may vary)
  | 'frequency'      // How many times per unit
  | 'recurrence'     // Pattern-based repetition (daily, weekly, cron)
  | 'cycle'          // One complete iteration of a recurring process
  // Scheduling — when something happens
  | 'deadline'       // Must complete by this time
  | 'milestone'      // Target checkpoint
  | 'eta'            // Estimated time of arrival/completion
  | 'schedule'       // Planned execution time
  | 'appointment'    // Reserved time slot
  | 'embargo'        // Cannot act before this time
  // Delays — time added before action
  | 'delay'          // Intentional wait before starting
  | 'debounce'       // Wait for activity to stop before acting
  | 'throttle'       // Minimum gap between actions
  | 'backoff'        // Increasing delay between retries
  | 'lag'            // Unintentional delay / latency
  | 'lead-time'      // Advance notice required
  // Lifecycle — phases of existence
  | 'created'        // When something came into being
  | 'started'        // When execution began
  | 'completed'      // When execution finished
  | 'expired'        // When validity ended
  | 'archived'       // When moved to cold storage
  // Relative references
  | 'since'          // Time elapsed since a reference point
  | 'until'          // Time remaining to a reference point
  | 'ago'            // Looking backward from now
  | 'from-now'       // Looking forward from now
  // Work units
  | 'sprint'         // Fixed-length work iteration
  | 'epoch'          // Reference zero point
  | 'shift'          // Work period within a day
  | 'session'        // Continuous period of activity

/**
 * TimeTerm — a typed, directional temporal operation with semantic meaning.
 *
 * Same pattern as FinancialTerm. Instead of raw date arithmetic,
 * you compose named operations that self-describe their role.
 * A cooldown knows it's a minimum wait. A deadline knows it's a boundary.
 * A backoff knows it increases with each retry.
 *
 * Used by AgentFlow.timeTermId for refresh cadence, by the improvement
 * pipeline for processing intervals, and anywhere time-based logic
 * needs to be explicit rather than implicit.
 */
export class TimeTerm {
  static collection: string = 'time_terms'
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  /** Human-readable description */
  description: string | null
  /** Forward (adds time) or backward (subtracts time) */
  direction: TimeDirection
  id: string
  /** Logic function — cron expression, multiplier rule, etc. */
  logicFunction: string | null
  metadata: MetadataEntry[]
  /** Relative duration or absolute point in time */
  mode: TimeMode
  /** Display name for this instance */
  name: string | null
  /** IDs of other TimeTerms this one is relative to */
  references: string[]
  /** The semantic term type */
  term: TimeTermType
  /** Time unit */
  unit: TimeUnit
  updatedAt: string
  /** The numeric value (duration in units, or epoch timestamp for absolute) */
  value: number
  constructor(data?: Partial<TimeTerm>) {
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.direction = data?.direction || 'forward'
    this.id = data?.id || generateUUID()
    this.logicFunction = data?.logicFunction || null
    this.metadata = data?.metadata || []
    this.mode = data?.mode || 'relative'
    this.name = data?.name || null
    this.references = data?.references || []
    this.term = data?.term || 'duration'
    this.unit = data?.unit || 'seconds'
    this.updatedAt = data?.updatedAt || generateDateString()
    this.value = data?.value ?? 0
  }
}
