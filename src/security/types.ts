/**
 * Security Layer Type Definitions.
 *
 * Design Decisions:
 * - D3: Noble (@noble/ciphers + @noble/curves + @noble/hashes)
 * - D4: Hash-based commitments (Layer A) + opt-in ZK server (Layer B)
 *
 * Key architecture: Handshake-derived keys using ECDH + HKDF.
 * No party holds the full key. Handshake broken = keys gone.
 */

// ─── Algorithms ───

/** Supported symmetric encryption algorithms. */
export type KeyAlgorithm = 'aes-256-gcm' | 'xchacha20-poly1305'

/** Supported key agreement protocols. */
export type KeyAgreement = 'x25519' | 'p256'

/** Supported KDF algorithms. */
export type KDFAlgorithm = 'hkdf-sha256'

// ─── Encryption Granularity ───

/**
 * How data is encrypted — from coarsest to finest.
 * Default is scope-level. Field-level is opt-in for sensitive data.
 */
export type EncryptionGranularity =
  | 'scope'          // All records in a scope under one key
  | 'row'            // Entire record encrypted as a blob
  | 'field'          // Individual values encrypted with scope key + field salt
  | 'verification'   // Hash commitments for ZK yes/no queries

// ─── Key Material ───

/** An ephemeral key pair for Handshake key agreement. */
export interface KeyPair {
  /** Raw public key bytes (32 bytes for X25519). */
  publicKey: Uint8Array
  /** Raw private key bytes (32 bytes for X25519). */
  privateKey: Uint8Array
}

/** A derived scope key — the result of Handshake key agreement + KDF. */
export interface DerivedKey {
  /** The raw key material. */
  key: Uint8Array
  /** SHA-256 fingerprint of the public key used in derivation. */
  fingerprint: string
  /** Which algorithm this key is intended for. */
  algorithm: KeyAlgorithm
  /** When this key was derived. */
  derivedAt: string
}

/** A key rotation record — append-only history. */
export interface KeyRotation {
  rotatedAt: string
  reason: string
  fingerprint: string
}

// ─── Encryption Operations ───

/** Encrypted payload — the output of encrypt(). */
export interface EncryptedPayload {
  /** The ciphertext (base64-encoded). */
  ciphertext: string
  /** The nonce/IV used (base64-encoded). */
  nonce: string
  /** Which algorithm was used. */
  algorithm: KeyAlgorithm
  /** Key fingerprint for lookup. */
  keyFingerprint: string
  /** Which granularity was applied. */
  granularity: EncryptionGranularity
  /** For field-level: which field this encrypts. */
  field?: string
}

/** Configuration for a model's encryption behavior. */
export interface EncryptionConfig {
  /** Default granularity for this model. */
  granularity: EncryptionGranularity
  /** Fields that require field-level encryption (overrides default). */
  encryptedFields?: string[]
  /** Fields that get verification commitments for ZK queries. */
  verifiableFields?: string[]
}

// ─── Proof System ───

/** The proof level a model declares — determines which proof system is used. */
export type ProofLevel = 'commitment' | 'zk'

/** A hash-based commitment (Layer A — local, no server needed). */
export interface Commitment {
  /** The commitment hash. */
  hash: string
  /** Which hash algorithm was used. */
  algorithm: 'sha256' | 'blake3'
  /** When the commitment was created. */
  createdAt: string
  /** The entity this commitment is for. */
  entityId: string
  /** Which field was committed. */
  field: string
}

/** Result of verifying a commitment. */
export interface CommitmentVerification {
  /** Whether the candidate matches the commitment. */
  matches: boolean
  /** The commitment that was checked. */
  commitment: Commitment
  /** When the verification was performed. */
  verifiedAt: string
}

/** Comparison operators for ZK verification queries. */
export type ZKOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'neq'

/** A zero-knowledge verification question. */
export interface ZKQuestion {
  operator: ZKOperator
  value: unknown
}

/** Result of a ZK verification. */
export interface ZKVerification {
  /** The answer to the question — without revealing the underlying value. */
  result: boolean
  /** Proof that the answer is correct (opaque, verifier-specific). */
  proof?: string
  /** When the verification was performed. */
  verifiedAt: string
}

// ─── Handshake Key Extensions ───

/**
 * Fields added to the Handshake model for key management.
 * These extend the existing Handshake — not a separate model.
 */
export interface HandshakeKeyFields {
  /** Public key of the initiator (ephemeral, per-handshake). */
  initiatorPublicKey: string | null
  /** Public keys of each party (map: partyId → base64-encoded public key). */
  partyPublicKeys: Record<string, string>
  /** SHA-256 fingerprint of the derived shared key. */
  keyFingerprint: string | null
  /** Encryption algorithm for this handshake's scope. */
  keyAlgorithm: KeyAlgorithm
  /** When the derived key was last rotated. */
  keyRotatedAt: string | null
}
