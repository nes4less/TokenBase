import { generateUUID } from '../utils'

/**
 * Supported barcode symbology types.
 */
export type BarcodeType =
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
 * Barcode — a machine-readable identifier associated with products or units.
 *
 * Distinct from Identifier: Barcode is a concrete, scannable artifact with
 * a specific symbology. Identifier is the abstract "how to tell things apart"
 * concept. A Barcode can be referenced by an Identifier of type 'barcode'.
 *
 * Origin: CashierFu POS system.
 */
export class Barcode {
  id: string
  /** The barcode symbology/format type */
  type: BarcodeType
  /** The barcode value/number */
  value: string | null
  constructor(data?: Partial<Barcode>) {
    this.id = data?.id || generateUUID()
    this.type = data?.type || 'UNKNOWN'
    this.value = data?.value || null
  }
}
