/**
 * Shared Zod schemas — reusable primitives for model validation.
 *
 * These schemas define the embedded types, trait shapes, and entity
 * fields that model schemas compose from. Validated at MCP/API
 * boundaries, never in constructors.
 */
import { z } from 'zod'

// ─── Entity Fields ───

/** The 5 universal fields every storable record carries. */
export const EntityFieldsSchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.string().datetime().optional(),
  createdBy: z.string().nullable().optional(),
  deletedAt: z.string().datetime().nullable().optional(),
  updatedAt: z.string().datetime().optional(),
})

// ─── Data Classification ───

export const DataClassificationSchema = z.enum([
  'primary', 'meta', 'extended', 'derived', 'system',
])

export const MetadataEntrySchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  classification: DataClassificationSchema,
})

// ─── Embedded Tag ───

export const TagEmbeddedSchema = z.object({
  id: z.string().uuid().optional(),
  color: z.string().optional(),
  title: z.string().nullable().optional(),
})

// ─── Embedded Image ───

export const ImageEmbeddedSchema = z.object({
  id: z.string().uuid().optional(),
  blurhash: z.string().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  value: z.string().nullable().optional(),
})

// ─── Barcode Symbology ───

export const BarcodeSymbologySchema = z.enum([
  'AZTEC', 'CODABAR', 'CODE128', 'CODE39', 'CODE93',
  'DATAMATRIX', 'EAN13', 'EAN8', 'ITF14', 'PDF417',
  'QR', 'UPC_A', 'UPC_E', 'UNKNOWN',
])

// ─── Embedded Identifier ───

export const IdentifierEmbeddedSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().optional(),
  value: z.string().nullable().optional(),
  symbology: BarcodeSymbologySchema.nullable().optional(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
  detectable: z.boolean().optional(),
  position: z.number().int().nonnegative().optional(),
})

// ─── Measurement Units ───

export const LengthUnitSchema = z.enum(['mm', 'cm', 'm', 'in', 'ft'])
export const WeightUnitSchema = z.enum(['g', 'kg', 'oz', 'lb'])
export const VolumeUnitSchema = z.enum(['ml', 'l', 'floz', 'gal'])

export const LengthMeasureSchema = z.object({
  value: z.number(),
  unit: LengthUnitSchema,
})

export const WeightMeasureSchema = z.object({
  value: z.number(),
  unit: WeightUnitSchema,
})

export const DimensionsEmbeddedSchema = z.object({
  id: z.string().uuid().optional(),
  depth: LengthMeasureSchema.nullable().optional(),
  height: LengthMeasureSchema.nullable().optional(),
  weight: WeightMeasureSchema.nullable().optional(),
  width: LengthMeasureSchema.nullable().optional(),
})

// ─── Trait Schemas ───
// Composable schema fragments matching the trait interfaces in Traits.ts.
// Models that implement a trait merge the corresponding schema.

export const NameableSchema = z.object({
  name: z.string().nullable().optional(),
})

export const SubnameableSchema = z.object({
  subname: z.string().nullable().optional(),
})

export const DescribableSchema = z.object({
  description: z.string().nullable().optional(),
})

export const IdentifiableSchema = z.object({
  identifier: z.string().nullable().optional(),
})

export const IndexableSchema = z.object({
  index: z.number().int().optional(),
})

export const RankableSchema = z.object({
  rank: z.number().optional(),
})

export const ColorableSchema = z.object({
  color: z.string().nullable().optional(),
})

export const ImageableSchema = z.object({
  images: z.array(ImageEmbeddedSchema).optional(),
})

export const StatusableSchema = z.object({
  status: z.string().optional(),
})

export const NoteableSchema = z.object({
  notes: z.array(z.string()).optional(),
})

export const ChargeableSchema = z.object({
  amount: z.number().optional(),
})

export const SaleableSchema = z.object({
  amount: z.number().optional(),
  taxable: z.boolean().optional(),
})

export const AddressableSchema = z.object({
  address1: z.string().nullable().optional(),
  address2: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  zip: z.string().nullable().optional(),
})

export const MetadatableSchema = z.object({
  metadata: z.array(MetadataEntrySchema).optional(),
})

export const TaggableSchema = z.object({
  tags: z.array(TagEmbeddedSchema).optional(),
})

export const PolymorphicSchema = z.object({
  entityId: z.string().nullable().optional(),
  entityType: z.string().nullable().optional(),
})

export const ExpirableSchema = z.object({
  expiresAt: z.string().datetime().nullable().optional(),
  maxUses: z.number().int().nullable().optional(),
  currentUses: z.number().int().nonnegative().optional(),
  consumeOnRead: z.boolean().optional(),
  ttl: z.number().nullable().optional(),
})

export const AttachableSchema = z.object({
  attachments: z.array(z.object({
    id: z.string().uuid().optional(),
    url: z.string().url(),
    name: z.string(),
    type: z.string(),
    size: z.number().nonnegative().optional(),
  })).optional(),
})

export const LocatableSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  altitude: z.number().nullable().optional(),
  accuracy: z.number().nonnegative().nullable().optional(),
  address: z.string().nullable().optional(),
})

export const AccessibleSchema = z.object({
  access: z.enum(['public', 'private', 'restricted', 'shared']).optional(),
  accessConditions: z.string().nullable().optional(),
})

export const SourceableSchema = z.object({
  sourceType: z.enum(['crud', 'derived', 'observed', 'inferred', 'imported', 'generated']).nullable().optional(),
  sourceId: z.string().nullable().optional(),
  sourceParty: z.enum(['first', 'third']).nullable().optional(),
})

export const ValidatableSchema = z.object({
  validity: z.enum(['verified', 'unverified', 'disputed', 'expired']).nullable().optional(),
  confidence: z.number().min(0).max(1).nullable().optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  verifiedBy: z.string().nullable().optional(),
})

export const SecurableSchema = z.object({
  hash: z.string().nullable().optional(),
  locked: z.boolean().optional(),
  signedBy: z.string().nullable().optional(),
  signatureKey: z.string().nullable().optional(),
})

export const InterchangeableSchema = z.object({
  substitutes: z.array(z.object({
    entityId: z.string(),
    entityType: z.string().nullable().optional(),
    compatibility: z.enum(['full', 'partial', 'conditional']),
    bidirectional: z.boolean(),
  })).optional(),
})

export const LinkableSchema = z.object({
  url: z.string().nullable().optional(),
  deepLink: z.string().nullable().optional(),
  shortLink: z.string().nullable().optional(),
  apiPath: z.string().nullable().optional(),
})

export const EntityTypeSchema = z.enum([
  'person', 'place', 'thing', 'idea', 'event',
  'location', 'result', 'action', 'state',
  'quantity', 'rule', 'signal',
])

export const TypeableSchema = z.object({
  entityClassification: EntityTypeSchema.nullable().optional(),
})

// ─── Unclassified metadata shorthand ───
// Some models use Record<string, string> instead of MetadataEntry[]

export const FlatMetadataSchema = z.record(z.string(), z.string()).optional()
