import { describe, it, expect } from "vitest";
import {
  generateFromParsed,
  generateRequest,
  parseRequest,
} from "../src/core/engine";
import { redactRequest } from "../src/utils/redact";

describe("reqparser engine", () => {
  it("transforms a simple fetch to axios", async () => {
    const input = 'fetch("https://api.github.com/zen")';
    const output = await generateRequest(input, "axios");

    expect(output).toContain('url: "https://api.github.com/zen"');
    expect(output).toContain('method: "get"');
  });

  it("parses curl auth header without automatic redaction", async () => {
    const input = 'curl https://api.com -H "Authorization: Bearer secret-123"';
    const parsed = await parseRequest(input);

    expect(parsed.headers.authorization).toBe("Bearer secret-123");
  });

  it("emits structured JSON for axios when parsed JSON is available", async () => {
    const input = `fetch("https://api.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: 1, active: true })
    })`;

    const output = await generateRequest(input, "axios");

    expect(output).toContain("data: {");
    expect(output).toContain('"id": 1');
    expect(output).toContain('"active": true');
    expect(output).not.toContain('data: "{');
  });

  it("emits JSON.stringify for structured fetch bodies", async () => {
    const input = `fetch("https://api.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: 1, name: "Ayodele" })
    })`;

    const output = await generateRequest(input, "fetch");

    expect(output).toContain("body: JSON.stringify({");
    expect(output).toContain('"id": 1');
    expect(output).toContain('"name": "Ayodele"');
  });

  it("redacts sensitive headers and common body secrets", async () => {
    const input = `fetch("https://api.com", {
      method: "POST",
      headers: {
        "authorization": "Bearer secret-123",
        "content-type": "application/json"
      },
      body: JSON.stringify({ token: "abc", nested: { password: "secret" } })
    })`;

    const parsed = await parseRequest(input);
    const redacted = redactRequest(parsed);
    const output = await generateFromParsed(redacted, "json");
    const result = JSON.parse(output);

    expect(result.headers.authorization).toBe("REDACTED_BY_REQPARSER");
    expect(result.body.json.token).toBe("REDACTED_BY_REQPARSER");
    expect(result.body.json.nested.password).toBe("REDACTED_BY_REQPARSER");
  });

  it("generates curl output", async () => {
    const input = `fetch("https://api.com/users", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: "{\\"name\\":\\"Ayodele\\"}"
    })`;

    const output = await generateRequest(input, "curl");

    expect(output).toContain("curl");
    expect(output).toContain("-X POST");
    expect(output).toContain("--data-raw");
    expect(output).toContain("https://api.com/users");
  });
});
