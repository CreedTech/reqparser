# reqparser Wiki

Welcome to the `reqparser` project wiki.

`reqparser` is a CLI and request transformation engine that parses copied HTTP requests and generates reusable output formats such as `axios`, `fetch`, `curl`, and normalized JSON.

## Start here

- [CLI usage](./CLI.md)
- [Architecture](./Architecture.md)

## What reqparser does

At a high level, the project follows this flow:

1. Detect the incoming request format
2. Parse it into a normalized request object
3. Optionally redact sensitive values
4. Generate a new output format

## Current supported input

- `fetch(...)`
- `curl ...`

## Current supported output

- `axios`
- `fetch`
- `curl`
- `json`

## Current priorities

- improve parser coverage for real-world request shapes
- improve generated output fidelity
- strengthen validation and redaction
- expand fixture-based testing

## Notes on this wiki

These pages live in `docs/wiki` inside the repository so they can be versioned with the codebase. If you prefer GitHub’s separate wiki UI, you can copy these pages there later.
