import type { NormalizedRequest } from "../core/types";

const REDACTION_PLACEHOLDER = "REDACTED_BY_REQPARSER";
const SENSITIVE_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization",
];
const SENSITIVE_BODY_KEYS = [
  "password",
  "token",
  "secret",
  "apikey",
  "api_key",
  "access_token",
  "refresh_token",
  "client_secret",
];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function shouldRedactKey(key: string): boolean {
  return SENSITIVE_BODY_KEYS.includes(key.toLowerCase());
}

function redactJsonValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactJsonValue);
  }

  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      next[key] = shouldRedactKey(key)
        ? REDACTION_PLACEHOLDER
        : redactJsonValue(nestedValue);
    }

    return next;
  }

  return value;
}

export function redactHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const redacted = { ...headers };

  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      redacted[key] = REDACTION_PLACEHOLDER;
    }
  }

  return redacted;
}

export function redactBody(
  body: NormalizedRequest["body"],
): NormalizedRequest["body"] {
  if (!body) {
    return body;
  }

  if (body.type === "json" && body.json !== undefined) {
    const redactedJson = redactJsonValue(body.json);

    return {
      ...body,
      json: redactedJson,
      raw: JSON.stringify(redactedJson),
    };
  }

  return body;
}

export function redactRequest(request: NormalizedRequest): NormalizedRequest {
  return {
    ...request,
    headers: redactHeaders(request.headers),
    body: redactBody(request.body),
  };
}
