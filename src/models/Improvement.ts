import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Processing stage in the improvement pipeline.
 */
export type ImprovementStage =
  | 'raw'         // Unstructured CLI output
  | 'categorized' // Sorted into types (code, commands, questions, plans, errors)
  | 'summarized'  // Condensed within context/scope
  | 'analyzed'    // Detailed patterns, anti-patterns, frequencies
  | 'rule'        // Formulated, actionable, enforceable

/**
 * Category of raw data block.
 */
export type DataCategory =
  | 'code'
  | 'command'
  | 'question'
  | 'plan'
  | 'error'
  | 'output'
  | 'decision'
  | 'observation'
  | 'configuration'
  | 'conversation'
  | 'metric'

/**
 * Improvement — a unit of data moving through the refinement pipeline.
 *
 * Starts as raw CLI output. Gets categorized, summarized within
 * context/scope, analyzed for patterns, and finally distilled into rules.
 * Each stage produces a new Improvement record linked to its source.
 */
export class Improvement {
  static collection: string = 'improvements'
  /** The data category (set at categorized stage) */
  category: DataCategory | null
  /** Content — raw text, summary, analysis, or rule definition */
  content: string
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  id: string
  metadata: MetadataEntry[]
  /** The agent or process that produced this record */
  producerId: string | null
  scopeId: string | null
  /** Which source Improvement(s) this was derived from */
  sourceIds: string[]
  /** Current stage in the pipeline */
  stage: ImprovementStage
  tags: Tag[]
  updatedAt: string
  constructor(data?: Partial<Improvement>) {
    this.category = data?.category || null
    this.content = data?.content || ''
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || []
    this.producerId = data?.producerId || null
    this.scopeId = data?.scopeId || null
    this.sourceIds = data?.sourceIds || []
    this.stage = data?.stage || 'raw'
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
