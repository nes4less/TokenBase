import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Organization — a named group with governance.
 *
 * Organizations are the structural unit above Person: companies,
 * teams, clubs, leagues. They own resources, define scopes, and
 * carry their own identity (name, slug, branding).
 *
 * Distinct from Group (which is a lightweight collection).
 * Organizations have identity, branding, and domain ownership.
 * Groups are just sets of entities.
 */
export class Organization extends Entity {
  static collection: string = 'organizations'

  blurhash: string | null
  color: string | null
  customDomain: string | null
  image: string | null
  images: string[]
  metadata: MetadataEntry[]
  name: string | null
  slug: string | null
  subdomain: string | null
  tags: string[]

  constructor(data?: Partial<Organization>) {
    super(data)
    this.blurhash = data?.blurhash || null
    this.color = data?.color || null
    this.customDomain = data?.customDomain || null
    this.image = data?.image || null
    this.images = data?.images || []
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.slug = data?.slug || null
    this.subdomain = data?.subdomain || null
    this.tags = data?.tags || []
  }
}
