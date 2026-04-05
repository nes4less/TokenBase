/**
 * ZK Proof Provider tests — Layer B.
 *
 * Tests the ZKProofProvider against a mock prover service.
 * Commitment operations (Layer A compatibility) are tested directly.
 * zkVerify() is tested against a fake fetch that simulates the prover.
 */

import { describe, it } from 'node:test'
import * as assert from 'node:assert/strict'
import { ZKProofProvider } from '../src/security/proofs/ZKProofProvider'
import type { ZKProverConfig } from '../src/security/proofs/ZKProofProvider'
import { generateNonce } from '../src/security/commitments'

// ─── Mock Prover ───

function createMockFetch(response: Record<string, unknown>, status = 200) {
  return async (url: string | URL | Request, init?: RequestInit) => {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => response,
      text: async () => JSON.stringify(response),
    } as Response
  }
}

function createConfig(fetch: typeof globalThis.fetch): ZKProverConfig {
  return {
    endpoint: 'https://prover.test',
    apiKey: 'test-key',
    timeoutMs: 5000,
    fetch,
  }
}

describe('ZKProofProvider', () => {
  // ─── Commitment (Layer A compatibility) ───

  describe('commit/verify (Layer A compatibility)', () => {
    it('creates a commitment for a string value', async () => {
      const provider = new ZKProofProvider(createConfig(createMockFetch({})))
      const nonce = generateNonce(32)
      const commitment = await provider.commit('entity-1', 'name', 'Alice', nonce)

      assert.equal(commitment.entityId, 'entity-1')
      assert.equal(commitment.field, 'name')
      assert.equal(commitment.algorithm, 'sha256')
      assert.ok(commitment.hash.length > 0)
      assert.ok(commitment.createdAt)
    })

    it('verifies matching value returns true', async () => {
      const provider = new ZKProofProvider(createConfig(createMockFetch({})))
      const nonce = generateNonce(32)
      const commitment = await provider.commit('entity-1', 'age', 30, nonce)
      const result = await provider.verify(commitment, 30, nonce)

      assert.equal(result.matches, true)
      assert.ok(result.verifiedAt)
    })

    it('rejects non-matching value', async () => {
      const provider = new ZKProofProvider(createConfig(createMockFetch({})))
      const nonce = generateNonce(32)
      const commitment = await provider.commit('entity-1', 'age', 30, nonce)
      const result = await provider.verify(commitment, 31, nonce)

      assert.equal(result.matches, false)
    })

    it('different nonces produce different commitments', async () => {
      const provider = new ZKProofProvider(createConfig(createMockFetch({})))
      const nonce1 = generateNonce(32)
      const nonce2 = generateNonce(32)
      const c1 = await provider.commit('e1', 'f', 'val', nonce1)
      const c2 = await provider.commit('e1', 'f', 'val', nonce2)

      assert.notEqual(c1.hash, c2.hash)
    })

    it('handles null and undefined values', async () => {
      const provider = new ZKProofProvider(createConfig(createMockFetch({})))
      const nonce = generateNonce(32)
      const c1 = await provider.commit('e1', 'f', null, nonce)
      const c2 = await provider.commit('e1', 'f', undefined, nonce)

      // Both canonicalize to '' so should match
      assert.equal(c1.hash, c2.hash)
    })

    it('handles object values with deterministic key ordering', async () => {
      const provider = new ZKProofProvider(createConfig(createMockFetch({})))
      const nonce = generateNonce(32)
      const c1 = await provider.commit('e1', 'data', { b: 2, a: 1 }, nonce)
      const c2 = await provider.commit('e1', 'data', { a: 1, b: 2 }, nonce)

      assert.equal(c1.hash, c2.hash)
    })
  })

  // ─── zkVerify (Layer B) ───

  describe('zkVerify', () => {
    it('sends correct request to prover and returns result', async () => {
      let capturedUrl = ''
      let capturedBody: Record<string, unknown> = {}
      let capturedHeaders: Record<string, string> = {}

      const mockFetch = async (url: string | URL | Request, init?: RequestInit) => {
        capturedUrl = url as string
        capturedBody = JSON.parse(init?.body as string)
        capturedHeaders = init?.headers as Record<string, string>
        return {
          ok: true,
          status: 200,
          json: async () => ({ result: true, proof: 'proof-abc' }),
          text: async () => '',
        } as Response
      }

      const provider = new ZKProofProvider(createConfig(mockFetch))
      const encrypted = new Uint8Array([1, 2, 3, 4])
      const result = await provider.zkVerify(encrypted, { operator: 'gt', value: 18 })

      assert.equal(capturedUrl, 'https://prover.test/verify')
      assert.equal(capturedBody.operator, 'gt')
      assert.equal(capturedBody.comparand, 18)
      assert.ok(capturedBody.encryptedValue) // base64 encoded
      assert.equal(capturedHeaders['Authorization'], 'Bearer test-key')
      assert.equal(capturedHeaders['Content-Type'], 'application/json')

      assert.equal(result.result, true)
      assert.equal(result.proof, 'proof-abc')
      assert.ok(result.verifiedAt)
    })

    it('returns false result from prover', async () => {
      const provider = new ZKProofProvider(createConfig(
        createMockFetch({ result: false })
      ))
      const result = await provider.zkVerify(
        new Uint8Array([1]),
        { operator: 'eq', value: 'wrong' }
      )

      assert.equal(result.result, false)
      assert.equal(result.proof, undefined)
    })

    it('throws on prover HTTP error', async () => {
      const provider = new ZKProofProvider(createConfig(
        createMockFetch({ error: 'bad request' }, 400)
      ))

      await assert.rejects(
        () => provider.zkVerify(new Uint8Array([1]), { operator: 'eq', value: 1 }),
        (err: Error) => {
          assert.ok(err.message.includes('400'))
          return true
        }
      )
    })

    it('throws on prover application error', async () => {
      const provider = new ZKProofProvider(createConfig(
        createMockFetch({ result: false, error: 'circuit error' })
      ))

      await assert.rejects(
        () => provider.zkVerify(new Uint8Array([1]), { operator: 'lt', value: 5 }),
        (err: Error) => {
          assert.ok(err.message.includes('circuit error'))
          return true
        }
      )
    })

    it('works without apiKey', async () => {
      let capturedHeaders: Record<string, string> = {}

      const mockFetch = async (_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers as Record<string, string>
        return {
          ok: true,
          status: 200,
          json: async () => ({ result: true }),
          text: async () => '',
        } as Response
      }

      const provider = new ZKProofProvider({
        endpoint: 'https://prover.test',
        fetch: mockFetch,
      })

      await provider.zkVerify(new Uint8Array([1]), { operator: 'eq', value: 1 })
      assert.equal(capturedHeaders['Authorization'], undefined)
    })

    it('supports all ZK operators', async () => {
      const operators = ['eq', 'gt', 'lt', 'gte', 'lte', 'neq'] as const
      for (const op of operators) {
        let capturedOp = ''
        const mockFetch = async (_url: string | URL | Request, init?: RequestInit) => {
          capturedOp = JSON.parse(init?.body as string).operator
          return {
            ok: true,
            status: 200,
            json: async () => ({ result: true }),
            text: async () => '',
          } as Response
        }

        const provider = new ZKProofProvider({ endpoint: 'https://prover.test', fetch: mockFetch })
        await provider.zkVerify(new Uint8Array([1]), { operator: op, value: 42 })
        assert.equal(capturedOp, op, `operator ${op} should be forwarded`)
      }
    })
  })

  describe('provider identity', () => {
    it('has name "zk-proof"', () => {
      const provider = new ZKProofProvider({ endpoint: 'https://test', fetch: createMockFetch({}) })
      assert.equal(provider.name, 'zk-proof')
    })
  })
})
