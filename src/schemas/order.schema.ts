import { z } from 'zod'
import { EntityFieldsSchema, MetadatableSchema } from './shared'

export const PaymentTypeSchema = z.enum([
  'cash', 'card', 'check', 'giftCard', 'storeCredit', 'external',
])

export const OrderItemSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number(),
  barcode: z.string().nullable().optional(),
  productId: z.string().nullable().optional(),
  quantity: z.number().int().positive().optional(),
  taxable: z.boolean().optional(),
  title: z.string().nullable().optional(),
})

export const OrderDiscountSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().optional(),
  barcode: z.string().nullable().optional(),
  discountId: z.string().nullable().optional(),
  percent: z.number().min(0).max(100).optional(),
  title: z.string().nullable().optional(),
})

export const OrderTaxSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number().optional(),
  percent: z.number().min(0).max(100).optional(),
  taxId: z.string().nullable().optional(),
  title: z.string().nullable().optional(),
})

export const OrderPaymentSchema = z.object({
  id: z.string().uuid().optional(),
  amount: z.number(),
  paidAt: z.string().datetime().nullable().optional(),
  type: PaymentTypeSchema.nullable().optional(),
})

export const OrderCreateSchema = EntityFieldsSchema.merge(MetadatableSchema).extend({
  businessId: z.string().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  discounts: z.array(OrderDiscountSchema).optional(),
  heldAt: z.string().datetime().nullable().optional(),
  items: z.array(OrderItemSchema).optional(),
  payments: z.array(OrderPaymentSchema).optional(),
  taxes: z.array(OrderTaxSchema).optional(),
})

export const OrderUpdateSchema = OrderCreateSchema.partial()
export type OrderCreateInput = z.infer<typeof OrderCreateSchema>
export type OrderUpdateInput = z.infer<typeof OrderUpdateSchema>
