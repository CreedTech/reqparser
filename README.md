# reqparser

Parse and transform copied HTTP requests into clean, reusable code.

`reqparser` helps you take copied network requests from browser DevTools or `curl`, normalize them into a structured request shape, and generate cleaner output for use in code, scripts, or debugging.

It is built for developers who want to stop manually rewriting copied requests into `axios`, `fetch`, `curl`, or JSON.

## Features

- Parse copied `fetch(...)` requests
- Parse copied `curl` commands
- Generate clean output as:
  - `axios`
  - `fetch`
  - `curl`
  - `json`

- Detect request input type
- Validate parsed requests
- Optionally redact sensitive headers
- Use from the CLI or extend the codebase further

## Supported input

### Fetch

Examples of supported fetch input:

```js
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({ id: 1, name: 'Ayodele' }),
});
```

### cURL

Examples of supported curl input:

```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Ayodele"}'
```

## Supported output

You can generate any of the following:

- `axios`
- `fetch`
- `curl`
- `json`

## Why this exists

Copied network requests are useful, but usually messy.

A request copied from DevTools or a terminal often contains formatting noise, inconsistent headers, escaped body strings, and other details that make it annoying to reuse directly in code.

`reqparser` is designed to make that workflow easier:

1. copy a request
2. parse it
3. turn it into something cleaner and reusable

## Installation

Clone the repo and install dependencies:

```bash
pnpm install
```

Run locally in development mode:

```bash
pnpm dev
```

Build the project:

```bash
pnpm build
```

Run tests:

```bash
pnpm test
```

## CLI usage

The CLI currently exposes three commands:

- `detect`
- `parse`
- `validate`

### Detect input type

```bash
pnpm dev detect --file test.txt
```

Or from stdin:

```bash
cat test.txt | pnpm dev detect --stdin
```

### Parse and generate output

Generate `axios`:

```bash
pnpm dev parse --file test.txt --to axios
```

Generate `fetch`:

```bash
pnpm dev parse --file test.txt --to fetch
```

Generate `curl`:

```bash
pnpm dev parse --file test.txt --to curl
```

Generate normalized JSON:

```bash
pnpm dev parse --file test.txt --to json
```

Write output to a file:

```bash
pnpm dev parse --file test.txt --to axios --out output.ts
```

Redact sensitive headers before generation:

```bash
pnpm dev parse --file test_curl.txt --to json --redact
```

### Validate input

```bash
pnpm dev validate --file test.txt
```

## Examples

### Example 1: fetch to axios

#### Input

```js
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({ id: 1, name: 'Ayodele' }),
});
```

#### Output

```ts
const response = await axios({
  url: 'https://api.example.com/users',
  method: 'post',
  headers: {
    'content-type': 'application/json',
  },
  data: '{"id":1,"name":"Ayodele"}',
});
```

### Example 2: curl to json

#### Input

```bash
curl -X POST https://api.stripe.com/v1/charges \
  -H "Authorization: Bearer sk_test_123" \
  -H "Content-Type: application/json" \
  -d '{"amount":2000}'
```

#### Output

```json
{
  "url": "https://api.stripe.com/v1/charges",
  "method": "POST",
  "headers": {
    "authorization": "Bearer sk_test_123",
    "content-type": "application/json"
  },
  "body": {
    "raw": "{\"amount\":2000}",
    "json": {
      "amount": 2000
    },
    "type": "json"
  },
  "meta": {
    "source": "curl",
    "warnings": []
  }
}
```

## Current status

`reqparser` is in an early but working stage.

The current architecture is already in place, including:

- CLI commands
- input detection
- fetch parsing
- curl parsing
- output generation
- basic tests

The parser support is still being hardened for more real-world request shapes and edge cases.

## Project structure

```text
src/
  cli/
  core/
  generators/
  parsers/
  utils/

tests/
```

### Main areas

- `src/cli` contains the command-line interface
- `src/core` contains shared types, detection, and engine flow
- `src/parsers` contains request parsers for different input formats
- `src/generators` contains output generators
- `src/utils` contains helper logic like redaction
- `tests` contains test coverage

## Development

Install dependencies:

```bash
pnpm install
```

Run in development:

```bash
pnpm dev parse --file test.txt --to json
```

Run tests:

```bash
pnpm test
```

Watch tests:

```bash
pnpm test:watch
```

## Roadmap

Planned improvements include:

- stronger fetch body parsing
- more complete curl parsing coverage
- optional redaction only at CLI generation stage
- better validation warnings
- fixture-based parser tests
- improved formatting of generated code
- package publishing
- future reusable engine API beyond the CLI

## Contributing

Issues and pull requests are welcome.

If you want to contribute, please:

1. open an issue describing the bug or feature
2. keep changes focused and small where possible
3. add tests for parser or generator changes
4. avoid breaking existing CLI behavior without documenting it

## License

MIT
