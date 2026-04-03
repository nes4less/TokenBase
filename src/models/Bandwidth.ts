import { generateDateString, generateUUID } from '../utils'

/**
 * Cost unit — what resource is being measured.
 */
export type CostUnit =
  | 'tokens'       // LLM token consumption
  | 'ms'           // Wall clock time
  | 'cpu-ms'       // CPU time
  | 'bytes'        // Memory / storage
  | 'calls'        // API / tool calls
  | 'steps'        // Pipeline stages / agent hops
  | 'dollars'      // Monetary cost
  | 'custom'

/**
 * Bandwidth — predicted processing cost for an entity before execution.
 *
 * Attached to anything that consumes resources: tasks, agent flows,
 * queries, builds, prompts. The prediction is made before processing.
 * After execution, a Measurement records the actual cost.
 * The delta between predicted and actual feeds the improvement pipeline.
 *
 * Over time, predictions improve. The system learns what things cost
 * and routes work to the most efficient path.
 */
export class Bandwidth {
  static collection: string = 'bandwidths'
  /** Confidence in this prediction (0-1). Rises with more observations. */
  confidence: number
  createdAt: string
  createdBy: string | null
  /** The entity this prediction is for */
  entityId: string
  /** The entity's collection/type */
  entityType: string | null
  id: string
  metadata: Record<string, string>
  /** Predicted cost value */
  predicted: number
  /** What resource is being predicted */
  unit: CostUnit
  updatedAt: string
  constructor(data?: Partial<Bandwidth>) {
    this.confidence = data?.confidence ?? 0
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.predicted = data?.predicted ?? 0
    this.unit = data?.unit || 'tokens'
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}

/**
 * CostMeasurement — actual observed cost after execution.
 *
 * Paired with a Bandwidth prediction. The delta between
 * predicted and actual is the learning signal.
 */
export class CostMeasurement {
  static collection: string = 'cost_measurements'
  /** Actual cost value */
  actual: number
  /** The Bandwidth prediction this validates (null if no prediction existed) */
  bandwidthId: string | null
  createdAt: string
  /** Delta: actual - predicted. Negative = cheaper than expected. */
  delta: number | null
  /** The entity that was processed */
  entityId: string
  entityType: string | null
  id: string
  metadata: Record<string, string>
  /** What resource was consumed */
  unit: CostUnit
  constructor(data?: Partial<CostMeasurement>) {
    this.actual = data?.actual ?? 0
    this.bandwidthId = data?.bandwidthId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.delta = data?.delta ?? null
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.unit = data?.unit || 'tokens'
  }
}

/**
 * Where the data came from.
 */
export type DataSource =
  | 'human'          // Manual input by a person
  | 'ai-generated'   // Produced by an LLM or agent
  | 'observed'       // Captured automatically from system behavior
  | 'calculated'     // Derived from other data
  | 'imported'       // Brought in from an external system
  | 'unknown'

/**
 * The type of uncertainty risk given the data source.
 */
export type UncertaintyRisk =
  | 'hallucination'  // AI confidently produced something wrong
  | 'fabrication'    // Human intentionally provided false data
  | 'error'          // Human made an honest mistake
  | 'staleness'      // Data was correct when created but may be outdated
  | 'sampling-bias'  // Observation didn't capture the full picture
  | 'propagation'    // Calculated from inputs that may themselves be wrong
  | 'imprecision'    // Value is approximately right but not exact
  | 'none'           // No identified risk

/**
 * Validity — degree of certainty for any claim in the system.
 *
 * Attaches to any record that makes a claim: a bandwidth prediction,
 * a design choice, a bug pattern, a rule, a measurement. Tracks how
 * certain we are based on evidence weight AND where the data came from.
 *
 * AI-generated data risks hallucination. Human input risks error or
 * fabrication. Observed data risks sampling bias. Calculated data
 * compounds the uncertainty of its inputs.
 */
export class Validity {
  static collection: string = 'validities'
  /** How well this fits known/established patterns (0-1) */
  consistency: number
  createdAt: string
  /** The record this validity is for */
  entityId: string
  entityType: string | null
  id: string
  /** Likelihood the claim is accurate given current evidence (0-1) */
  likelihood: number
  metadata: Record<string, string>
  /** Number of observations supporting this */
  observations: number
  /** Ceiling accuracy given the method and source (0-1) */
  potentialAccuracy: number
  /** What type of uncertainty applies given the source */
  risk: UncertaintyRisk
  /** Where did this data come from */
  source: DataSource
  updatedAt: string
  constructor(data?: Partial<Validity>) {
    this.consistency = data?.consistency ?? 0
    this.createdAt = data?.createdAt || generateDateString()
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.id = data?.id || generateUUID()
    this.likelihood = data?.likelihood ?? 0
    this.metadata = data?.metadata || {}
    this.observations = data?.observations ?? 0
    this.potentialAccuracy = data?.potentialAccuracy ?? 1
    this.risk = data?.risk || 'none'
    this.source = data?.source || 'unknown'
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
