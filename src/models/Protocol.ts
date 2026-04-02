import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * ProtocolRule — a single governing rule within a protocol.
 */
export class ProtocolRule {
  id: string
  /** What the rule governs */
  subject: string
  /** The rule statement */
  rule: string
  /** What happens on violation */
  enforcement: string | null
  /** Priority — lower is higher priority */
  priority: number
  /** Whether this rule is mandatory or advisory */
  mandatory: boolean
  metadata: MetadataEntry[]
  constructor(data?: Partial<ProtocolRule>) {
    this.id = data?.id || generateUUID()
    this.subject = data?.subject || ''
    this.rule = data?.rule || ''
    this.enforcement = data?.enforcement || null
    this.priority = data?.priority ?? 0
    this.mandatory = data?.mandatory ?? true
    this.metadata = data?.metadata || []
  }
}

/**
 * Protocol — a set of rules governing how things interact.
 *
 * Communication protocols, security protocols, escalation protocols,
 * approval workflows, API contracts, safety procedures.
 * "How to behave" — the governing rules.
 */
export class Protocol {
  static collection: string = 'protocols'
  id: string
  name: string | null
  description: string | null
  rules: ProtocolRule[]
  /** What entities/interactions this protocol governs */
  appliesTo: string | null
  /** Whether all rules must be followed */
  strict: boolean
  /** Version for protocol evolution */
  version: string | null
  contextId: string | null
  scopeId: string | null
  tags: Tag[]
  createdAt: string
  createdBy: string | null
  updatedAt: string
  deletedAt: string | null
  metadata: MetadataEntry[]
  constructor(data?: Partial<Protocol>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.description = data?.description || null
    this.rules = data?.rules || []
    this.appliesTo = data?.appliesTo || null
    this.strict = data?.strict ?? true
    this.version = data?.version || null
    this.contextId = data?.contextId || null
    this.scopeId = data?.scopeId || null
    this.tags = data?.tags || []
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.updatedAt = data?.updatedAt || generateDateString()
    this.deletedAt = data?.deletedAt || null
    this.metadata = data?.metadata || []
  }
}
