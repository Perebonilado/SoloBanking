import type { EncryptedEnvelope, PublicKey } from "@/types/banking";

const keyCache = new Map<string, Promise<CryptoKey>>();

function fromBase64(value: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
  return bytes.buffer;
}

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function importPublicKey(spki: string): Promise<CryptoKey> {
  let key = keyCache.get(spki);
  if (!key) {
    key = crypto.subtle.importKey(
      "spki",
      fromBase64(spki),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"],
    );
    keyCache.set(spki, key);
  }
  return key;
}

export async function encryptPayload(
  publicKey: PublicKey,
  fields: Record<string, unknown>,
): Promise<EncryptedEnvelope> {
  const key = await importPublicKey(publicKey.publicKey);
  const plaintext = new TextEncoder().encode(
    JSON.stringify({
      ...fields,
      nonce: crypto.randomUUID(),
      timestamp: Date.now(),
    }),
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    plaintext,
  );
  return { keyId: publicKey.keyId, payload: toBase64(ciphertext) };
}
