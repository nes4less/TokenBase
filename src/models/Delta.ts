import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'

/**
 * DeltaKind — what type of change this delta represents.
 *
 * 'field'      — a single field changed value
 * 'create'     — an entity came into existence
 * 'archive'    — an entity was archived (CRUBA 'A')
 * 'block'      — an entity was blocked (CRUBA 'B')
 * 'unblock'    — a block was reversed
 * 'restore'    — an archived entity was restored
 * 'merge'      — two or more entities were reconciled (Gondola)
 * 'derive'     — a derived model was created from observation
 * 'branch'     — a version fork occurred
 * 'compound'   — multiple field changes in a single atomic operation
 */
export type DeltaKind =
  | 'field'
  | 'create'
  | 'archive'
  | 'block'
  | 'unblock'
  | 'restore'
  | 'merge'
  | 'derive'
  | 'branch'
  | 'compound'

/**
 * FieldChange — a single field-level mutation within a delta.
 */
export class FieldChange {
  /** The field path (dot-notation for nested, e.g. 'address.city') */
  path: string
  fromValue: string | null
  toValue: string | null
  constructor(data?: Partial<FieldChange>) {
    this.path = data?.path || ''
    this.fromValue = data?.fromValue ?? null
    this.toValue = data?.toValue ?? null
  }
}

/**
 * Delta — the atomic unit of change in the system.
 *
 * Every mutation produces a Delta. Every sync transmits Deltas.
 * Every version is reconstructed from Deltas. Every learning
 * signal observes Deltas.
 *
 * Delta is to the Token graph what a commit is to git: an immutable,
 * attributed, ordered record of what changed. The LogStore is a
 * Delta chain. Gondola reconciliation exchanges Deltas. The
 * improvement pipeline watches Delta streams.
 *
 * Deltas are immutable after creation. They form a hash chain:
 * each Delta's hash includes the previous Delta's hash, creating
 * a tamper-evident audit trail without blockchain overhead.
 *
 * A Delta can be reversed by applying a new Delta with fromValue/toValue
 * swapped. The reversal itself is a Delta — nothing is erased.
 */
export class Delta {
  static collection: string = 'deltas'

  id: string

  /** The entity this delta applies to */
  entityId: string
  entityType: string | null

  /** What kind of change */
  kind: DeltaKind

  /** Who/what authored this change */
  actorId: string | null
  actorType: string | null

  /** The scope in which this change occurred */
  scopeId: string | null

  /** Field-level changes (populated for 'field' and 'compound' kinds) */
  changes: FieldChange[]

  /** Hash of this delta (includes previous hash for chain integrity) */
  hash: string | null

  /** Hash of the previous delta in the chain (null for first delta) */
  previousHash: string | null

  /** The version sequence number within the entity's history */
  sequence: number

  /** Optional reason for the change */
  reason: string | null

  /** For 'merge' kind: the IDs of the deltas being reconciled */
  mergeSourceIds: string[]

  /** For 'branch' kind: the delta ID where the fork occurred */
  branchPointId: string | null

  /** Whether this delta has been transmitted to peers */
  synced: boolean

  /** Whether this delta can be reversed (some operations are one-way) */
  reversible: boolean

  timestamp: string
  metadata: MetadataEntry[]

  constructor(data?: Partial<Delta>) {
    this.id = data?.id || generateUUID()
    this.entityId = data?.entityId || ''
    this.entityType = data?.entityType || null
    this.kind = data?.kind || 'field'
    this.actorId = data?.actorId || null
    this.actorType = data?.actorType || null
    this.scopeId = data?.scopeId || null
    this.changes = data?.changes?.map(c => new FieldChange(c)) || []
    this.hash = data?.hash || null
    this.previousHash = data?.previousHash || null
    this.sequence = data?.sequence ?? 0
    this.reason = data?.reason || null
    this.mergeSourceIds = data?.mergeSourceIds || []
    this.branchPointId = data?.branchPointId || null
    this.synced = data?.synced ?? false
    this.reversible = data?.reversible ?? true
    this.timestamp = data?.timestamp || generateDateString()
    this.metadata = data?.metadata || []
  }
}
