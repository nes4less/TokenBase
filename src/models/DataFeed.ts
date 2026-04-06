import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * DataFeed — a configured data feed or external input.
 *
 * Represents any source of data the system can pull from:
 * API endpoints, database queries, file imports, real-time
 * streams. DataFeeds define how to fetch, when to refresh,
 * and how stale data becomes.
 *
 * Named DataFeed (not DataSource) to avoid collision with
 * the DataSource origin-classification type in Bandwidth.
 */
export class DataFeed extends Entity {
  static collection: string = 'data_feeds'

  /** Target collection or endpoint */
  collection: string | null
  description: string | null
  metadata: MetadataEntry[]
  name: string | null

  /** Fetch priority (higher = preferred) */
  priority: number

  /** Associated query ID for parameterized sources */
  queryId: string | null

  /** Refresh interval in seconds */
  refreshInterval: number | null

  /** 'poll' | 'push' | 'manual' | 'event' */
  refreshMode: string | null

  /** Scope this source belongs to */
  scopeId: string | null

  /** Seconds before data is considered stale */
  staleAfter: number | null

  tags: string[]

  /** Event that triggers a refresh */
  triggerOn: string | null

  constructor(data?: Partial<DataFeed>) {
    super(data)
    this.collection = data?.collection || null
    this.description = data?.description || null
    this.metadata = data?.metadata || []
    this.name = data?.name || null
    this.priority = data?.priority ?? 0
    this.queryId = data?.queryId || null
    this.refreshInterval = data?.refreshInterval ?? null
    this.refreshMode = data?.refreshMode || null
    this.scopeId = data?.scopeId || null
    this.staleAfter = data?.staleAfter ?? null
    this.tags = data?.tags || []
    this.triggerOn = data?.triggerOn || null
  }
}
