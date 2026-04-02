import { generateUUID } from '../utils'

export class Tag {
  color: string
  id: string
  title: string | null
  constructor(data?: Partial<Tag>) {
    this.color = data?.color || '#6b7280'
    this.id = data?.id || generateUUID()
    this.title = data?.title || null
  }
}
