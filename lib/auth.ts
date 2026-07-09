const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const AUTH_COOKIE_NAME = "scale_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  email: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  active?: boolean;
  iat: number;
  exp: number;
};

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary);
}

function base64ToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = `${normalized}${"=".repeat((4 - (normalized.length % 4)) % 4)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64Url(value: string) {
  return bytesToBase64(encoder.encode(value))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  return decoder.decode(base64ToBytes(value));
}

async function importHmacKey(secret: string, usage: KeyUsage[]) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    usage
  );
}

async function signMessage(message: string, secret: string) {
  const key = await importHmacKey(secret, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return bytesToBase64(new Uint8Array(signature))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function verifyMessage(message: string, signature: string, secret: string) {
  const key = await importHmacKey(secret, ["verify"]);
  return crypto.subtle.verify("HMAC", key, base64ToBytes(signature), encoder.encode(message));
}

export async function createSessionToken(
  email: string,
  secret: string,
  profile: {
    firstName?: string;
    lastName?: string;
    organization?: string;
    active?: boolean;
  } = {}
) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    organization: profile.organization,
    active: profile.active,
    iat: now,
    exp: now + SESSION_MAX_AGE_SECONDS
  };

  const payloadPart = encodeBase64Url(JSON.stringify(payload));
  const signature = await signMessage(payloadPart, secret);

  return `${payloadPart}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null, secret: string) {
  if (!token || !secret) return null;

  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const signatureValid = await verifyMessage(payloadPart, signature, secret);
  if (!signatureValid) return null;

  let payload: SessionPayload;

  try {
    payload = JSON.parse(decodeBase64Url(payloadPart)) as SessionPayload;
  } catch {
    return null;
  }

  if (
    !payload ||
    typeof payload.email !== "string" ||
    !payload.email.trim() ||
    (payload.firstName !== undefined && typeof payload.firstName !== "string") ||
    (payload.lastName !== undefined && typeof payload.lastName !== "string") ||
    (payload.organization !== undefined && typeof payload.organization !== "string") ||
    (payload.active !== undefined && typeof payload.active !== "boolean") ||
    typeof payload.iat !== "number" ||
    typeof payload.exp !== "number" ||
    payload.exp <= Math.floor(Date.now() / 1000)
  ) {
    return null;
  }

  return payload;
}

export function sanitizeRedirectPath(value: string | null | undefined, fallback = "/lesson-plans") {
  if (!value) return fallback;

  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("/") && !decoded.startsWith("//")) {
      return decoded;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function getSessionCookieOptions(maxAgeSeconds = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds
  };
}
