/**
 * Traits — composable capabilities that models can declare.
 *
 * These are the TypeScript equivalent of GameroomKit's protocol system:
 * GKNameable, GKDescribable, GKIdentifiable, GKIndexable, GKRankable,
 * GKColorable, GKImageable, GKStatusable, GKNoteable, GKChargeable,
 * GKAddressable, GKSaleable.
 *
 * In TypeScript, these are interfaces that models implement.
 * They don't add behavior — they declare capability. Consumers
 * can check for a trait and know what fields are available.
 *
 * Origin: GameroomKit (2017-2019). The composable building blocks.
 */

import { Image } from './Image'

// ─── Identity & Description ───

/** Has a display name. (GKNameable) */
export interface Nameable {
  name: string | null
}

/** Has a secondary name or subtitle. */
export interface Subnameable {
  subname: string | null
}

/** Has a description / info field. (GKDescribable) */
export interface Describable {
  description: string | null
}

/** Has a unique identifier string (SKU, barcode, slug). (GKIdentifiable) */
export interface Identifiable {
  identifier: string | null
}

// ─── Ordering & Position ───

/** Has a position/index for ordering within a collection. (GKIndexable) */
export interface Indexable {
  index: number
}

/** Has a rank for scoring/priority. (GKRankable) */
export interface Rankable {
  rank: number
}

// ─── Presentation ───

/** Has a color for visual display. (GKColorable) */
export interface Colorable {
  color: string | null
}

/** Can have images attached. (GKImageable) */
export interface Imageable {
  images: Image[]
}

// ─── State ───

/** Has a status value. (GKStatusable) */
export interface Statusable {
  status: string
}

/** Can have notes attached. (GKNoteable) */
export interface Noteable {
  notes: string[]
}

// ─── Commerce ───

/** Has a monetary amount. (GKChargeable) */
export interface Chargeable {
  amount: number
}

/** Can be sold as a line item. (GKSaleable) */
export interface Saleable {
  amount: number
  taxable: boolean
}

/** Has a physical address. (GKAddressable) */
export interface Addressable {
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
}

// ─── Metadata ───

/** Classification of a data entry — what kind of data is this. */
export type DataClassification = 'primary' | 'meta' | 'extended' | 'derived' | 'system'

/** A single classified metadata entry. Every entry knows what it is. */
export interface MetadataEntry {
  key: string
  value: string
  classification: DataClassification
}

/** Carries classified metadata. Each entry self-declares primary/meta/extended/derived/system. */
export interface Metadatable {
  metadata: MetadataEntry[]
}

/** Has tags for categorization. */
export interface Taggable {
  tags: { id: string; title: string | null }[]
}

// ─── Polymorphic Reference ───

/** References a polymorphic entity (type + id). */
export interface Polymorphic {
  entityId: string | null
  entityType: string | null
}

// ─── Lifespan ───

/** Has a finite lifespan or consumes itself on use. One-time codes, TTL tokens, limited-use coupons. */
export interface Expirable {
  expiresAt: string | null
  maxUses: number | null
  currentUses: number
  consumeOnRead: boolean
  ttl: number | null
}

// ─── Files ───

/** Can have any file/document attached — type-agnostic. */
export interface Attachable {
  attachments: { id: string; url: string; name: string; type: string; size?: number }[]
}

// ─── Geography ───

/** Has a geographic position with proximity support. */
export interface Locatable {
  latitude: number | null
  longitude: number | null
  altitude: number | null
  accuracy: number | null
  address: string | null
}

// ─── Permissions ───

/** Has visibility/permission control. */
export interface Accessible {
  access: 'public' | 'private' | 'restricted' | 'shared'
  accessConditions: string | null
}

// ─── Provenance ───

/** Declares where data came from. */
export interface Sourceable {
  sourceType: 'crud' | 'derived' | 'observed' | 'inferred' | 'imported' | 'generated' | null
  sourceId: string | null
  sourceParty: 'first' | 'third' | null
}

/** Declares trust level of data. */
export interface Validatable {
  validity: 'verified' | 'unverified' | 'disputed' | 'expired' | null
  confidence: number | null
  validFrom: string | null
  validUntil: string | null
  verifiedBy: string | null
}

// ─── Security ───

/** Carries integrity/security fields. */
export interface Securable {
  hash: string | null
  locked: boolean
  signedBy: string | null
  signatureKey: string | null
}

// ─── Substitution ───

/** Declares that entities can substitute for each other. */
export interface Interchangeable {
  substitutes: { entityId: string; entityType: string | null; compatibility: 'full' | 'partial' | 'conditional'; bidirectional: boolean }[]
}

// ─── Navigation ───

/** Can be navigated to via URL, deep link, or path. */
export interface Linkable {
  url: string | null
  deepLink: string | null
  shortLink: string | null
  apiPath: string | null
}

// ─── Classification ───

/** Root abstract noun classification — what category of existence this entity belongs to. */
export type EntityType = 'person' | 'place' | 'thing' | 'idea' | 'event' | 'location' | 'result' | 'action' | 'state' | 'quantity' | 'rule' | 'signal'

export interface Typeable {
  entityClassification: EntityType | null
}
