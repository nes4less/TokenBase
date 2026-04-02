import { generateUUID } from '../utils'

/**
 * Address — a physical location with contact details.
 *
 * Reusable across Business, User profiles, shipping, billing.
 * Flat structure — no nesting, no inheritance.
 *
 * Origin: GameroomKit GKAddressable (2018) + CashierFu UserAddress.
 */
export class Address {
  address1: string | null
  address2: string | null
  city: string | null
  email: string | null
  firstName: string | null
  id: string
  lastName: string | null
  middleName: string | null
  phone: string | null
  state: string | null
  title: string | null
  zip: string | null
  constructor(data?: Partial<Address>) {
    this.address1 = data?.address1 || null
    this.address2 = data?.address2 || null
    this.city = data?.city || null
    this.email = data?.email || null
    this.firstName = data?.firstName || null
    this.id = data?.id || generateUUID()
    this.lastName = data?.lastName || null
    this.middleName = data?.middleName || null
    this.phone = data?.phone || null
    this.state = data?.state || null
    this.title = data?.title || null
    this.zip = data?.zip || null
  }
}
