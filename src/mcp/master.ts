import type { MCPDefinition, MCPModelConfig, MCPOperation, MCPQueryCapabilities } from './types'

/**
 * Master MCP Definition — all capabilities, all models.
 *
 * This is the source of truth for scoped instance generation.
 * Every storable model in TokenBase is registered here with its
 * available operations, query capabilities, and field access tiers.
 *
 * Models without `static collection` (embeddable sub-types like
 * Tag, Image, Sort, Filter) are not registered — they appear as
 * nested fields within their parent models.
 */

// ─── Standard operation sets ───

const FULL_CRUD: MCPOperation[] = ['create', 'read', 'update', 'softDelete', 'query', 'subscribe']
const READ_QUERY: MCPOperation[] = ['read', 'query', 'subscribe']
const CRUD_NO_SUB: MCPOperation[] = ['create', 'read', 'update', 'softDelete', 'query']

/** Standard query capabilities for most models. */
const STANDARD_QUERY: MCPQueryCapabilities = {
  filters: ['eq', 'neq', 'contains', 'in', 'between'],
  sort: true,
  pagination: true,
}

/** Full query capabilities for heavily queried models. */
const FULL_QUERY: MCPQueryCapabilities = {
  filters: ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith', 'endsWith', 'in', 'notIn', 'between', 'exists'],
  sort: true,
  pagination: true,
  fullText: true,
}

// ─── Helper ───

function model(
  collection: string,
  operations: MCPOperation[],
  config: {
    query?: MCPQueryCapabilities
    compositions?: string[]
    createSchema?: string
    updateSchema?: string
    publicFields: string[]
    internalFields?: string[]
    systemFields?: string[]
  }
): MCPModelConfig {
  const name = collection.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
  const pascal = name.charAt(0).toUpperCase() + name.slice(1)
  // Singularize: remove trailing 's' or 'ies' → 'y'
  const singular = pascal.endsWith('ies')
    ? pascal.slice(0, -3) + 'y'
    : pascal.endsWith('ses')
    ? pascal.slice(0, -2)
    : pascal.endsWith('s')
    ? pascal.slice(0, -1)
    : pascal

  return {
    collection,
    operations,
    queryCapabilities: config.query || STANDARD_QUERY,
    compositions: config.compositions || [],
    createSchema: config.createSchema || `${singular}CreateSchema`,
    updateSchema: config.updateSchema || `${singular}UpdateSchema`,
    fieldAccess: {
      public: config.publicFields,
      internal: config.internalFields || [],
      system: config.systemFields || ['id', 'createdAt', 'updatedAt', 'createdBy', 'deletedAt'],
    },
  }
}

// ─── Master Definition ───

