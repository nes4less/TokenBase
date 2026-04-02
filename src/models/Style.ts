import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Target format for style output.
 */
export type StyleTarget =
  | 'plain'       // Raw text, no formatting
  | 'print'       // Print-ready (PDF, paper)
  | 'markup'      // HTML/rich text
  | 'markdown'    // Markdown
  | 'linked'      // Hyperlinked/interactive
  | 'csv'         // Tabular export
  | 'json'        // Structured data
  | 'label'       // Physical label (barcode, price tag)
  | 'receipt'     // Receipt/invoice format
  | 'card'        // UI card rendering
  | 'summary'     // Condensed overview

/**
 * StyleField — maps a model field to a formatted output slot.
 */
export class StyleField {
  id: string
  /** The source field path (e.g. "name", "price.value", "identifiers[0].value") */
  source: string
  /** Display label for this field */
  label: string | null
  /** Format string or transform (e.g. "$%.2f", "uppercase", "date:short") */
  format: string | null
  /** Position in the output */
  position: number
  /** Whether to include this field in the output */
  visible: boolean
  /** Link template (for 'linked' target) — e.g. "/products/{id}" */
  link: string | null
  constructor(data?: Partial<StyleField>) {
    this.id = data?.id || generateUUID()
    this.source = data?.source || ''
    this.label = data?.label || null
    this.format = data?.format || null
    this.position = data?.position ?? 0
    this.visible = data?.visible ?? true
    this.link = data?.link || null
  }
}

/**
 * Style — a presentation template that flattens model data into a target format.
 *
 * One model, many output shapes. Define declaratively how to form
 * the data for different endpoints — print, markup, linked, plain, label, etc.
 * No per-endpoint custom code. Just declare the shape once.
 */
export class Style {
  static collection: string = 'styles'
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  /** The entity type or collection this style applies to */
  entityType: string | null
  /** The field mappings that define the output shape */
  fields: StyleField[]
  id: string
  metadata: Record<string, string>
  name: string | null
  tags: Tag[]
  /** The output format target */
  target: StyleTarget
  /** Optional template string for complex layouts (uses {fieldId} placeholders) */
  template: string | null
  updatedAt: string
  constructor(data?: Partial<Style>) {
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.entityType = data?.entityType || null
    this.fields = data?.fields || []
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.name = data?.name || null
    this.tags = data?.tags || []
    this.target = data?.target || 'plain'
    this.template = data?.template || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
