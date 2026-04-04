/**
 * Schema Registry — maps model names to their Zod schemas.
 *
 * The bridge between MCP model names and Zod validation.
 * Register schemas at startup, then validate at the MCP boundary.
 */

import type { z } from 'zod'
import type { ModelSchemaEntry, ValidationResult } from './types'

export class SchemaRegistry {
  private schemas = new Map<string, ModelSchemaEntry>()

  /** Register a model's create and update schemas. */
  register(model: string, entry: ModelSchemaEntry): void {
    this.schemas.set(model, entry)
  }

  /** Register multiple models at once. */
  registerAll(entries: Record<string, ModelSchemaEntry>): void {
    for (const [model, entry] of Object.entries(entries)) {
      this.schemas.set(model, entry)
    }
  }

  /** Check if a model has registered schemas. */
  has(model: string): boolean {
    return this.schemas.has(model)
  }

  /** Get the raw schema entry for a model. */
  get(model: string): ModelSchemaEntry | undefined {
    return this.schemas.get(model)
  }

  /** Validate data against a model's create schema. */
  validateCreate(model: string, data: unknown): ValidationResult {
    return this.validate(model, 'create', data)
  }

  /** Validate data against a model's update schema. */
  validateUpdate(model: string, data: unknown): ValidationResult {
    return this.validate(model, 'update', data)
  }

  /** Convert a Zod schema to JSON Schema (for MCP tool definitions). */
  toJsonSchema(model: string, type: 'create' | 'update'): Record<string, unknown> {
    const entry = this.schemas.get(model)
    if (!entry) return { type: 'object' }

    const schema = type === 'create' ? entry.create : entry.update
    // Zod v4 supports .toJSONSchema() — if not available, fall back to basic shape
    if ('toJSONSchema' in schema && typeof schema.toJSONSchema === 'function') {
      return (schema as z.ZodType & { toJSONSchema: () => Record<string, unknown> }).toJSONSchema()
    }
    return { type: 'object' }
  }

  /** Get all registered model names. */
  models(): string[] {
    return Array.from(this.schemas.keys())
  }

  // ─── Internal ───

  private validate(model: string, type: 'create' | 'update', data: unknown): ValidationResult {
    const entry = this.schemas.get(model)
    if (!entry) {
      return { ok: false, errors: [{ path: '', message: `No schema registered for model: ${model}` }] }
    }

    const schema = type === 'create' ? entry.create : entry.update
    const result = schema.safeParse(data)

    if (result.success) {
      return { ok: true, data: result.data as Record<string, unknown> }
    }

    const errors = result.error.issues.map((issue) => ({
      path: issue.path.map(String).join('.'),
      message: issue.message,
    }))

    return { ok: false, errors }
  }
}
