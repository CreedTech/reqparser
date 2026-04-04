import type { NormalizedRequest, RequestGenerator } from "../core/types";

export const fetchGenerator: RequestGenerator = {
  name: "fetch",
  async generate(request: NormalizedRequest): Promise<string> {
    const headerEntries = Object.entries(request.headers);
    const headersStr = headerEntries.length 
      ? `{\n${headerEntries.map(([k, v]) => `    "${k}": "${v}"`).join(",\n")}\n  }` 
      : "{}";

    const options: string[] = [];
    
    if (request.method !== "GET") {
      options.push(`method: "${request.method}"`);
    }
    if (headerEntries.length > 0) {
      options.push(`headers: ${headersStr}`);
    }
    if (request.body?.raw) {
      options.push(`body: ${JSON.stringify(request.body.raw)}`);
    }

    const optionsStr = options.length > 0 ? `, {\n  ${options.join(",\n  ")}\n}` : "";

    return `const response = await fetch("${request.url}"${optionsStr});`;
  }
};
