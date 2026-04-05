import type { InputSource } from "./types";

export function detectInputType(input: string): InputSource {
  const trimmed = input.trim();

  if (trimmed.startsWith("fetch(") || trimmed.startsWith("await fetch(")) {
    return "fetch";
  }

  if (trimmed.startsWith("curl ")) {
    return "curl";
  }

  return "unknown";
}
