import { generateDateString, generateUUID } from '../utils'
import { Tag } from './Tag'

/**
 * Gate condition — determines if data passes to the next agent or loops back.
 */
export type GateCondition =
  | 'pass'       // Always forward
  | 'loop'       // Send back to this agent
  | 'conditional' // Evaluate a condition to decide

/**
 * AgentRole — what an agent does in a flow.
 */
export type AgentRole =
  | 'collector'   // Gathers raw data
  | 'categorizer' // Sorts data into types
  | 'summarizer'  // Condenses within context/scope
  | 'analyzer'    // Finds patterns, anti-patterns
  | 'rulemaker'   // Formulates actionable rules
  | 'planner'     // Creates plans from analyzed data
  | 'writer'      // Produces code or content
  | 'reviewer'    // Validates output quality
  | 'deployer'    // Pushes builds, clears context
  | 'custom'      // User-defined role

/**
 * FlowAgent — an agent within a processing flow.
 *
 * Each agent has a focused job, a gate that decides pass/loop,
 * and references to what it consumes and produces.
 */
export class FlowAgent {
  id: string
  /** The agent definition ID (references the actual agent config) */
  agentId: string | null
  /** What this agent does */
  role: AgentRole
  /** Display name for this agent in the flow */
  name: string | null
  /** Gate: what happens after this agent processes */
  gate: GateCondition
  /** Condition expression for conditional gates */
  gateCondition: string | null
  /** Next agent ID(s) on pass */
  passTo: string[]
  /** Agent ID to loop back to (usually self) */
  loopTo: string | null
  /** Position in the flow (ordinal) */
  position: number
  metadata: Record<string, string>
  constructor(data?: Partial<FlowAgent>) {
    this.id = data?.id || generateUUID()
    this.agentId = data?.agentId || null
    this.role = data?.role || 'custom'
    this.name = data?.name || null
    this.gate = data?.gate || 'pass'
    this.gateCondition = data?.gateCondition || null
    this.passTo = data?.passTo || []
    this.loopTo = data?.loopTo || null
    this.position = data?.position ?? 0
    this.metadata = data?.metadata || {}
  }
}

/**
 * AgentFlow — a processing pipeline composed of agents.
 *
 * Describes a workflow where data flows through a chain of agents.
 * Each agent transforms and gates the data (pass/loop).
 * Time model governs refresh cadence.
 *
 * First flow: CLI data → categorize → summarize → analyze → rules
 * Future: planning, code writing, context clearing, build uploads
 */
export class AgentFlow {
  static collection: string = 'agent_flows'
  /** The agents in this flow, in order */
  agents: FlowAgent[]
  contextId: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  id: string
  metadata: Record<string, string>
  name: string | null
  /** Refresh interval in seconds (0 = manual trigger only) */
  refreshInterval: number
  /** Time term ID governing refresh cadence (references TimeTerm when built) */
  timeTermId: string | null
  scopeId: string | null
  tags: Tag[]
  updatedAt: string
  constructor(data?: Partial<AgentFlow>) {
    this.agents = data?.agents || []
    this.contextId = data?.contextId || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.id = data?.id || generateUUID()
    this.metadata = data?.metadata || {}
    this.name = data?.name || null
    this.refreshInterval = data?.refreshInterval ?? 0
    this.timeTermId = data?.timeTermId || null
    this.scopeId = data?.scopeId || null
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
