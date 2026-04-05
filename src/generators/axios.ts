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

function formatData(request: NormalizedRequest): string {
  if (!request.body) {
    return "";
  }

  if (request.body.type === "json" && request.body.json !== undefined) {
    return `,\n  data: ${formatJsonValue(request.body.json)}`;
  }

  if (request.body.raw) {
    return `,\n  data: ${JSON.stringify(request.body.raw)}`;
  }

  return "";
}

export const axiosGenerator: RequestGenerator = {
  name: "axios",
  async generate(request: NormalizedRequest): Promise<string> {
    const headersStr = formatHeaders(request.headers);
    const bodyPart = formatData(request);

    return `const response = await axios({\n  url: "${request.url}",\n  method: "${request.method.toLowerCase()}",\n  headers: ${headersStr}${bodyPart}\n});`;
  },
};
