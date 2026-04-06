import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Query — a saved, reusable data query.
 *
 * Queries define how to slice the graph: filters, sort order,
 * limits, search terms, layout preferences. They can be
 * public (shared) or private, and optionally hidden from
 * standard listings.
 *
 * Distinct from Filter (which is a single filter predicate)
 * and Sort (which is a single sort directive). Query composes
 * both into a complete retrieval specification.
 */
export class Query extends Entity {
  static collection: string = 'queries'

  filters: Record<string, unknown>[]
  hidden: boolean
  layout: string | null
  limit: number | null
  metadata: MetadataEntry[]
  name: string | null

  /** Saved element positions (for grid/board layouts) */
  positions: Record<string, unknown>

  public: boolean
  scope: string | null
  search: string | null
  sort: Record<string, unknown>

  /** Associated style for rendering results */
  styleId: string | null

  tags: string[]

  constructor(data?: Partial<Query>) {
    super(data)
    this.filters = data?.filters || []
    this.hidden = data?.hidden ?? false
    this.layout = data?.layout || null
    this.limit = data?.limit ?? null
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.positions = data?.positions || {}
    this.public = data?.public ?? false
    this.scope = data?.scope || null
    this.search = data?.search || null
    this.sort = data?.sort || {}
    this.styleId = data?.styleId || null
    this.tags = data?.tags || []
  }
}
