import { describe, it, expect } from "vitest";
import { generateRequest, parseRequest } from "../src/core/engine";

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

  it("handles POST requests with string bodies", async () => {
    const input =
      'fetch("https://api.com", { method: "POST", body: "{\\"id\\":1}" })';
    const output = await generateRequest(input, "fetch");

    expect(output).toContain('method: "POST"');
    expect(output).toContain('body: "{\\"id\\":1}"');
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
