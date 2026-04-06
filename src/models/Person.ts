import { Entity } from './Entity'
import { MetadataEntry } from './Traits'

/**
 * Person — a human participant in the graph.
 *
 * Person is the identity node. Every human in the system is a
 * Person with a name, avatar, language preferences, and profile
 * visibility settings. Persons connect to Organizations via
 * Relationships, communicate via Messages in Threads, and
 * are authenticated via Handshakes.
 *
 * This is the universal base. App-specific fields (payment
 * balances, stripe IDs, onboarding state) belong in the
 * consuming application's extended Person model.
 */
export class Person extends Entity {
  static collection: string = 'persons'

  avatarImage: string | null
  blurhash: string | null
  dateOfBirth: string | null
  displayName: string | null
  email: string | null
  enabledRoles: string[]
  firstName: string | null
  image: string | null
  images: string[]
  language: string | null
  lastActiveContext: string | null
  lastActiveRole: string | null
  lastName: string | null

  /** Whether this person was manually added (vs self-registered) */
  manualEntry: boolean

  metadata: MetadataEntry[]
  middleName: string | null
  notificationPrefs: Record<string, unknown>
  phone: string | null

  /** 'public' | 'private' | 'contacts' */
  profileVisibility: string | null

  publicProfile: boolean
  tags: string[]
  themeColor: string | null
  themeMode: string | null
  translateMode: string | null
  useAvatarImage: boolean
  useAvatarName: boolean
  verified: boolean

  constructor(data?: Partial<Person>) {
    super(data)
    this.avatarImage = data?.avatarImage || null
    this.blurhash = data?.blurhash || null
    this.dateOfBirth = data?.dateOfBirth || null
    this.displayName = data?.displayName || null
    this.email = data?.email || null
    this.enabledRoles = data?.enabledRoles || []
    this.firstName = data?.firstName || null
    this.image = data?.image || null
    this.images = data?.images || []
    this.language = data?.language || null
    this.lastActiveContext = data?.lastActiveContext || null
    this.lastActiveRole = data?.lastActiveRole || null
    this.lastName = data?.lastName || null
    this.manualEntry = data?.manualEntry ?? false
    this.metadata = data?.metadata || []
    this.middleName = data?.middleName || null
    this.notificationPrefs = data?.notificationPrefs || {}
    this.phone = data?.phone || null
    this.profileVisibility = data?.profileVisibility || null
    this.publicProfile = data?.publicProfile ?? false
    this.tags = data?.tags || []
    this.themeColor = data?.themeColor || null
    this.themeMode = data?.themeMode || null
    this.translateMode = data?.translateMode || null
    this.useAvatarImage = data?.useAvatarImage ?? false
    this.useAvatarName = data?.useAvatarName ?? false
    this.verified = data?.verified ?? false
  }
}
