# Architecture

`reqparser` is designed around a simple pipeline:

```text
raw input
  -> detect input type
  -> parse into NormalizedRequest
  -> optionally redact
  -> generate new output format
```

## Core layers

### 1. CLI
Located in `src/cli`.

Responsibilities:
- read from file or stdin
- parse command-line flags
- call the engine
- optionally redact sensitive values
- print or write output

### 2. Core engine
Located in `src/core`.

Responsibilities:
- detect request input type
- route to the correct parser
- route to the correct generator
- keep parsing and generation separated

### 3. Parsers
Located in `src/parsers`.

Current parsers:
- `fetch.ts`
- `curl.ts`

Responsibilities:
- understand a specific input format
- extract URL, method, headers, and body
- return a shared `NormalizedRequest`

### 4. Generators
Located in `src/generators`.

Current generators:
- `axios.ts`
- `fetch.ts`
- `curl.ts`
- `json.ts`

Responsibilities:
- take a normalized request
- emit a target representation

### 5. Utilities
Located in `src/utils`.

Current utilities include redaction helpers that operate on headers and structured JSON request bodies.

## Normalized request model

The project uses a shared internal shape so that different input formats can produce the same request model and different generators can consume the same model.

That shared model lives in `src/core/types.ts`.

## Why this design matters

This structure keeps the project easy to grow.

Examples of future additions:
- HAR parser
- Postman parser
- additional generators for docs or SDK snippets
- stronger validation layer
- browser UI on top of the same engine

## Current limitations

- parser coverage is still intentionally narrow in some areas
- generated code favors correctness over ideal stylistic output in edge cases
- validation is still lightweight

## Improvement areas

The next high-value improvements are:
- better parser coverage for real-world fetch and curl shapes
- smarter generator output for more request types
- stronger validation and warnings
- more fixture coverage in tests
