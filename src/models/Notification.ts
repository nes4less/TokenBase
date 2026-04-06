import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Notification — an alert or notice delivered to a recipient.
 *
 * Notifications are the output of the system's attention layer:
 * events, mentions, status changes, reminders, agent reports.
 * They're polymorphic (tied to any entity), channeled (push,
 * email, in-app, SMS), and track read state.
 */
export class Notification extends Entity {
  static collection: string = 'notifications'

  /** Delivery channel: 'push' | 'email' | 'in-app' | 'sms' */
  channel: string | null

  entityId: string | null
  entityType: string | null
  image: string | null
  language: string | null
  message: string | null
  metadata: MetadataEntry[]
  read: boolean
  recipientId: string | null
  title: string | null
  translations: { [key: string]: string }

  /** Notification category */
  type: string | null

  constructor(data?: Partial<Notification>) {
    super(data)
    this.channel = data?.channel || null
    this.entityId = data?.entityId || null
    this.entityType = data?.entityType || null
    this.image = data?.image || null
    this.language = data?.language || null
    this.message = data?.message || null
    this.metadata = data?.metadata || []
    this.read = data?.read ?? false
    this.recipientId = data?.recipientId || null
    this.title = data?.title || null
    this.translations = data?.translations || {}
    this.type = data?.type || null
  }
}
