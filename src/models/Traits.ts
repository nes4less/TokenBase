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

/** Carries arbitrary key-value metadata. */
export interface Metadatable {
  metadata: Record<string, string>
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
