import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * TimeTerm — typed directional time operation.
 *
 * Same pattern as FinancialTerm but for time. Composable named
 * operations instead of raw date math.
 */

export type TimeDirection = 'extend' | 'reduce'
export type TimeMagnitude = 'absolute' | 'relative'

export type TimeTermType =
  | 'deadline'
  | 'duration'
  | 'extension'
  | 'delay'
  | 'buffer'
  | 'window'
  | 'blackout'
  | 'cooldown'
  | 'expiration'
  | 'renewal'
  | 'grace'
  | 'overtime'
  | 'leadTime'
  | 'lag'
  | 'sprint'
  | 'milestone'
  | 'cadence'
  | 'cap'
  | 'floor'
  | 'ttl'
  | 'retention'
  | 'embargo'
  | 'countdown'
  | 'interval'
  | 'schedule'

export class TimeTerm {
  static collection: string = 'time_terms'
  id: string
  term: TimeTermType
  direction: TimeDirection
  magnitudeType: TimeMagnitude
  /** Value in milliseconds (absolute) or multiplier (relative) */
  value: number
  /** Other TimeTerms this is relative to */
  references: string[]
  /** Logic description */
  logicFunction: string | null
  contextId: string | null
  name: string | null
  description: string | null
  createdAt: string
  updatedAt: string
  metadata: MetadataEntry[]
  constructor(data?: Partial<TimeTerm>) {
    this.id = data?.id || generateUUID()
    this.term = data?.term || 'duration'
    this.direction = data?.direction || 'extend'
    this.magnitudeType = data?.magnitudeType || 'absolute'
    this.value = data?.value ?? 0
    this.references = data?.references || []
    this.logicFunction = data?.logicFunction || null
    this.contextId = data?.contextId || null
    this.name = data?.name || null
    this.description = data?.description || null
    this.createdAt = data?.createdAt || generateDateString()
    this.updatedAt = data?.updatedAt || generateDateString()
    this.metadata = data?.metadata || []
  }
}
