import { generateUUID } from '../utils'

/**
 * Barcode symbology types — for identifiers of type 'barcode'.
 */
export type BarcodeSymbology =
  | 'AZTEC'
  | 'CODABAR'
  | 'CODE128'
  | 'CODE39'
  | 'CODE93'
  | 'DATAMATRIX'
  | 'EAN13'
  | 'EAN8'
  | 'ITF14'
  | 'PDF417'
  | 'QR'
  | 'UPC_A'
  | 'UPC_E'
  | 'UNKNOWN'

/**
 * Identifier — a way to distinguish a variant or entity.
 *
 * Can be detectable (barcode, QR, RFID) or descriptive (label, color, SKU).
 * Detectable identifiers can reference other models in the system.
 *
 * Absorbs Barcode — a barcode is an Identifier with type:'barcode'
 * and a symbology field.
 */
export class Identifier {
  id: string
  /** The type of identifier: barcode, qr, rfid, sku, label, visual, description, reference */
  type: string
  /** The value — a barcode number, a SKU string, a description, or a foreign model ID */
  value: string | null
  /** Barcode symbology — only relevant when type is 'barcode' */
  symbology: BarcodeSymbology | null
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
    this.symbology = data?.symbology || null
    this.referenceType = data?.referenceType || null
    this.referenceId = data?.referenceId || null
    this.detectable = data?.detectable ?? false
    this.position = data?.position ?? 0
  }
}
