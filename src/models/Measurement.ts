import { generateUUID } from '../utils'

/** Supported unit types for length measurements */
export type LengthUnit = 'mm' | 'cm' | 'm' | 'in' | 'ft'

/** Supported unit types for weight measurements */
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb'

/** Supported unit types for volume measurements */
export type VolumeUnit = 'ml' | 'l' | 'floz' | 'gal'

/**
 * Measure — a numeric value paired with its unit.
 *
 * Generic over unit type so the same structure works for
 * length, weight, volume, and future measurement domains.
 *
 * Origin: CashierFu inventory system.
 */
export interface Measure<U extends string = string> {
  value: number
  unit: U
}

/**
 * Dimensions — physical measurements of an object.
 *
 * Flat structure: width, height, depth as lengths, weight separate.
 * Each dimension is optional — measure what matters.
 */
export class Dimensions {
  id: string
  depth: Measure<LengthUnit> | null
  height: Measure<LengthUnit> | null
  weight: Measure<WeightUnit> | null
  width: Measure<LengthUnit> | null
  constructor(data?: Partial<Dimensions>) {
    this.id = data?.id || generateUUID()
    this.depth = data?.depth || null
    this.height = data?.height || null
    this.weight = data?.weight || null
    this.width = data?.width || null
  }
}
