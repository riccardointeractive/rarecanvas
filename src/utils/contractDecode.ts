/**
 * Contract Decode Utilities
 * 
 * Shared utilities for decoding smart contract response data.
 * Used by CTR Kart game, admin panel, and any future contract integrations.
 * 
 * Includes:
 * - Base64 → number/string decoders
 * - Bech32 address encoding/decoding (Klever format)
 */

// ============================================================================
// Base64 Decoders
// ============================================================================

/**
 * Decode base64 to a hex number (for small integers)
 */
export const decodeHex = (base64: string): number => {
  if (!base64) return 0;
  try {
    const hex = Array.from(atob(base64))
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    return parseInt(hex || '0', 16);
  } catch {
    return 0;
  }
};

/**
 * Decode base64 to a BigInt, then convert to number
 * Use for large token amounts that might exceed safe integer range
 */
export const decodeBigUint = (base64: string): number => {
  if (!base64) return 0;
  try {
    const bytes = Array.from(atob(base64)).map((c) => c.charCodeAt(0));
    let result = BigInt(0);
    for (const byte of bytes) {
      result = (result << BigInt(8)) | BigInt(byte);
    }
    return Number(result);
  } catch {
    return 0;
  }
};

/**
 * Decode base64 to a string (for token IDs, names, etc.)
 */
export const decodeString = (base64: string): string => {
  if (!base64) return '';
  try {
    return atob(base64);
  } catch {
    return '';
  }
};

// ============================================================================
// Bech32 Encoding (Klever Address Format)
// ============================================================================

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) {
        chk ^= GEN[i]!;
      }
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) >> 5);
  }
  ret.push(0);
  for (let i = 0; i < hrp.length; i++) {
    ret.push(hrp.charCodeAt(i) & 31);
  }
  return ret;
}

function bech32CreateChecksum(hrp: string, data: number[]): number[] {
  const values = bech32HrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0]);
  const polymod = bech32Polymod(values) ^ 1;
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) {
    ret.push((polymod >> (5 * (5 - i))) & 31);
  }
  return ret;
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] | null {
  let acc = 0;
  let bits = 0;
  const ret: number[] = [];
  const maxv = (1 << toBits) - 1;
  
  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) return null;
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      ret.push((acc >> bits) & maxv);
    }
  }
  
  if (pad) {
    if (bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv);
    }
  } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv)) {
    return null;
  }
  
  return ret;
}

function bytesToBech32(hrp: string, bytes: number[]): string {
  const converted = convertBits(bytes, 8, 5, true);
  if (!converted) return '';
  
  const checksum = bech32CreateChecksum(hrp, converted);
  const combined = converted.concat(checksum);
  
  let result = hrp + '1';
  for (const c of combined) {
    result += BECH32_CHARSET[c];
  }
  return result;
}

/**
 * Decode base64 address bytes and convert to bech32 klv address
 * Used for decoding addresses from smart contract query results
 * 
 * @param base64 - Base64 encoded 32-byte address
 * @returns Bech32 formatted Klever address (klv1...)
 */
export function decodeKleverAddress(base64: string): string {
  if (!base64) return '';
  try {
    const bytes = Array.from(atob(base64)).map(c => c.charCodeAt(0));
    if (bytes.length !== 32 || bytes.every(b => b === 0)) return '';
    return bytesToBech32('klv', bytes);
  } catch {
    return '';
  }
}

/**
 * Convert bech32 klv address to hex bytes
 * Used for encoding addresses to send to smart contracts
 * 
 * @param address - Bech32 formatted Klever address (klv1...)
 * @returns Hex string of 32-byte address, or null if invalid
 */
export function bech32ToHex(address: string): string | null {
  if (!address || !address.startsWith('klv1')) return null;
  
  try {
    const hrp = 'klv';
    const data = address.slice(hrp.length + 1); // Remove 'klv1'
    
    // Decode bech32 characters to 5-bit values
    const values: number[] = [];
    for (const char of data) {
      const idx = BECH32_CHARSET.indexOf(char);
      if (idx === -1) return null;
      values.push(idx);
    }
    
    // Remove 6-character checksum
    const payload = values.slice(0, -6);
    
    // Convert from 5-bit to 8-bit
    const bytes = convertBits(payload, 5, 8, false);
    if (!bytes || bytes.length !== 32) return null;
    
    // Convert to hex string
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

// ============================================================================
// Common Formatters
// ============================================================================

/**
 * Format a long address for display (truncate middle)
 */
export const formatAddress = (addr: string): string => {
  if (!addr || addr.length <= 16) return addr || '';
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
};

/**
 * Format seconds to human-readable duration
 */
export const formatDuration = (seconds: number): string => {
  if (seconds >= 86400) return `${Math.floor(seconds / 86400)}d`;
  if (seconds >= 3600) return `${Math.floor(seconds / 3600)}h`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}min`;
  return `${seconds}s`;
};

/**
 * Format timezone offset to UTC string
 */
export const formatTimezone = (offset: number): string => {
  const hours = Math.floor(offset / 3600);
  const mins = Math.floor((offset % 3600) / 60);
  if (mins === 0) return `UTC+${hours}`;
  return `UTC+${hours}:${mins.toString().padStart(2, '0')}`;
};
