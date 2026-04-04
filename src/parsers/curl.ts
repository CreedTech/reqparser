import { parse } from "shell-quote";
import type { NormalizedRequest, RequestParser } from "../core/types";

export const curlParser: RequestParser = {
  name: "curl",

  canParse(input: string): boolean {
    return input.trim().startsWith("curl ");
  },

  async parse(input: string): Promise<NormalizedRequest> {
    // 1. Tokenize the shell command safely
    const tokens = parse(input);
    
    let url = "";
    let method = "GET";
    const headers: Record<string, string> = {};
    let bodyRaw: string | undefined;
    const warnings: string[] = [];

    let isParsingHeaders = false;
    let isParsingData = false;
    let isParsingMethod = false;

    // 2. Iterate through the tokens to extract data
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (typeof token !== "string") continue; // Ignore glob patterns/operators

      if (token === "curl") continue;

      // Check if the current token is a URL
      if (token.startsWith("http://") || token.startsWith("https://")) {
        url = token;
        continue;
      }

      // Handle Flags
      if (token === "-H" || token === "--header") {
        isParsingHeaders = true;
        continue;
      }

      if (token === "-X" || token === "--request") {
        isParsingMethod = true;
        continue;
      }

      if (token === "-d" || token === "--data" || token === "--data-raw" || token === "--data-binary") {
        isParsingData = true;
        // cURL implies POST if data is provided and no method is explicitly set
        if (method === "GET") method = "POST"; 
        continue;
      }

      // Extract Values based on the active flag
      if (isParsingHeaders) {
        const separatorIdx = token.indexOf(":");
        if (separatorIdx > -1) {
          const key = token.slice(0, separatorIdx).trim().toLowerCase();
          const value = token.slice(separatorIdx + 1).trim();
          headers[key] = value;
        } else {
          warnings.push(`Malformed header: ${token}`);
        }
        isParsingHeaders = false;
        continue;
      }

      if (isParsingMethod) {
        method = token.toUpperCase();
        isParsingMethod = false;
        continue;
      }

      if (isParsingData) {
        bodyRaw = token;
        isParsingData = false;
        continue;
      }
    }

    // 3. Content-Type Analysis
    let bodyJson: unknown = undefined;
    let bodyType: NormalizedRequest["body"]["type"] = "unknown";

    if (bodyRaw) {
      try {
        bodyJson = JSON.parse(bodyRaw);
        bodyType = "json";
      } catch {
        bodyType = "text";
      }
    }

    if (!url) {
      warnings.push("No valid URL found in the cURL command.");
    }

    return {
      url,
      method,
      headers,
      body: bodyRaw ? { raw: bodyRaw, json: bodyJson, type: bodyType } : undefined,
      meta: {
        source: "curl",
        warnings
      }
    };
  }
};