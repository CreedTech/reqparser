import type { NormalizedRequest, RequestGenerator } from "../core/types";

function quoteShell(value: string): string {
  if (value.length === 0) {
    return "''";
  }

  // Safe single-quote shell escaping:
  // abc'def -> 'abc'"'"'def'
  return `'${value.replace(/'/g, `'\"'\"'`)}'`;
}

function buildHeaderFlags(headers: Record<string, string>): string[] {
  return Object.entries(headers).map(([key, value]) => {
    return `-H ${quoteShell(`${key}: ${value}`)}`;
  });
}

function buildBodyFlag(request: NormalizedRequest): string[] {
  if (!request.body?.raw) {
    return [];
  }

  return [`--data-raw ${quoteShell(request.body.raw)}`];
}

export const curlGenerator: RequestGenerator = {
  name: "curl",

  async generate(request: NormalizedRequest): Promise<string> {
    const parts: string[] = ["curl"];

    const method = request.method.toUpperCase();

    if (method !== "GET") {
      parts.push(`-X ${method}`);
    }

    const headerFlags = buildHeaderFlags(request.headers);
    parts.push(...headerFlags);

    const bodyFlags = buildBodyFlag(request);
    parts.push(...bodyFlags);

    parts.push(quoteShell(request.url));

    return parts.join(" ");
  },
};
