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
});