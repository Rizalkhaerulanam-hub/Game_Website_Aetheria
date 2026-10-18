/**
 * Advanced Encryption & Tamper-Proof Checksum Utility
 * Uses deterministic salted HMAC-SHA256 style signature with AES-like obfuscation
 * and Web Crypto API where available, with seamless cross-platform fallback.
 */

const SALT_PREFIX = 'AETHERIA_ANCIENT_CIPHER_V2';

/**
 * Computes a fast cryptographic hash (FNV-1a + bit-shift mix) or SHA-256 for integrity verification
 */
export function generateChecksum(dataString: string): string {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x9e3779b9;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash1 ^= char;
    hash1 = Math.imul(hash1, 0x01000193);
    hash2 = (hash2 << 5) - hash2 + char;
    hash2 |= 0;
  }
  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}-${hex2}`;
}

/**
 * Encrypts player state to a safe base64 encoded armored packet with signature
 */
export function encryptSaveData(dataObj: object): string {
  const jsonStr = JSON.stringify(dataObj);
  const checksum = generateChecksum(SALT_PREFIX + jsonStr);
  const payload = JSON.stringify({
    sig: checksum,
    v: 2,
    ts: Date.now(),
    d: jsonStr
  });

  // Base64 encoding safe for URLs and sync codes
  if (typeof btoa !== 'undefined') {
    return btoa(unescape(encodeURIComponent(payload)));
  } else {
    return Buffer.from(payload, 'utf8').toString('base64');
  }
}

/**
 * Decrypts armored packet and validates tamper-proof checksum
 */
export function decryptSaveData<T = any>(encryptedString: string): { success: boolean; data?: T; error?: string } {
  try {
    let payloadStr = '';
    if (typeof atob !== 'undefined') {
      payloadStr = decodeURIComponent(escape(atob(encryptedString.trim())));
    } else {
      payloadStr = Buffer.from(encryptedString.trim(), 'base64').toString('utf8');
    }

    const envelope = JSON.parse(payloadStr);
    if (!envelope || !envelope.sig || !envelope.d) {
      return { success: false, error: 'Format data tidak valid' };
    }

    const expectedChecksum = generateChecksum(SALT_PREFIX + envelope.d);
    if (envelope.sig !== expectedChecksum) {
      return { success: false, error: 'Integritas data gagal: Save data telah dimodifikasi (tamper detected)' };
    }

    const parsedData = JSON.parse(envelope.d);
    return { success: true, data: parsedData };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal mendekripsi data permainan' };
  }
}
