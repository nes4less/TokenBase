import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'
import type { DesignDomain, DesignScope } from './DesignChoice'

/**
 * Severity of a bug pattern.
 */
export type BugSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

/**
 * BugPattern — a preventable issue captured for automatic rule generation.
 *
 * Records what went wrong, why, and what rule would prevent it.
 * Feeds into the improvement pipeline — when a pattern gets refined
 * into a rule, the ruleId links back to the resulting Improvement record.
 */
export class BugPattern {
  static collection: string = 'bug_patterns'
  /** Root cause */
  cause: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  /** Full description of the bug */
  description: string | null
  /** Domain (auth, navigation, data-model, etc.) */
  domain: DesignDomain | null
  id: string
  metadata: Record<string, string>
  /** How many times has this been seen? */
  occurrences: number
  /** What rule or check would prevent this */
  prevention: string | null
  /** Project this applies to (null = universal) */
  project: string | null
  /** Links to generated Improvement rule ID */
  ruleId: string | null
  /** How broad: same scope as DesignChoice */
  scope: DesignScope
  severity: BugSeverity
  tags: Tag[]
  /** What happened (short label) */
  title: string
  updatedAt: string
  constructor(data?: Partial<BugPattern>) {
    this.cause = data?.cause || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.domain = data?.domain || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.occurrences = data?.occurrences ?? 1
    this.prevention = data?.prevention || null
    this.project = data?.project || null
    this.ruleId = data?.ruleId || null
    this.scope = data?.scope || 'component'
    this.severity = data?.severity || 'medium'
    this.tags = data?.tags || []
    this.title = data?.title || ''
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
