// ─── Types ───
export * from './types'

// ─── Models ───
export * from './KeyVault'

// ─── Services ───
export { EncryptionService } from './encryption'
export { HashCommitmentProvider, generateNonce } from './commitments'

// ─── Interfaces ───
export type { IProofProvider } from './proofs/IProofProvider'
