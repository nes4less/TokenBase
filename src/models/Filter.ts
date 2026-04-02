import { generateUUID } from '../utils'

/**
 * Filter — selection rule.
 *
 * Field, operator, value. Composable — multiple filters form a query.
 */

export type FilterOperator =
  | 'eq'        // equals
  | 'neq'       // not equals
  | 'gt'        // greater than
  | 'gte'       // greater than or equal
  | 'lt'        // less than
  | 'lte'       // less than or equal
  | 'contains'  // string contains
  | 'startsWith'
  | 'endsWith'
  | 'in'        // value in array
  | 'notIn'     // value not in array
  | 'between'   // value between two bounds
  | 'isNull'    // field is null
  | 'isNotNull' // field is not null
  | 'exists'    // field exists
  | 'regex'     // pattern match

export class Filter {
  id: string
  field: string
  operator: FilterOperator
  value: string | null
  /** Second value for 'between' operator */
  valueTo: string | null
  constructor(data?: Partial<Filter>) {
    this.id = data?.id || generateUUID()
    this.field = data?.field || ''
    this.operator = data?.operator || 'eq'
    this.value = data?.value ?? null
    this.valueTo = data?.valueTo ?? null
  }
}
