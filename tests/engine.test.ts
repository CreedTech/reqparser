import { describe, it, expect } from 'vitest';
import { generateRequest } from '../src/core/engine';

describe('Request Transformer Engine', () => {
    it('should transform a simple fetch to axios', async () => {
        const input = 'fetch("https://api.github.com/zen")';
        const output = await generateRequest(input, 'axios');

        expect(output).toContain('url: "https://api.github.com/zen"');
        expect(output).toContain('method: "get"');
    });

    it('should redact sensitive headers in curl transformation', async () => {
        const input = 'curl https://api.com -H "Authorization: Bearer secret-123"';
        const output = await generateRequest(input, 'json');
        const parsed = JSON.parse(output);

        expect(parsed.headers.authorization).toBe('REDACTED_BY_RTCLI');
    });

    it('should handle POST requests with bodies', async () => {
        const input = `fetch("https://api.com", { 
      method: "POST", 
      body: JSON.stringify({ id: 1 }) 
    })`;
        const output = await generateRequest(input, 'fetch');

        expect(output).toContain('method: "POST"');
        expect(output).toContain('body: "{\\"id\\":1}"');
    });

    import { describe, it, expect } from "vitest";
    import { generateRequest, parseRequest } from "../src/core/engine";

    describe("Request Transformer Engine", () => {
        it("should transform a simple fetch to axios", async () => {
            const input = 'fetch("https://api.github.com/zen")';
            const output = await generateRequest(input, "axios");

            expect(output).toContain('url: "https://api.github.com/zen"');
            expect(output).toContain('method: "get"');
        });

        it("should parse curl auth header without automatic redaction", async () => {
            const input = 'curl https://api.com -H "Authorization: Bearer secret-123"';
            const parsed = await parseRequest(input);

            expect(parsed.headers.authorization).toBe("Bearer secret-123");
        });

        it("should handle POST requests with string bodies", async () => {
            const input =
                'fetch("https://api.com", { method: "POST", body: "{\\"id\\":1}" })';
            const output = await generateRequest(input, "fetch");

            expect(output).toContain('method: "POST"');
            expect(output).toContain('body: "{\\"id\\":1}"');
        });

        it("should parse JSON.stringify object bodies", async () => {
            const input = `fetch("https://api.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: 1, name: "Ayodele", active: true })
    })`;

            const parsed = await parseRequest(input);

            expect(parsed.body?.type).toBe("json");
            expect(parsed.body?.json).toEqual({
                id: 1,
                name: "Ayodele",
                active: true,
            });
            expect(parsed.body?.raw).toBe('{"id":1,"name":"Ayodele","active":true}');
        });

        it("should generate curl output", async () => {
            const input = `fetch("https://api.com/users", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ name: "Ayodele" })
    })`;

            const output = await generateRequest(input, "curl");

            expect(output).toContain("curl");
            expect(output).toContain("-X POST");
            expect(output).toContain("-H");
            expect(output).toContain("--data-raw");
            expect(output).toContain("https://api.com/users");
        });
    });
});
