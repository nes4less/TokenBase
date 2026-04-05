// ─── Types ───
export * from './types'

// ─── Models ───
export * from './KeyVault'

// ─── Services ───
export { EncryptionService } from './encryption'
export { HashCommitmentProvider, generateNonce } from './commitments'
export { KeyLifecycleManager } from './key-lifecycle'
export type { KeyExchangeInit, KeyExchangeComplete, DeriveOptions } from './key-lifecycle'

// ─── Interfaces ───
export type { IProofProvider } from './proofs/IProofProvider'

// ─── Proof Providers ───
export { ZKProofProvider } from './proofs/ZKProofProvider'
export type { ZKProverConfig } from './proofs/ZKProofProvider'
