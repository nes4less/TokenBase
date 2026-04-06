import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Module — a composable functional unit.
 *
 * Modules are the building blocks users assemble: UI components,
 * data views, tool configurations, workflow steps. They're typed,
 * named, and can reference presets for default configurations.
 *
 * In TokenLab, Modules flow through the draft → lab → published
 * → marketplace lifecycle.
 */
export class Module extends Entity {
  static collection: string = 'modules'

  blurhash: string | null
  image: string | null
  images: string[]
  metadata: MetadataEntry[]
  name: string | null

  /** Preset configuration identifier */
  preset: string | null

  tags: string[]

  /** Module category */
  type: string | null

  constructor(data?: Partial<Module>) {
    super(data)
    this.blurhash = data?.blurhash || null
    this.image = data?.image || null
    this.images = data?.images || []
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.preset = data?.preset || null
    this.tags = data?.tags || []
    this.type = data?.type || null
  }
}
