/**
 * MCP Type Definitions — the type system for TokenBase's Model Context Protocol.
 *
 * Three layers:
 * 1. MCPDefinition — master manifest of all capabilities
 * 2. MCPScope — what a specific handshake grants access to
 * 3. ScopedMCP — the generated, self-contained instance
 *
 * Design Decision: Scoped instances are static artifacts. Unauthorized
 * capabilities don't exist in the output — security by structural absence.
 */

// ─── Operations ───

/** CRUD + query + subscribe — the full operation set any model can support. */
export type MCPOperation =
  | 'create'
  | 'read'
  | 'update'
  | 'softDelete'
  | 'query'
  | 'subscribe'

/** Filter operators available for query operations. */
export type MCPFilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'in'
  | 'notIn'
  | 'between'
  | 'exists'

/** Field access tiers — controls what a scoped instance can see. */
export type FieldAccessTier = 'public' | 'internal' | 'system'

// ─── Model Configuration ───

/** Query capabilities for a model in the master definition. */
export interface MCPQueryCapabilities {
  filters: MCPFilterOperator[]
  sort: boolean
  pagination: boolean
  fullText?: boolean
}

/** Per-model configuration in the master MCP definition. */
export interface MCPModelConfig {
  /** Which collection this model maps to. */
  collection: string
  /** Which CRUD+ operations are available at all. */
  operations: MCPOperation[]
  /** Query capabilities (filters, sort, pagination). */
  queryCapabilities: MCPQueryCapabilities
  /** Named composition recipes this model participates in. */
  compositions: string[]
  /** Reference to the Zod create schema export name. */
  createSchema: string
  /** Reference to the Zod update schema export name. */
  updateSchema: string
  /** Fields grouped by access tier. */
  fieldAccess: Record<FieldAccessTier, string[]>
}

// ─── Master Definition ───

/** A composition recipe — a named multi-model operation. */
export interface MCPRecipe {
  /** Human-readable description. */
  description: string
  /** Which models this recipe touches. */
  models: string[]
  /** Ordered steps in the recipe. */
  steps: MCPRecipeStep[]
}

export interface MCPRecipeStep {
  /** Which model this step operates on. */
  model: string
  /** Which operation. */
  operation: MCPOperation
  /** Human-readable description of this step. */
  description: string
}

/**
 * The master MCP definition — all capabilities, all models.
 * Source of truth for scoped instance generation.
 */
export interface MCPDefinition {
  /** Version of the definition format. */
  version: string
  /** All model configurations, keyed by model name. */
  models: Record<string, MCPModelConfig>
  /** All composition recipes, keyed by recipe name. */
  recipes: Record<string, MCPRecipe>
}

// ─── Scope ───

/** Per-model grant within a scope. */
export interface MCPModelGrant {
  /** Which operations are granted. */
  operations: MCPOperation[]
  /** Which fields are visible. Empty = all fields at the granted tier. */
  fields: string[]
  /** Maximum field access tier granted. Defaults to 'public'. */
  maxTier: FieldAccessTier
}

/** The role of the entity receiving this scope. */
export type MCPScopeRole = 'human' | 'agent' | 'cli' | 'agent-group'

/** The organizational boundary of this scope. */
export type MCPScopeType = 'org' | 'project' | 'environment'

/**
 * What a specific Handshake grants access to.
 * Used as input to generateScopedMCP().
 */
export interface MCPScope {
  /** The Handshake ID this scope is bound to. */
  handshakeId: string
  /** What kind of entity holds this scope. */
  role: MCPScopeRole
  /** Organizational boundary. */
  scopeType: MCPScopeType
  /** ID of the org/project/environment. */
  scopeId: string
  /** Per-model access grants. */
  models: Record<string, MCPModelGrant>
  /** Which composition recipes are available. */
  recipes: string[]
}

// ─── Scoped Instance (Generated Output) ───

/** A model as it appears in a scoped MCP instance. */
export interface ScopedModelConfig {
  collection: string
  operations: MCPOperation[]
  queryCapabilities: MCPQueryCapabilities
  compositions: string[]
  /** Only the fields visible at the granted tier. */
  visibleFields: string[]
  /** JSON Schema for create input (derived from Zod). */
  createInputSchema: Record<string, unknown>
  /** JSON Schema for update input (derived from Zod). */
  updateInputSchema: Record<string, unknown>
}

/**
 * A self-contained MCP instance — the output of generation.
 *
 * This is what an agent or client receives. It doesn't reference
 * the master definition. It doesn't know what it's missing.
 * Unauthorized capabilities don't exist.
 */
export interface ScopedMCP {
  /** The Handshake this instance is bound to. */
  handshakeId: string
  /** When this instance was generated. */
  generatedAt: string
  /** The scope that produced this instance. */
  scope: MCPScope
  /** Models available in this scope. */
  models: Record<string, ScopedModelConfig>
  /** Recipes available in this scope. */
  recipes: Record<string, MCPRecipe>
}

// ─── Tool Definition (MCP Protocol) ───

/**
 * A tool definition compatible with the MCP protocol spec.
 * Each model operation becomes a tool.
 */
export interface MCPToolDefinition {
  /** Tool name in "model.operation" format. */
  name: string
  /** Human-readable description. */
  description: string
  /** JSON Schema for the tool's input. */
  inputSchema: Record<string, unknown>
  /** JSON Schema for the tool's output. */
  outputSchema?: Record<string, unknown>
}
