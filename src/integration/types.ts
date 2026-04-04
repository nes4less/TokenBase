/**
 * Integration Layer Type Definitions.
 *
 * Types for the glue that connects MCP ↔ Security ↔ Data.
 */

import type { MCPOperation } from '../mcp/types'
import type { EncryptionConfig } from '../security/types'
import type { z } from 'zod'

// ─── Schema Registry ───

/** A registered model's schema pair. */
export interface ModelSchemaEntry {
  /** Zod schema for create operations. */
  create: z.ZodType
  /** Zod schema for update operations. */
  update: z.ZodType
}

// ─── MCP Request ───

/** An incoming MCP operation request — what an agent or client sends. */
export interface MCPRequest {
  /** The Handshake ID authorizing this request. */
  handshakeId: string
  /** The model being operated on. */
  model: string
  /** The operation to perform. */
  operation: MCPOperation
  /** The record ID (for read, update, softDelete). */
  id?: string
  /** The data payload (for create, update). */
  data?: Record<string, unknown>
  /** Query parameters (for query operations). */
  query?: {
    filters?: Array<{ field: string; operator: string; value: unknown }>
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
    pagination?: { limit: number; offset?: number; cursor?: string }
    fullText?: { query: string; fields?: string[] }
  }
}

/** The result of an MCP operation. */
export interface MCPResponse {
  /** Whether the operation succeeded. */
  ok: boolean
  /** The result data (shape depends on operation). */
  data?: unknown
  /** Error information if ok is false. */
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

// ─── Secure Data Config ───

/** Per-model encryption configuration for the SecureDataService. */
export interface SecureModelConfig {
  /** The collection name. */
  collection: string
  /** Encryption behavior for this model. */
  encryption: EncryptionConfig
}

// ─── Validation Result ───

/** The result of validating data against a Zod schema. */
export interface ValidationResult {
  ok: boolean
  data?: Record<string, unknown>
  errors?: Array<{ path: string; message: string }>
}
