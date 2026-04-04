import { z } from 'zod'

export const CostUnitSchema = z.enum([
  'tokens', 'ms', 'cpu-ms', 'bytes', 'calls', 'steps', 'dollars', 'custom',
])

export const DataSourceSchema = z.enum([
  'human', 'ai-generated', 'observed', 'calculated', 'imported', 'unknown',
])

export const UncertaintyRiskSchema = z.enum([
  'hallucination', 'fabrication', 'error', 'staleness',
  'sampling-bias', 'propagation', 'imprecision', 'none',
])

// ─── Bandwidth ───

export const BandwidthCreateSchema = z.object({
  id: z.string().uuid().optional(),
  confidence: z.number().min(0).max(1).optional(),
  createdAt: z.string().datetime().optional(),
  createdBy: z.string().nullable().optional(),
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  predicted: z.number().optional(),
  unit: CostUnitSchema.optional(),
  updatedAt: z.string().datetime().optional(),
})

export const BandwidthUpdateSchema = BandwidthCreateSchema.partial()
export type BandwidthCreateInput = z.infer<typeof BandwidthCreateSchema>
export type BandwidthUpdateInput = z.infer<typeof BandwidthUpdateSchema>

// ─── CostMeasurement ───

export const CostMeasurementCreateSchema = z.object({
  id: z.string().uuid().optional(),
  actual: z.number(),
  bandwidthId: z.string().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  delta: z.number().nullable().optional(),
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  unit: CostUnitSchema.optional(),
})

export const CostMeasurementUpdateSchema = CostMeasurementCreateSchema.partial()
export type CostMeasurementCreateInput = z.infer<typeof CostMeasurementCreateSchema>
export type CostMeasurementUpdateInput = z.infer<typeof CostMeasurementUpdateSchema>

// ─── Certainty ───

export const CertaintyCreateSchema = z.object({
  id: z.string().uuid().optional(),
  consistency: z.number().min(0).max(1).optional(),
  createdAt: z.string().datetime().optional(),
  entityId: z.string().min(1),
  entityType: z.string().nullable().optional(),
  likelihood: z.number().min(0).max(1).optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  observations: z.number().int().nonnegative().optional(),
  potentialAccuracy: z.number().min(0).max(1).optional(),
  risk: UncertaintyRiskSchema.optional(),
  source: DataSourceSchema.optional(),
  updatedAt: z.string().datetime().optional(),
})

export const CertaintyUpdateSchema = CertaintyCreateSchema.partial()
export type CertaintyCreateInput = z.infer<typeof CertaintyCreateSchema>
export type CertaintyUpdateInput = z.infer<typeof CertaintyUpdateSchema>
