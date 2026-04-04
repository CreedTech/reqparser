const SENSITIVE_HEADERS = ['authorization', 'cookie', 'set-cookie', 'x-api-key'];

export function redactHeaders(headers: Record<string, string>): Record<string, string> {
  const redacted = { ...headers };
  for (const key of Object.keys(redacted)) {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) {
      redacted[key] = "REDACTED_BY_RTCLI";
    }
  }
  return redacted;
}
