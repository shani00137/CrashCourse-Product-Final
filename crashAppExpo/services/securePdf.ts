/**
 * Secure on-device PDF cache.
 *
 * Course PDFs are downloaded once into a hidden, app-private folder and stored
 * encrypted (AES-256-GCM). They are never written to the user-visible
 * Documents/Downloads area and never posted as a system download notification
 * (expo-file-system streams the file itself instead of using Android's
 * DownloadManager).
 *
 * The viewer asks for the decrypted bytes, which are kept in memory and handed
 * straight to PDF.js, so a readable .pdf never sits on disk.
 */
import { Directory, File, Paths } from "expo-file-system";
import { gcm } from "@noble/ciphers/aes.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";

/** App-embedded key material. Not user-facing; obfuscates the cached files. */
const APP_SECRET =
  "cc.secure.pdf.v1:9f2c7b41d8e54a06b3f19c7a2e6d4085:Qm9va0NhY2hlS2V5";

const NONCE_BYTES = 12;
const SECURE_DIR_NAME = ".cc_secure";

const KEY: Uint8Array = sha256(utf8(APP_SECRET));

function utf8(value: string): Uint8Array {
  return utf8ToBytes(value);
}

function toHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function randomNonce(): Uint8Array {
  const webCrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (webCrypto && typeof webCrypto.getRandomValues === "function") {
    const nonce = new Uint8Array(NONCE_BYTES);
    webCrypto.getRandomValues(nonce);
    return nonce;
  }
  const seed = utf8(`${Date.now()}:${Math.random()}:${Math.random()}`);
  return sha256(seed).subarray(0, NONCE_BYTES);
}

function secureDir(): Directory {
  return new Directory(Paths.document, SECURE_DIR_NAME);
}

function cacheFile(url: string): File {
  return new File(secureDir(), `${toHex(sha256(utf8(url)))}.bin`);
}

function tmpFile(url: string): File {
  return new File(new Directory(Paths.cache, SECURE_DIR_NAME), `${toHex(sha256(utf8(url)))}.part`);
}

function encipher(plain: Uint8Array): Uint8Array {
  const nonce = randomNonce();
  return concat(nonce, gcm(KEY, nonce).encrypt(plain));
}

function decipher(payload: Uint8Array): Uint8Array {
  const nonce = payload.subarray(0, NONCE_BYTES);
  const body = payload.subarray(NONCE_BYTES);
  return gcm(KEY, nonce).decrypt(body);
}

function ensureDirs(): void {
  const dir = secureDir();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
}

/**
 * The native downloader parses the URL with `java.net.URI`, which rejects raw
 * spaces, brackets and other characters that are perfectly legal in a server
 * file name (for example "Human Anatomy 1.pdf"). Encode those without
 * double-encoding any existing %XX escapes.
 */
function toSafeUri(url: string): string {
  let encoded = url;
  try {
    encoded = encodeURI(url);
  } catch {
    encoded = url;
  }
  return encoded.replace(/%(?![0-9A-Fa-f]{2})/g, "%25");
}

/** True when the bytes contain the PDF header (`%PDF`) near the start. */
function looksLikePdf(bytes: Uint8Array): boolean {
  const limit = Math.min(bytes.length - 4, 1024);
  for (let i = 0; i <= limit; i++) {
    if (
      bytes[i] === 0x25 &&
      bytes[i + 1] === 0x50 &&
      bytes[i + 2] === 0x44 &&
      bytes[i + 3] === 0x46
    ) {
      return true;
    }
  }
  return false;
}

/** True when an encrypted copy of this PDF is already cached. */
export function hasSecurePdf(url: string): boolean {
  try {
    return cacheFile(url).exists;
  } catch {
    return false;
  }
}

/**
 * Downloads (if needed) and decrypts a PDF, returning the raw bytes. The
 * plaintext only ever lives in memory.
 */
export async function loadSecurePdfBytes(url: string): Promise<Uint8Array> {
  ensureDirs();
  const stored = cacheFile(url);

  if (stored.exists) {
    try {
      const cached = decipher(await stored.bytes());
      if (looksLikePdf(cached)) {
        return cached;
      }
    } catch {
      // Corrupt or key mismatch: drop it and fall through to a fresh download.
    }
    try {
      stored.delete();
    } catch {
      // ignore
    }
  }

  const tmpDir = new Directory(Paths.cache, SECURE_DIR_NAME);
  if (!tmpDir.exists) tmpDir.create({ intermediates: true, idempotent: true });
  const part = tmpFile(url);
  if (part.exists) {
    try {
      part.delete();
    } catch {
      // ignore
    }
  }

  const downloaded = await File.downloadFileAsync(toSafeUri(url), part);
  const plain = await downloaded.bytes();
  if (!looksLikePdf(plain)) {
    try {
      downloaded.delete();
    } catch {
      // ignore
    }
    throw new Error("The downloaded file isn't a valid PDF. Please try again.");
  }

  stored.create({ intermediates: true, overwrite: true });
  stored.write(encipher(plain));

  try {
    downloaded.delete();
  } catch {
    // ignore
  }

  return plain;
}

/** Removes every encrypted PDF from the hidden cache. */
export function clearSecurePdfCache(): void {
  try {
    const dir = secureDir();
    if (dir.exists) dir.delete();
  } catch {
    // ignore
  }
}

const B64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Base64-encodes bytes without building one huge binary string. */
export function bytesToBase64(bytes: Uint8Array): string {
  const btoaFn = (globalThis as { btoa?: (s: string) => string }).btoa;
  if (typeof btoaFn === "function") {
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      const slice = bytes.subarray(i, i + chunk);
      let part = "";
      for (let j = 0; j < slice.length; j++) {
        part += String.fromCharCode(slice[j]);
      }
      binary += part;
    }
    return btoaFn(binary);
  }

  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const hasB1 = i + 1 < bytes.length;
    const hasB2 = i + 2 < bytes.length;
    const b1 = hasB1 ? bytes[i + 1] : 0;
    const b2 = hasB2 ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 0x03) << 4) | (b1 >> 4)];
    out += hasB1 ? B64[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    out += hasB2 ? B64[b2 & 0x3f] : "=";
  }
  return out;
}

/** Decrypted PDF as base64, ready to feed into the PDF.js viewer. */
export async function loadSecurePdfBase64(url: string): Promise<string> {
  return bytesToBase64(await loadSecurePdfBytes(url));
}