export const MasterMCP: MCPDefinition = {
  version: '1.0.0',
  models: {

    // ─── Primitives ───

    Note: model('notes', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['title', 'body', 'tags', 'images'],
      internalFields: ['metadata'],
    }),

    Tag: model('tags', FULL_CRUD, {
      publicFields: ['title', 'color', 'parentId'],
    }),

    Image: model('images', FULL_CRUD, {
      publicFields: ['value', 'blurhash', 'position'],
    }),

    Identifier: model('identifiers', FULL_CRUD, {
      publicFields: ['type', 'value', 'symbology', 'referenceType', 'referenceId', 'detectable', 'position'],
    }),

    Measurement: model('measurements', FULL_CRUD, {
      publicFields: ['value', 'unit', 'entityId', 'entityType', 'measuredAt', 'source'],
      internalFields: ['metadata'],
    }),

    // ─── Structure & Topology ───

    Context: model('contexts', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['name', 'description', 'type', 'parentId', 'rootId', 'depth', 'path', 'tags'],
      internalFields: ['metadata'],
    }),

    Grid: model('grids', FULL_CRUD, {
      publicFields: ['name', 'description', 'rows', 'columns', 'slots'],
      internalFields: ['metadata'],
    }),

    Group: model('groups', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'members', 'tags', 'images'],
      internalFields: ['metadata'],
    }),

    Map: model('maps', FULL_CRUD, {
      publicFields: ['name', 'description', 'nodes', 'edges', 'rootNodeId'],
      internalFields: ['metadata'],
    }),

    Queue: model('queues', FULL_CRUD, {
      publicFields: ['name', 'description', 'items', 'strategy', 'maxSize'],
      internalFields: ['metadata'],
    }),

    Relationship: model('relationships', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['sourceId', 'sourceType', 'targetId', 'targetType', 'type', 'strength', 'bidirectional', 'tags'],
      internalFields: ['metadata'],
    }),

    Scope: model('scopes', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'parentId', 'ownerId', 'ownerType', 'access'],
      internalFields: ['metadata'],
    }),

    Set: model('sets', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'members', 'tags'],
      internalFields: ['metadata'],
    }),

    Style: model('styles', FULL_CRUD, {
      publicFields: ['name', 'description', 'fields', 'tags'],
      internalFields: ['metadata'],
    }),

    Thread: model('threads', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['title', 'status', 'participants', 'messages', 'tags'],
      internalFields: ['metadata'],
    }),

    Unifier: model('unifiers', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'resolvedId', 'sourceIds', 'strategy'],
      internalFields: ['metadata'],
    }),

    // ─── Data Operations ───

    Log: model('logs', READ_QUERY, {
      query: FULL_QUERY,
      createSchema: 'LogEntryCreateSchema',
      updateSchema: 'LogEntryUpdateSchema',
      publicFields: ['action', 'entityId', 'entityType', 'actorId', 'actorType', 'details', 'severity'],
      internalFields: ['metadata'],
    }),

    // ─── Operations ───

    Async: model('asyncs', FULL_CRUD, {
      publicFields: ['name', 'status', 'type', 'progress', 'result', 'error', 'startedAt', 'completedAt'],
      internalFields: ['metadata', 'retryCount', 'maxRetries'],
    }),

    Function: model('functions', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'inputs', 'outputs', 'tags'],
      internalFields: ['metadata', 'source'],
    }),

    Handshake: model('handshakes', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['action', 'entityId', 'entityType', 'initiatorId', 'parties', 'agreedBy', 'rejectedBy', 'status', 'unanimous', 'message', 'expiresAt'],
      internalFields: ['changes', 'metadata', 'initiatorPublicKey', 'partyPublicKeys', 'keyFingerprint', 'keyAlgorithm', 'keyRotatedAt'],
    }),

    Instruction: model('instructions', FULL_CRUD, {
      publicFields: ['title', 'description', 'steps', 'tags'],
      internalFields: ['metadata'],
    }),

    Interaction: model('interactions', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['type', 'actorId', 'actorType', 'targetId', 'targetType', 'action', 'value', 'tags'],
      internalFields: ['metadata'],
    }),

    Prompt: model('prompts', FULL_CRUD, {
      publicFields: ['title', 'body', 'type', 'options', 'tags'],
      internalFields: ['metadata'],
    }),

    Protocol: model('protocols', FULL_CRUD, {
      publicFields: ['name', 'description', 'version', 'rules', 'tags'],
      internalFields: ['metadata'],
    }),

    // ─── Financial ───

    FinancialTerm: model('financial_terms', FULL_CRUD, {
      publicFields: ['term', 'type', 'amount', 'currency', 'rate', 'frequency', 'startDate', 'endDate', 'tags'],
      internalFields: ['metadata'],
    }),

    // ─── Time ───

    TimeTerm: model('time_terms', FULL_CRUD, {
      publicFields: ['name', 'type', 'startDate', 'endDate', 'duration', 'recurrence', 'tags'],
      internalFields: ['metadata'],
    }),

    // ─── Views & Navigation ───

    Navigation: model('navigations', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'nodes', 'rootNodeId'],
      internalFields: ['metadata'],
    }),

    View: model('views', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'layout', 'components', 'tags'],
      internalFields: ['metadata'],
    }),

    ViewGroup: model('view_groups', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'views', 'tags'],
      internalFields: ['metadata'],
    }),

    ViewState: model('view_states', FULL_CRUD, {
      publicFields: ['viewId', 'state', 'userId', 'active'],
      internalFields: ['metadata'],
    }),

    // ─── Agent / Automation ───

    AgentFlow: model('agent_flows', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['name', 'description', 'status', 'agents', 'steps', 'currentStep', 'tags'],
      internalFields: ['metadata', 'context'],
    }),

    Improvement: model('improvements', FULL_CRUD, {
      publicFields: ['title', 'description', 'type', 'status', 'priority', 'entityId', 'entityType', 'tags'],
      internalFields: ['metadata'],
    }),

    // ─── Design Knowledge ───

    BugPattern: model('bug_patterns', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['title', 'description', 'pattern', 'frequency', 'severity', 'resolution', 'tags'],
      internalFields: ['metadata'],
    }),

    DesignChoice: model('design_choices', FULL_CRUD, {
      publicFields: ['title', 'description', 'context', 'chosen', 'alternatives', 'rationale', 'tags'],
      internalFields: ['metadata'],
    }),

    ChoiceVariant: model('choice_variants', FULL_CRUD, {
      publicFields: ['choiceId', 'title', 'description', 'pros', 'cons', 'chosen'],
      internalFields: ['metadata'],
    }),

    RuleOutcome: model('rule_outcomes', FULL_CRUD, {
      publicFields: ['ruleId', 'entityId', 'entityType', 'outcome', 'score', 'details', 'tags'],
      internalFields: ['metadata'],
    }),

    // ─── Cost & Certainty ───

    Bandwidth: model('bandwidths', FULL_CRUD, {
      publicFields: ['entityId', 'entityType', 'predicted', 'unit', 'confidence'],
      internalFields: ['metadata'],
    }),

    CostMeasurement: model('cost_measurements', CRUD_NO_SUB, {
      publicFields: ['entityId', 'entityType', 'actual', 'unit', 'bandwidthId', 'delta'],
      internalFields: ['metadata'],
    }),

    Certainty: model('certainties', FULL_CRUD, {
      publicFields: ['entityId', 'entityType', 'likelihood', 'consistency', 'observations', 'potentialAccuracy', 'source', 'risk'],
      internalFields: ['metadata'],
    }),

    // ─── Compound ───

    Business: model('businesses', FULL_CRUD, {
      query: FULL_QUERY,
      compositions: ['business-overview', 'business-reporting'],
      publicFields: ['name', 'description', 'type', 'address', 'phone', 'email', 'website', 'identifiers', 'tags', 'images'],
      internalFields: ['metadata', 'settings'],
    }),

    Container: model('containers', FULL_CRUD, {
      compositions: ['inventory-check'],
      publicFields: ['name', 'description', 'type', 'status', 'capacity', 'items', 'parentId', 'tags', 'images'],
      internalFields: ['metadata'],
    }),

    Order: model('orders', FULL_CRUD, {
      query: FULL_QUERY,
      compositions: ['order-lifecycle', 'order-fulfillment'],
      publicFields: ['orderNumber', 'status', 'type', 'items', 'customerId', 'total', 'subtotal', 'tax', 'tags'],
      internalFields: ['metadata', 'payments', 'notes'],
    }),

    Product: model('products', FULL_CRUD, {
      query: FULL_QUERY,
      compositions: ['catalog-screen', 'product-detail', 'inventory-check'],
      publicFields: ['title', 'description', 'sku', 'taxable', 'identifiers', 'tags', 'images', 'dimensions'],
      internalFields: ['catalogId', 'metadata'],
    }),

    Reader: model('readers', FULL_CRUD, {
      publicFields: ['name', 'description', 'type', 'status', 'capabilities', 'tags'],
      internalFields: ['metadata', 'config'],
    }),

    Till: model('tills', FULL_CRUD, {
      compositions: ['till-reconciliation'],
      publicFields: ['name', 'status', 'openedAt', 'closedAt', 'openingBalance', 'closingBalance', 'transactions', 'corrections'],
      internalFields: ['metadata'],
    }),

    Timecard: model('timecards', FULL_CRUD, {
      query: FULL_QUERY,
      publicFields: ['userId', 'status', 'clockIn', 'clockOut', 'breaks', 'totalHours', 'date', 'tags'],
      internalFields: ['metadata', 'notes'],
    }),

    Unit: model('units', FULL_CRUD, {
      compositions: ['inventory-check'],
      publicFields: ['name', 'description', 'type', 'status', 'quantity', 'productId', 'containerId', 'tags'],
      internalFields: ['metadata'],
    }),

    // ─── Security ───

    KeyVault: model('key_vaults', CRUD_NO_SUB, {
      publicFields: ['scopeId', 'keyFingerprint', 'algorithm'],
      internalFields: ['encryptedMasterKey', 'rotations'],
    }),
  },

  recipes: {
    'catalog-screen': {
      description: 'Assemble a catalog view — products with images, identifiers, and tags',
      models: ['Product', 'Image', 'Identifier', 'Tag'],
      steps: [
        { model: 'Product', operation: 'query', description: 'Query products with filters/pagination' },
        { model: 'Image', operation: 'read', description: 'Load product images' },
        { model: 'Identifier', operation: 'read', description: 'Load product identifiers (SKU, barcode)' },
      ],
    },
    'product-detail': {
      description: 'Full product detail — product with all related entities',
      models: ['Product', 'Image', 'Identifier', 'Tag', 'Measurement', 'Note'],
      steps: [
        { model: 'Product', operation: 'read', description: 'Load product record' },
        { model: 'Image', operation: 'query', description: 'Load all product images' },
        { model: 'Identifier', operation: 'query', description: 'Load all identifiers' },
        { model: 'Measurement', operation: 'query', description: 'Load dimensions/weights' },
        { model: 'Note', operation: 'query', description: 'Load product notes' },
      ],
    },
    'inventory-check': {
      description: 'Check inventory — units in containers for a product',
      models: ['Product', 'Unit', 'Container'],
      steps: [
        { model: 'Product', operation: 'read', description: 'Load the product' },
        { model: 'Unit', operation: 'query', description: 'Query units for this product' },
        { model: 'Container', operation: 'query', description: 'Load containers holding the units' },
      ],
    },
    'order-lifecycle': {
      description: 'Full order with items, customer, and status history',
      models: ['Order', 'Product', 'Interaction', 'Log'],
      steps: [
        { model: 'Order', operation: 'read', description: 'Load the order' },
        { model: 'Product', operation: 'query', description: 'Load ordered products' },
        { model: 'Interaction', operation: 'query', description: 'Load customer interactions' },
        { model: 'Log', operation: 'query', description: 'Load order status history' },
      ],
    },
    'order-fulfillment': {
      description: 'Process order fulfillment — pick units from containers',
      models: ['Order', 'Unit', 'Container'],
      steps: [
        { model: 'Order', operation: 'read', description: 'Load the order' },
        { model: 'Unit', operation: 'query', description: 'Find available units' },
        { model: 'Container', operation: 'query', description: 'Locate units in containers' },
        { model: 'Unit', operation: 'update', description: 'Mark units as allocated' },
        { model: 'Order', operation: 'update', description: 'Update order status' },
      ],
    },
    'business-overview': {
      description: 'Business profile with address, identifiers, and recent activity',
      models: ['Business', 'Identifier', 'Log'],
      steps: [
        { model: 'Business', operation: 'read', description: 'Load business record' },
        { model: 'Identifier', operation: 'query', description: 'Load business identifiers' },
        { model: 'Log', operation: 'query', description: 'Load recent activity' },
      ],
    },
    'till-reconciliation': {
      description: 'Reconcile a till — corrections, transactions, balance check',
      models: ['Till', 'Log'],
      steps: [
        { model: 'Till', operation: 'read', description: 'Load till state' },
        { model: 'Log', operation: 'query', description: 'Load transaction history' },
        { model: 'Till', operation: 'update', description: 'Apply corrections and close' },
      ],
    },
  },
}
