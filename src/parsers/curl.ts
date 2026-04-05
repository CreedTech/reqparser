import { parse } from "shell-quote";
import type { ParseEntry } from "shell-quote";
import type { NormalizedRequest, RequestParser } from "../core/types";

function isStringToken(token: ParseEntry): token is string {
  return typeof token === "string";
}

export const curlParser: RequestParser = {
  name: "curl",

  canParse(input: string): boolean {
    return input.trim().startsWith("curl ");
  },

  async parse(input: string): Promise<NormalizedRequest> {
    const tokens = parse(input);

    let url = "";
    let method = "GET";
    const headers: Record<string, string> = {};
    let bodyRaw: string | undefined;
    const warnings: string[] = [];

    let expectHeader = false;
    let expectData = false;
    let expectMethod = false;

    for (const token of tokens) {
      if (!isStringToken(token)) continue;

      if (token === "curl") continue;

      if (expectHeader) {
        const separatorIdx = token.indexOf(":");
        if (separatorIdx > -1) {
          const key = token.slice(0, separatorIdx).trim().toLowerCase();
          const value = token.slice(separatorIdx + 1).trim();
          headers[key] = value;
        } else {
          warnings.push(`Malformed header: ${token}`);
        }
        expectHeader = false;
        continue;
      }

      if (expectMethod) {
        method = token.toUpperCase();
        expectMethod = false;
        continue;
      }

      if (expectData) {
        bodyRaw = token;
        if (method === "GET") method = "POST";
        expectData = false;
        continue;
      }

      if (token === "-H" || token === "--header") {
        expectHeader = true;
        continue;
      }

      if (token === "-X" || token === "--request") {
        expectMethod = true;
        continue;
      }

      if (
        token === "-d" ||
        token === "--data" ||
        token === "--data-raw" ||
        token === "--data-binary"
      ) {
        expectData = true;
        continue;
      }

      if (token.startsWith("http://") || token.startsWith("https://")) {
        url = token;
      }
    }

    let body:
      | {
          raw?: string;
          json?: unknown;
          type: "json" | "text" | "form-urlencoded" | "multipart" | "unknown";
        }
      | undefined;

    if (bodyRaw !== undefined) {
      try {
        body = {
          raw: bodyRaw,
          json: JSON.parse(bodyRaw),
          type: "json",
        };
      } catch {
        body = {
          raw: bodyRaw,
          type: "text",
        };
      }
    }

    if (!url) {
      warnings.push("No valid URL found in the cURL command.");
    }

    return {
      url,
      method,
      headers,
      body,
      meta: {
        source: "curl",
        warnings,
      },
    };
  },
};
