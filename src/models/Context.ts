import { generateDateString, generateUUID } from '../utils'
import { Image } from './Image'
import { Tag } from './Tag'

/**
 * Context — display, scoping, and presentation metadata.
 *
 * Context handles the "how does this look and where does it live" concerns.
 * Models reference a Context for their display/icon/scoping needs,
 * keeping the model itself focused on logic.
 */
export class Context {
  static collection: string = 'contexts'
  approval: string | null
  createdAt: string
  createdBy: string | null
  deletedAt: string | null
  description: string | null
  filter: string | null
  id: string
  images: Image[]
  implications: string | null
  key: string | null
  language: string | null
  metadata: Record<string, string>
  parentId: string | null
  params: Record<string, string>
  position: number
  public: boolean
  questions: string[]
  scope: string | null
  scopeId: string | null
  sort: string | null
  tags: Tag[]
  updatedAt: string
  constructor(data?: Partial<Context>) {
    this.approval = data?.approval || null
    this.createdAt = data?.createdAt || generateDateString()
    this.createdBy = data?.createdBy || null
    this.deletedAt = data?.deletedAt || null
    this.description = data?.description || null
    this.filter = data?.filter || null
    this.id = data?.id || generateUUID()
    this.images = data?.images || []
    this.implications = data?.implications || null
    this.key = data?.key || null
    this.language = data?.language || null
    this.metadata = data?.metadata || {}
    this.parentId = data?.parentId || null
    this.params = data?.params || {}
    this.position = data?.position ?? 0
    this.public = data?.public ?? true
    this.questions = data?.questions || []
    this.scope = data?.scope || null
    this.scopeId = data?.scopeId || null
    this.sort = data?.sort || null
    this.tags = data?.tags || []
    this.updatedAt = data?.updatedAt || generateDateString()
  }
}
