import type { NormalizedRequest, RequestGenerator } from "../core/types";

function formatHeaders(headers: Record<string, string>): string {
  const headerEntries = Object.entries(headers);

  if (!headerEntries.length) {
    return "{}";
  }

  return `{
${headerEntries.map(([key, value]) => `    "${key}": "${value}"`).join(",\n")}
  }`;
}

function formatJsonValue(value: unknown): string {
  return JSON.stringify(value, null, 2).replace(/\n/g, "\n  ");
}

function formatBody(request: NormalizedRequest): string | null {
  if (!request.body) {
    return null;
  }

  if (request.body.type === "json" && request.body.json !== undefined) {
    return `body: JSON.stringify(${formatJsonValue(request.body.json)})`;
  }

  if (request.body.raw) {
    return `body: ${JSON.stringify(request.body.raw)}`;
  }

  return null;
}

export const fetchGenerator: RequestGenerator = {
  name: "fetch",
  async generate(request: NormalizedRequest): Promise<string> {
    const options: string[] = [];
    const headerEntries = Object.entries(request.headers);

    if (request.method !== "GET") {
      options.push(`method: "${request.method}"`);
    }

    if (headerEntries.length > 0) {
      options.push(`headers: ${formatHeaders(request.headers)}`);
    }

    const bodyOption = formatBody(request);
    if (bodyOption) {
      options.push(bodyOption);
    }

    const optionsStr = options.length > 0 ? `, {\n  ${options.join(",\n  ")}\n}` : "";

    return `const response = await fetch("${request.url}"${optionsStr});`;
  },
};
