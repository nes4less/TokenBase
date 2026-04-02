import { generateUUID } from '../utils'

/**
 * Identifier — a way to distinguish a variant.
 *
 * Can be detectable (barcode, QR, RFID) or descriptive (label, color, SKU).
 * Detectable identifiers can reference other models in the system
 * (e.g. a CashierFu barcode model).
 */
export class Identifier {
  id: string
  /** The type of identifier: barcode, qr, rfid, sku, label, visual, description, reference */
  type: string
  /** The value — a barcode number, a SKU string, a description, or a foreign model ID */
  value: string | null
  /** For reference-type identifiers: the collection/model being referenced */
  referenceType: string | null
  /** For reference-type identifiers: the ID in that collection */
  referenceId: string | null
  /** Whether this identifier is machine-detectable */
  detectable: boolean
  position: number
  constructor(data?: Partial<Identifier>) {
    this.id = data?.id || generateUUID()
    this.type = data?.type || 'label'
    this.value = data?.value || null
    this.referenceType = data?.referenceType || null
    this.referenceId = data?.referenceId || null
    this.detectable = data?.detectable ?? false
    this.position = data?.position ?? 0
  }
}
