import type {
  MCPDefinition,
  MCPScope,
  ScopedMCP,
  ScopedModelConfig,
  MCPRecipe,
  MCPOperation,
  FieldAccessTier,
} from './types'

/**
 * Generate a scoped MCP instance from the master definition.
 *
 * Pure function — no side effects, fully testable.
 *
 * The output is a self-contained artifact. It doesn't reference the master.
 * Unauthorized capabilities don't exist in the output — security by
 * structural absence.
 *
 * @param master - The master MCP definition (all capabilities)
 * @param scope - What this Handshake grants access to
 * @param schemaResolver - Function that resolves schema names to JSON Schema objects
 */
export function generateScopedMCP(
  master: MCPDefinition,
  scope: MCPScope,
  schemaResolver?: (schemaName: string) => Record<string, unknown>
): ScopedMCP {
  const models: Record<string, ScopedModelConfig> = {}
  const recipes: Record<string, MCPRecipe> = {}

  // 1. Filter models to only those in scope
  for (const [modelName, grant] of Object.entries(scope.models)) {
    const masterModel = master.models[modelName]
    if (!masterModel) continue // Model doesn't exist in master — skip

    // 2. Filter operations to only those granted AND available in master
    const grantedOps = grant.operations.filter(
      (op): op is MCPOperation => masterModel.operations.includes(op)
    )
    if (grantedOps.length === 0) continue // No valid operations — skip model

    // 3. Filter fields by tier
    const visibleFields = resolveVisibleFields(masterModel.fieldAccess, grant.maxTier, grant.fields)

    // 4. Filter compositions to only those in scope
    const grantedCompositions = masterModel.compositions.filter(
      c => scope.recipes.includes(c)
    )

    // 5. Resolve schemas
    const noopSchema: Record<string, unknown> = { type: 'object' }
    const createInputSchema = schemaResolver
      ? schemaResolver(masterModel.createSchema)
      : noopSchema
    const updateInputSchema = schemaResolver
      ? schemaResolver(masterModel.updateSchema)
      : noopSchema

    models[modelName] = {
      collection: masterModel.collection,
      operations: grantedOps,
      queryCapabilities: masterModel.queryCapabilities,
      compositions: grantedCompositions,
      visibleFields,
      createInputSchema,
      updateInputSchema,
    }
  }

  // 6. Filter recipes to only those in scope AND whose models are all in scope
  for (const recipeName of scope.recipes) {
    const masterRecipe = master.recipes[recipeName]
    if (!masterRecipe) continue

    // Every model in the recipe must be in the scoped models
    const allModelsAvailable = masterRecipe.models.every(m => models[m])
    if (!allModelsAvailable) continue

    // Filter steps to only those whose model+operation is granted
    const validSteps = masterRecipe.steps.filter(step => {
      const scopedModel = models[step.model]
      return scopedModel && scopedModel.operations.includes(step.operation)
    })

    if (validSteps.length === 0) continue

    recipes[recipeName] = {
      description: masterRecipe.description,
      models: masterRecipe.models.filter(m => models[m]),
      steps: validSteps,
    }
  }

  return {
    handshakeId: scope.handshakeId,
    generatedAt: new Date().toISOString(),
    scope,
    models,
    recipes,
  }
}

/**
 * Resolve visible fields based on the granted tier and any explicit field list.
 *
 * Tier hierarchy: system > internal > public
 * A grant of 'internal' includes all public + internal fields.
 * A grant of 'system' includes everything.
 *
 * If the grant specifies explicit fields, those are intersected with
 * the tier-visible set.
 */
function resolveVisibleFields(
  fieldAccess: Record<FieldAccessTier, string[]>,
  maxTier: FieldAccessTier,
  explicitFields: string[]
): string[] {
  const tierOrder: FieldAccessTier[] = ['public', 'internal', 'system']
  const maxIndex = tierOrder.indexOf(maxTier)

  // Collect all fields up to and including the granted tier
  const tierVisible: string[] = []
  for (let i = 0; i <= maxIndex; i++) {
    tierVisible.push(...(fieldAccess[tierOrder[i]] || []))
  }

  // If explicit fields are specified, intersect with tier-visible
  if (explicitFields.length > 0) {
    const tierSet = new Set(tierVisible)
    return explicitFields.filter(f => tierSet.has(f))
  }

  return tierVisible
}
