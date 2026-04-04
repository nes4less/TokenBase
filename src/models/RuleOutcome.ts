import { generateDateString, generateUUID } from '../utils'

/**
 * What happened when a rule was tested against reality.
 */
export type OutcomeType =
  | 'followed'    // Agent or human followed the rule
  | 'violated'    // Rule was ignored or contradicted
  | 'prevented'   // The rule prevented a known problem
  | 'recurred'    // The problem the rule addresses happened again
  | 'overridden'  // Rule was explicitly superseded
  | 'retired'     // Rule no longer applies

/**
 * RuleOutcome — evidence of a rule's real-world effect.
 *
 * Links a rule (design choice or bug pattern) to what happened
 * when it met reality. Did agents follow it? Did the problem
 * recur? Was it overridden?
 *
 * Outcomes update the rule's effectiveness score:
 * - followed/prevented → effectiveness rises
 * - violated/recurred → effectiveness drops
 * - overridden/retired → rule lifecycle ends
 */
export class RuleOutcome {
  static collection: string = 'rule_outcomes'
  createdAt: string
  /** What happened */
  description: string | null
  /** The improvement or task that triggered this outcome */
  evidenceId: string | null
  evidenceType: string | null
  id: string
  metadata: Record<string, string>
  /** Which device/agent observed this */
  observedBy: string | null
  /** What happened */
  outcomeType: OutcomeType
  /** The rule being tracked */
  ruleId: string
  /** 'design_choice' or 'bug_pattern' */
  ruleType: string
  constructor(data?: Partial<RuleOutcome>) {
    this.createdAt = data?.createdAt || generateDateString()
    this.description = data?.description || null
    this.evidenceId = data?.evidenceId || null
    this.evidenceType = data?.evidenceType || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.observedBy = data?.observedBy || null
    this.outcomeType = data?.outcomeType || 'followed'
    this.ruleId = data?.ruleId || ''
    this.ruleType = data?.ruleType || 'design_choice'
  }
}
