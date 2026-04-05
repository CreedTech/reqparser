import type { NormalizedRequest, RequestGenerator } from "../core/types";

export const axiosGenerator: RequestGenerator = {
  name: "axios",
  async generate(request: NormalizedRequest): Promise<string> {
    const headerEntries = Object.entries(request.headers);
    const headersStr = headerEntries.length
      ? `{\n${headerEntries.map(([k, v]) => `    "${k}": "${v}"`).join(",\n")}\n  }`
      : "{}";
    const bodyPart = request.body?.raw
      ? `,\n  data: ${JSON.stringify(request.body.raw)}`
      : "";
    return `const response = await axios({\n  url: "${request.url}",\n  method: "${request.method.toLowerCase()}",\n  headers: ${headersStr}${bodyPart}\n});`;
  },
};
