import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * How broad the implication of a design choice or bug pattern is.
 */
export type DesignScope =
  | 'element'       // Single component, field, or function
  | 'component'     // A screen, module, or service
  | 'system'        // An entire app or repo
  | 'cross-project' // Affects multiple repos/apps

/**
 * Domain a design choice applies to.
 */
export type DesignDomain =
  | 'api'
  | 'auth'
  | 'data-model'
  | 'infra'
  | 'navigation'
  | 'state'
  | 'ui'
  | 'tooling'
  | 'testing'
  | 'performance'
  | 'security'
  | 'other'

/**
 * Status of a design choice.
 */
export type DesignChoiceStatus =
  | 'active'     // Currently in effect
  | 'superseded' // Replaced by a newer choice
  | 'deferred'   // Postponed for later

/**
 * DesignChoice — a recorded design decision with scope, variants, and preference.
 *
 * Captures the fork in the road: what was decided, how broad the
 * implication is, what the options were, and which is currently preferred.
 * Queryable later when building new apps using the same patterns.
 */
export class DesignChoice {
  static collection: string = 'design_choices'
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  /** Domain this applies to (auth, ui, data-model, etc.) */
  domain: DesignDomain | null
  id: string
  metadata: Record<string, string>
  /** ID of the currently preferred variant */
  preferredVariantId: string | null
  /** Project this choice applies to (null = universal) */
  project: string | null
  /** How broad is the implication? */
  scope: DesignScope
  status: DesignChoiceStatus
  tags: Tag[]
  /** What was decided (short label) */
  title: string
  updatedAt: string
  constructor(data?: Partial<DesignChoice>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.domain = data?.domain || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.preferredVariantId = data?.preferredVariantId || null
    this.project = data?.project || null
    this.scope = data?.scope || 'component'
    this.status = data?.status || 'active'
    this.tags = data?.tags || []
    this.title = data?.title || ''
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}

/**
 * ChoiceVariant — one option considered for a design choice.
 *
 * Each variant describes an alternative with tradeoffs.
 * The parent DesignChoice points to the preferred one.
 */
export class ChoiceVariant {
  static collection: string = 'choice_variants'
  /** Parent design choice ID */
  choiceId: string
  createdAt: string
  description: string | null
  id: string
  /** Is this the one currently in use? */
  isCurrent: boolean
  metadata: Record<string, string>
  /** Freeform notes (e.g. "tried this, broke X") */
  notes: string | null
  /** Short label for this option */
  title: string
  constructor(data?: Partial<ChoiceVariant>) {
    this.choiceId = data?.choiceId || ''
    this.createdAt = data?.createdAt || generateDateString()
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.isCurrent = data?.isCurrent ?? false
    this.metadata = data?.metadata || {}
    this.notes = data?.notes || null
    this.title = data?.title || ''
  }
}
