/**
 * Full schema validation tests — every Create/Update schema.
 *
 * For each schema: valid payload parses, required fields enforce,
 * type mismatches reject, enum boundaries checked, update schema
 * is fully partial.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'

// ─── Import all schemas ───
import {
  // Shared primitives
  EntityFieldsSchema, MetadataEntrySchema, DataClassificationSchema,
  ImageEmbeddedSchema, TagEmbeddedSchema, IdentifierEmbeddedSchema,
  DimensionsEmbeddedSchema, LengthMeasureSchema, WeightMeasureSchema,
  BarcodeSymbologySchema, EntityTypeSchema,
  // Traits
  LocatableSchema, ExpirableSchema, ValidatableSchema, AccessibleSchema,
  AttachableSchema, InterchangeableSchema,
} from '../src/schemas/shared'

import { ProductCreateSchema, ProductUpdateSchema } from '../src/schemas/product.schema'
import { HandshakeCreateSchema, HandshakeUpdateSchema } from '../src/schemas/handshake.schema'
import { OrderCreateSchema, OrderUpdateSchema, OrderItemSchema, OrderPaymentSchema } from '../src/schemas/order.schema'
import { LogEntryCreateSchema, LogEntryUpdateSchema } from '../src/schemas/log.schema'
import { TagCreateSchema } from '../src/schemas/tag.schema'
import { KeyVaultCreateSchema, KeyVaultUpdateSchema } from '../src/schemas/key-vault.schema'
import { AgentFlowCreateSchema, AgentFlowUpdateSchema } from '../src/schemas/agent-flow.schema'
import { ContextCreateSchema, ContextUpdateSchema } from '../src/schemas/context.schema'
import { FilterCreateSchema, FilterUpdateSchema } from '../src/schemas/filter.schema'
import { SortCreateSchema } from '../src/schemas/sort.schema'
import { NoteCreateSchema } from '../src/schemas/note.schema'
import { EntityCreateSchema } from '../src/schemas/entity.schema'
import { ImageCreateSchema } from '../src/schemas/image.schema'
import { IdentifierCreateSchema } from '../src/schemas/identifier.schema'
import { DimensionsCreateSchema } from '../src/schemas/measurement.schema'
import { GridCreateSchema } from '../src/schemas/grid.schema'
import { GroupCreateSchema } from '../src/schemas/group.schema'
import { MapCreateSchema } from '../src/schemas/map.schema'
import { QueueCreateSchema } from '../src/schemas/queue.schema'
import { ScopeCreateSchema } from '../src/schemas/scope.schema'
import { SetCreateSchema } from '../src/schemas/set.schema'
import { ThreadCreateSchema } from '../src/schemas/thread.schema'
import { UnifierCreateSchema } from '../src/schemas/unifier.schema'
import { FunctionCreateSchema } from '../src/schemas/function.schema'
import { InstructionCreateSchema } from '../src/schemas/instruction.schema'
import { ProtocolCreateSchema } from '../src/schemas/protocol.schema'
import { FinancialTermCreateSchema } from '../src/schemas/financial-term.schema'
import { TimeTermCreateSchema } from '../src/schemas/time-term.schema'
import { ViewCreateSchema } from '../src/schemas/view.schema'
import { ViewGroupCreateSchema } from '../src/schemas/view-group.schema'
import { ViewStateCreateSchema } from '../src/schemas/view-state.schema'
import { AsyncCreateSchema } from '../src/schemas/async.schema'
import { InteractionCreateSchema } from '../src/schemas/interaction.schema'
import { PromptCreateSchema } from '../src/schemas/prompt.schema'
import { RelationshipCreateSchema, RelationshipUpdateSchema } from '../src/schemas/relationship.schema'
import { StyleCreateSchema } from '../src/schemas/style.schema'
import { NavigationCreateSchema } from '../src/schemas/navigation.schema'
import { ImprovementCreateSchema } from '../src/schemas/improvement.schema'
import { RuleOutcomeCreateSchema } from '../src/schemas/rule-outcome.schema'
import { BandwidthCreateSchema } from '../src/schemas/bandwidth.schema'
import { BugPatternCreateSchema } from '../src/schemas/bug-pattern.schema'
import { DesignChoiceCreateSchema } from '../src/schemas/design-choice.schema'
import { BusinessCreateSchema, BusinessUpdateSchema } from '../src/schemas/business.schema'
import { ContainerCreateSchema } from '../src/schemas/container.schema'
import { ReaderCreateSchema } from '../src/schemas/reader.schema'
import { TillCreateSchema } from '../src/schemas/till.schema'
import { TimecardCreateSchema, TimecardUpdateSchema } from '../src/schemas/timecard.schema'
import { UnitCreateSchema } from '../src/schemas/unit.schema'

// ─── Helpers ───

function valid(schema: any, data: unknown, label: string) {
  const r = schema.safeParse(data)
  if (!r.success) {
    assert.fail(`${label} should pass: ${JSON.stringify(r.error.issues)}`)
  }
}

function invalid(schema: any, data: unknown, label: string) {
  const r = schema.safeParse(data)
  assert.equal(r.success, false, `${label} should fail`)
}

// ─── Shared Primitives ───

describe('Shared Primitives', () => {
  describe('EntityFieldsSchema', () => {
    it('accepts empty (all optional)', () => {
      valid(EntityFieldsSchema, {}, 'empty entity')
    })

    it('accepts valid uuid and datetime', () => {
      valid(EntityFieldsSchema, {
        id: '550e8400-e29b-41d4-a716-446655440000',
        createdAt: '2025-01-01T00:00:00Z',
      }, 'with id and date')
    })

    it('rejects invalid uuid', () => {
      invalid(EntityFieldsSchema, { id: 'not-a-uuid' }, 'bad uuid')
    })

    it('rejects invalid datetime', () => {
      invalid(EntityFieldsSchema, { createdAt: 'not-a-date' }, 'bad datetime')
    })
  })

  describe('MetadataEntrySchema', () => {
    it('accepts valid entry', () => {
      valid(MetadataEntrySchema, { key: 'color', value: 'red', classification: 'primary' }, 'valid entry')
    })

    it('rejects empty key', () => {
      invalid(MetadataEntrySchema, { key: '', value: 'x', classification: 'primary' }, 'empty key')
    })

    it('rejects invalid classification', () => {
      invalid(MetadataEntrySchema, { key: 'k', value: 'v', classification: 'invalid' }, 'bad classification')
    })
  })

  describe('DataClassificationSchema', () => {
    for (const v of ['primary', 'meta', 'extended', 'derived', 'system']) {
      it(`accepts '${v}'`, () => valid(DataClassificationSchema, v, v))
    }
    it('rejects unknown', () => invalid(DataClassificationSchema, 'custom', 'unknown'))
  })

  describe('BarcodeSymbologySchema', () => {
    it('accepts QR', () => valid(BarcodeSymbologySchema, 'QR', 'QR'))
    it('accepts EAN13', () => valid(BarcodeSymbologySchema, 'EAN13', 'EAN13'))
    it('rejects unknown', () => invalid(BarcodeSymbologySchema, 'BARCODE99', 'unknown'))
  })

  describe('LengthMeasureSchema', () => {
    it('accepts valid', () => valid(LengthMeasureSchema, { value: 10, unit: 'cm' }, 'valid'))
    it('rejects invalid unit', () => invalid(LengthMeasureSchema, { value: 10, unit: 'miles' }, 'bad unit'))
    it('rejects missing value', () => invalid(LengthMeasureSchema, { unit: 'cm' }, 'no value'))
  })

  describe('WeightMeasureSchema', () => {
    it('accepts valid', () => valid(WeightMeasureSchema, { value: 2.5, unit: 'kg' }, 'valid'))
    it('rejects invalid unit', () => invalid(WeightMeasureSchema, { value: 1, unit: 'stones' }, 'bad unit'))
  })

  describe('LocatableSchema', () => {
    it('accepts valid coordinates', () => {
      valid(LocatableSchema, { latitude: 30.2672, longitude: -97.7431 }, 'Austin coords')
    })
    it('rejects latitude > 90', () => {
      invalid(LocatableSchema, { latitude: 91 }, 'lat too high')
    })
    it('rejects longitude > 180', () => {
      invalid(LocatableSchema, { longitude: 181 }, 'lng too high')
    })
    it('rejects latitude < -90', () => {
      invalid(LocatableSchema, { latitude: -91 }, 'lat too low')
    })
  })

  describe('ValidatableSchema', () => {
    it('accepts valid confidence range', () => {
      valid(ValidatableSchema, { confidence: 0.95, validity: 'verified' }, 'valid')
    })
    it('rejects confidence > 1', () => {
      invalid(ValidatableSchema, { confidence: 1.5 }, 'too high')
    })
    it('rejects confidence < 0', () => {
      invalid(ValidatableSchema, { confidence: -0.1 }, 'negative')
    })
  })

  describe('ExpirableSchema', () => {
    it('rejects negative currentUses', () => {
      invalid(ExpirableSchema, { currentUses: -1 }, 'negative uses')
    })
    it('accepts valid', () => {
      valid(ExpirableSchema, { maxUses: 5, currentUses: 2, consumeOnRead: true, ttl: 3600 }, 'valid')
    })
  })

  describe('AttachableSchema', () => {
    it('accepts valid attachment', () => {
      valid(AttachableSchema, {
        attachments: [{ url: 'https://example.com/f.pdf', name: 'f.pdf', type: 'application/pdf' }],
      }, 'valid')
    })
    it('rejects invalid url', () => {
      invalid(AttachableSchema, {
        attachments: [{ url: 'not-a-url', name: 'f', type: 't' }],
      }, 'bad url')
    })
  })

  describe('InterchangeableSchema', () => {
    it('accepts valid substitute', () => {
      valid(InterchangeableSchema, {
        substitutes: [{ entityId: 'e1', compatibility: 'full', bidirectional: true }],
      }, 'valid')
    })
    it('rejects invalid compatibility', () => {
      invalid(InterchangeableSchema, {
        substitutes: [{ entityId: 'e1', compatibility: 'maybe', bidirectional: true }],
      }, 'bad compat')
    })
  })

  describe('EntityTypeSchema', () => {
    for (const t of ['person', 'place', 'thing', 'idea', 'event', 'signal']) {
      it(`accepts '${t}'`, () => valid(EntityTypeSchema, t, t))
    }
    it('rejects unknown', () => invalid(EntityTypeSchema, 'widget', 'unknown'))
  })
})

// ─── Base Model Schemas ───

describe('EntityCreateSchema', () => {
  it('accepts empty (all optional)', () => valid(EntityCreateSchema, {}, 'empty'))
})

describe('ImageCreateSchema', () => {
  it('accepts empty', () => valid(ImageCreateSchema, {}, 'empty'))
  it('accepts valid', () => valid(ImageCreateSchema, { value: 'img.png', position: 0 }, 'valid'))
  it('rejects negative position', () => invalid(ImageCreateSchema, { position: -1 }, 'neg pos'))
})

describe('TagCreateSchema', () => {
  it('accepts minimal', () => valid(TagCreateSchema, {}, 'empty'))
  it('accepts full', () => valid(TagCreateSchema, { label: 'sale', color: '#ff0000' }, 'full'))
})

describe('NoteCreateSchema', () => {
  it('accepts empty', () => valid(NoteCreateSchema, {}, 'empty'))
})

describe('IdentifierCreateSchema', () => {
  it('accepts empty', () => valid(IdentifierCreateSchema, {}, 'empty'))
  it('accepts with symbology', () => {
    valid(IdentifierCreateSchema, { value: '1234567890', symbology: 'EAN13', detectable: true }, 'with barcode')
  })
})

describe('DimensionsCreateSchema', () => {
  it('accepts empty', () => valid(DimensionsCreateSchema, {}, 'empty'))
  it('accepts with measurements', () => {
    valid(DimensionsCreateSchema, {
      height: { value: 10, unit: 'cm' },
      weight: { value: 500, unit: 'g' },
    }, 'with measures')
  })
})

// ─── Structure & Topology Schemas ───

describe('GridCreateSchema', () => {
  it('accepts empty', () => valid(GridCreateSchema, {}, 'empty'))
})

describe('GroupCreateSchema', () => {
  it('accepts empty', () => valid(GroupCreateSchema, {}, 'empty'))
})

describe('MapCreateSchema', () => {
  it('accepts empty', () => valid(MapCreateSchema, {}, 'empty'))
})

describe('QueueCreateSchema', () => {
  it('accepts empty', () => valid(QueueCreateSchema, {}, 'empty'))
})

describe('ScopeCreateSchema', () => {
  it('accepts empty', () => valid(ScopeCreateSchema, {}, 'empty'))
})

describe('SetCreateSchema', () => {
  it('accepts empty', () => valid(SetCreateSchema, {}, 'empty'))
})

describe('ThreadCreateSchema', () => {
  it('accepts empty', () => valid(ThreadCreateSchema, {}, 'empty'))
})

describe('UnifierCreateSchema', () => {
  it('accepts empty', () => valid(UnifierCreateSchema, {}, 'empty'))
})

// ─── Data Operations Schemas ───

describe('FilterCreateSchema', () => {
  it('requires field', () => {
    invalid(FilterCreateSchema, {}, 'missing field')
  })
  it('rejects empty field', () => {
    invalid(FilterCreateSchema, { field: '' }, 'empty field')
  })
  it('accepts valid', () => {
    valid(FilterCreateSchema, { field: 'price', operator: 'gt', value: '100' }, 'valid')
  })
  it('rejects invalid operator', () => {
    invalid(FilterCreateSchema, { field: 'x', operator: 'nope' }, 'bad operator')
  })
})

describe('SortCreateSchema', () => {
  it('requires field', () => invalid(SortCreateSchema, {}, 'missing field'))
  it('accepts valid', () => valid(SortCreateSchema, { field: 'price', direction: 'desc' }, 'valid'))
  it('rejects invalid direction', () => {
    invalid(SortCreateSchema, { field: 'x', direction: 'sideways' }, 'bad direction')
  })
})

describe('LogEntryCreateSchema', () => {
  it('requires entityId', () => invalid(LogEntryCreateSchema, {}, 'missing entityId'))
  it('accepts valid', () => {
    valid(LogEntryCreateSchema, { entityId: 'e1', action: 'create', level: 'entity' }, 'valid')
  })
  it('rejects invalid level', () => {
    invalid(LogEntryCreateSchema, { entityId: 'e1', level: 'mega' }, 'bad level')
  })
  it('update is partial', () => {
    valid(LogEntryUpdateSchema, { action: 'update' }, 'partial update')
    valid(LogEntryUpdateSchema, {}, 'empty update')
  })
})

// ─── Operations Schemas ───

describe('AsyncCreateSchema', () => {
  it('accepts empty', () => valid(AsyncCreateSchema, {}, 'empty'))
})

describe('FunctionCreateSchema', () => {
  it('accepts empty', () => valid(FunctionCreateSchema, {}, 'empty'))
})

describe('HandshakeCreateSchema', () => {
  it('requires action and parties', () => {
    invalid(HandshakeCreateSchema, {}, 'missing required')
    invalid(HandshakeCreateSchema, { action: 'test' }, 'missing parties')
    invalid(HandshakeCreateSchema, { parties: ['a'] }, 'missing action')
  })
  it('rejects empty parties', () => {
    invalid(HandshakeCreateSchema, { action: 'test', parties: [] }, 'empty parties')
  })
  it('rejects invalid status', () => {
    invalid(HandshakeCreateSchema, { action: 'test', parties: ['a'], status: 'bogus' }, 'bad status')
  })
  it('accepts all valid statuses', () => {
    for (const s of ['pending', 'approved', 'rejected', 'countered', 'expired', 'cancelled']) {
      valid(HandshakeCreateSchema, { action: 'test', parties: ['a'], status: s }, s)
    }
  })
  it('update is partial', () => valid(HandshakeUpdateSchema, { status: 'approved' }, 'partial update'))
})

describe('InstructionCreateSchema', () => {
  it('accepts empty', () => valid(InstructionCreateSchema, {}, 'empty'))
})

describe('InteractionCreateSchema', () => {
  it('accepts empty', () => valid(InteractionCreateSchema, {}, 'empty'))
})

describe('PromptCreateSchema', () => {
  it('accepts empty', () => valid(PromptCreateSchema, {}, 'empty'))
})

describe('ProtocolCreateSchema', () => {
  it('accepts empty', () => valid(ProtocolCreateSchema, {}, 'empty'))
})

// ─── Financial ───

describe('FinancialTermCreateSchema', () => {
  it('requires term and value', () => {
    invalid(FinancialTermCreateSchema, {}, 'missing both')
    invalid(FinancialTermCreateSchema, { term: 'tax' }, 'missing value')
    invalid(FinancialTermCreateSchema, { value: 10 }, 'missing term')
  })
  it('accepts valid', () => {
    valid(FinancialTermCreateSchema, { term: 'tax', value: 8.25 }, 'valid')
  })
  it('rejects invalid term', () => {
    invalid(FinancialTermCreateSchema, { term: 'unknown-term', value: 10 }, 'bad term')
  })
  it('accepts key financial terms', () => {
    for (const t of ['charge', 'payment', 'discount', 'tax', 'refund', 'tip', 'subscription']) {
      valid(FinancialTermCreateSchema, { term: t, value: 1 }, t)
    }
  })
})

// ─── Time ───

describe('TimeTermCreateSchema', () => {
  it('accepts empty (all optional)', () => valid(TimeTermCreateSchema, {}, 'empty'))
})

// ─── Views & Navigation ───

describe('ViewCreateSchema', () => {
  it('accepts empty', () => valid(ViewCreateSchema, {}, 'empty'))
})

describe('ViewGroupCreateSchema', () => {
  it('accepts empty', () => valid(ViewGroupCreateSchema, {}, 'empty'))
})

describe('ViewStateCreateSchema', () => {
  it('requires viewId', () => {
    invalid(ViewStateCreateSchema, {}, 'missing viewId')
  })
  it('accepts valid', () => {
    valid(ViewStateCreateSchema, { viewId: 'v1', state: 'idle' }, 'valid')
  })
  it('rejects invalid state value', () => {
    invalid(ViewStateCreateSchema, { viewId: 'v1', state: 'broken' }, 'bad state')
  })
})

describe('NavigationCreateSchema', () => {
  it('accepts empty', () => valid(NavigationCreateSchema, {}, 'empty'))
})

// ─── Agent / Automation ───

describe('AgentFlowCreateSchema', () => {
  it('accepts empty', () => valid(AgentFlowCreateSchema, {}, 'empty'))
  it('accepts with agents', () => {
    valid(AgentFlowCreateSchema, {
      agents: [{ role: 'collector', name: 'data-gatherer' }],
    }, 'with agents')
  })
  it('rejects invalid agent role', () => {
    invalid(AgentFlowCreateSchema, {
      agents: [{ role: 'wizard' }],
    }, 'bad role')
  })
  it('update is partial', () => valid(AgentFlowUpdateSchema, {}, 'empty update'))
})

describe('ImprovementCreateSchema', () => {
  it('requires content', () => {
    invalid(ImprovementCreateSchema, {}, 'missing content')
  })
  it('rejects empty content', () => {
    invalid(ImprovementCreateSchema, { content: '' }, 'empty content')
  })
  it('accepts valid', () => {
    valid(ImprovementCreateSchema, { content: 'Fix the bug', stage: 'raw' }, 'valid')
  })
})

// ─── Design Knowledge ───

describe('BugPatternCreateSchema', () => {
  it('requires title', () => invalid(BugPatternCreateSchema, {}, 'missing title'))
  it('accepts valid', () => {
    valid(BugPatternCreateSchema, { title: 'Race condition in auth', severity: 'high' }, 'valid')
  })
  it('rejects invalid severity', () => {
    invalid(BugPatternCreateSchema, { title: 'x', severity: 'mega' }, 'bad severity')
  })
})

describe('DesignChoiceCreateSchema', () => {
  it('requires title', () => invalid(DesignChoiceCreateSchema, {}, 'missing title'))
  it('accepts valid', () => {
    valid(DesignChoiceCreateSchema, { title: 'Use Zod for validation', status: 'active' }, 'valid')
  })
})

describe('RuleOutcomeCreateSchema', () => {
  it('requires ruleId', () => invalid(RuleOutcomeCreateSchema, {}, 'missing ruleId'))
  it('accepts valid', () => {
    valid(RuleOutcomeCreateSchema, { ruleId: 'r1', outcomeType: 'followed' }, 'valid')
  })
  it('rejects invalid outcome type', () => {
    invalid(RuleOutcomeCreateSchema, { ruleId: 'r1', outcomeType: 'ignored' }, 'bad type')
  })
})

// ─── Cost & Certainty ───

describe('BandwidthCreateSchema', () => {
  it('requires entityId', () => invalid(BandwidthCreateSchema, {}, 'missing entityId'))
  it('accepts valid', () => {
    valid(BandwidthCreateSchema, { entityId: 'e1' }, 'valid')
  })
})

// ─── Security ───

describe('KeyVaultCreateSchema', () => {
  it('requires scopeId, encryptedMasterKey, keyFingerprint', () => {
    invalid(KeyVaultCreateSchema, {}, 'missing all')
    invalid(KeyVaultCreateSchema, { scopeId: 's1' }, 'missing key+fingerprint')
    invalid(KeyVaultCreateSchema, { scopeId: 's1', encryptedMasterKey: 'k1' }, 'missing fingerprint')
  })
  it('rejects empty strings', () => {
    invalid(KeyVaultCreateSchema, { scopeId: '', encryptedMasterKey: 'k', keyFingerprint: 'f' }, 'empty scope')
  })
  it('accepts valid', () => {
    valid(KeyVaultCreateSchema, {
      scopeId: 's1',
      encryptedMasterKey: 'encrypted-key-data',
      keyFingerprint: 'fp-123',
      algorithm: 'xchacha20-poly1305',
    }, 'valid')
  })
  it('rejects invalid algorithm', () => {
    invalid(KeyVaultCreateSchema, {
      scopeId: 's1', encryptedMasterKey: 'k', keyFingerprint: 'f',
      algorithm: 'rot13',
    }, 'bad algo')
  })
  it('update is partial', () => valid(KeyVaultUpdateSchema, {}, 'empty update'))
})

// ─── Context ───

describe('ContextCreateSchema', () => {
  it('accepts empty', () => valid(ContextCreateSchema, {}, 'empty'))
  it('accepts valid', () => {
    valid(ContextCreateSchema, {
      description: 'Test context',
      key: 'ctx-1',
      public: true,
      params: { limit: '10' },
    }, 'valid')
  })
  it('update is partial', () => valid(ContextUpdateSchema, {}, 'empty update'))
})

// ─── Relationship ───

describe('RelationshipCreateSchema', () => {
  it('requires sourceId and targetId', () => {
    invalid(RelationshipCreateSchema, {}, 'missing both')
    invalid(RelationshipCreateSchema, { sourceId: 's1' }, 'missing target')
    invalid(RelationshipCreateSchema, { targetId: 't1' }, 'missing source')
  })
  it('rejects empty strings', () => {
    invalid(RelationshipCreateSchema, { sourceId: '', targetId: 't1' }, 'empty source')
  })
  it('accepts valid', () => {
    valid(RelationshipCreateSchema, { sourceId: 's1', targetId: 't1', type: 'parent' }, 'valid')
  })
  it('rejects invalid relationship type', () => {
    invalid(RelationshipCreateSchema, { sourceId: 's1', targetId: 't1', type: 'friend' }, 'bad type')
  })
  it('update is partial', () => valid(RelationshipUpdateSchema, {}, 'empty update'))
})

// ─── Style ───

describe('StyleCreateSchema', () => {
  it('accepts empty', () => valid(StyleCreateSchema, {}, 'empty'))
})

// ─── Compound Schemas ───

describe('ProductCreateSchema', () => {
  it('accepts minimal', () => valid(ProductCreateSchema, {}, 'empty'))
  it('accepts full', () => {
    valid(ProductCreateSchema, {
      title: 'Widget',
      sku: 'W-001',
      taxable: true,
      tags: [{ title: 'sale' }],
      images: [{ value: 'img.png' }],
      dimensions: { height: { value: 10, unit: 'cm' } },
    }, 'full')
  })
  it('rejects invalid nested dimension', () => {
    invalid(ProductCreateSchema, {
      dimensions: { height: { value: 10, unit: 'parsecs' } },
    }, 'bad dimension unit')
  })
  it('update is partial', () => valid(ProductUpdateSchema, { title: 'New' }, 'partial update'))
})

describe('OrderCreateSchema', () => {
  it('accepts empty', () => valid(OrderCreateSchema, {}, 'empty'))
  it('accepts full', () => {
    valid(OrderCreateSchema, {
      items: [{ amount: 500, quantity: 2 }],
      payments: [{ amount: 1000, type: 'card' }],
      taxes: [{ percent: 8 }],
      discounts: [{ amount: 50 }],
    }, 'full')
  })
  it('rejects invalid payment type', () => {
    invalid(OrderCreateSchema, {
      payments: [{ amount: 100, type: 'bitcoin' }],
    }, 'bad payment type')
  })
  it('rejects negative quantity on item', () => {
    invalid(OrderCreateSchema, {
      items: [{ amount: 100, quantity: -1 }],
    }, 'negative quantity')
  })
  it('rejects zero quantity on item', () => {
    invalid(OrderCreateSchema, {
      items: [{ amount: 100, quantity: 0 }],
    }, 'zero quantity')
  })
  it('update is partial', () => valid(OrderUpdateSchema, {}, 'empty update'))
})

describe('BusinessCreateSchema', () => {
  it('accepts empty', () => valid(BusinessCreateSchema, {}, 'empty'))
  it('accepts full', () => {
    valid(BusinessCreateSchema, {
      title: 'Shop', email: 'x@y.com', taxAmount: 0.5, taxPercent: 0.08,
    }, 'full')
  })
  it('update is partial', () => valid(BusinessUpdateSchema, { title: 'New Name' }, 'partial'))
})

describe('ContainerCreateSchema', () => {
  it('accepts empty', () => valid(ContainerCreateSchema, {}, 'empty'))
})

describe('ReaderCreateSchema', () => {
  it('accepts empty', () => valid(ReaderCreateSchema, {}, 'empty'))
  it('rejects invalid device type', () => {
    invalid(ReaderCreateSchema, { deviceType: 'magic_reader' }, 'bad device')
  })
})

describe('TillCreateSchema', () => {
  it('accepts empty', () => valid(TillCreateSchema, {}, 'empty'))
  it('rejects invalid correction action', () => {
    invalid(TillCreateSchema, {
      corrections: [{ action: 'steal', amount: 100 }],
    }, 'bad action')
  })
})

describe('TimecardCreateSchema', () => {
  it('accepts empty (startedAt is optional)', () => {
    valid(TimecardCreateSchema, {}, 'empty')
  })
  it('accepts valid', () => {
    valid(TimecardCreateSchema, { startedAt: '2025-01-01T09:00:00Z', status: 'started' }, 'valid')
  })
  it('rejects invalid status', () => {
    invalid(TimecardCreateSchema, { startedAt: '2025-01-01T09:00:00Z', status: 'fired' }, 'bad status')
  })
  it('rejects invalid datetime for startedAt', () => {
    invalid(TimecardCreateSchema, { startedAt: 'not-a-date' }, 'bad datetime')
  })
  it('update is partial', () => valid(TimecardUpdateSchema, {}, 'empty update'))
})

describe('UnitCreateSchema', () => {
  it('accepts empty', () => valid(UnitCreateSchema, {}, 'empty'))
})

// ─── Order sub-schemas ───

describe('OrderItemSchema', () => {
  it('requires amount', () => invalid(OrderItemSchema, {}, 'missing amount'))
  it('accepts valid', () => valid(OrderItemSchema, { amount: 500 }, 'valid'))
})

describe('OrderPaymentSchema', () => {
  it('requires amount', () => invalid(OrderPaymentSchema, {}, 'missing amount'))
  it('accepts all payment types', () => {
    for (const t of ['cash', 'card', 'check', 'giftCard', 'storeCredit', 'external']) {
      valid(OrderPaymentSchema, { amount: 100, type: t }, t)
    }
  })
})
