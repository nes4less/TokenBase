import { MetadataEntry } from './Traits'
import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Function — a complete operation definition.
 *
 * Not just CRUD. Encapsulates inputs, outputs, and the transformation
 * between them. Describes what goes in, what comes out, and what happens.
 */
export class Function {
  static collection: string = 'functions'
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  /** Input definitions — what the function accepts */
  inputs: FunctionParam[]
  metadata: MetadataEntry[]
  name: string | null
  /** The operation type: create, read, update, delete, transform, validate, compute, etc. */
  operation: string
  /** Output definitions — what the function produces */
  outputs: FunctionParam[]
  tags: Tag[]
  /** Logic description or reference — what happens between input and output */
  transform: string | null
  updatedAt: string
  constructor(data?: Partial<Function>) {
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.inputs = data?.inputs || []
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.operation = data?.operation || 'transform'
    this.outputs = data?.outputs || []
    this.tags = data?.tags || []
    this.transform = data?.transform || null
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}

/**
 * FunctionParam — an input or output slot on a Function.
 */
export class FunctionParam {
  id: string
  name: string | null
  /** The expected type: string, number, boolean, entity reference, etc. */
  type: string
  required: boolean
  defaultValue: string | null
  description: string | null
  constructor(data?: Partial<FunctionParam>) {
    this.id = data?.id || generateUUID()
    this.name = data?.name || null
    this.type = data?.type || 'string'
    this.required = data?.required ?? false
    this.defaultValue = data?.defaultValue || null
    this.description = data?.description || null
  }
}
