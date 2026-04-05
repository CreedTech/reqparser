# CLI Usage

## Commands

### Detect input type

```bash
reqparser detect --file tests/fixtures/fetch/basic.input.txt
reqparser detect --stdin
```

### Parse and generate output

```bash
reqparser parse --file tests/fixtures/fetch/basic.input.txt --to axios
reqparser parse --file tests/fixtures/curl/basic.input.txt --to fetch
reqparser parse --stdin --to json
```

### Validate parsed input

```bash
reqparser validate --file tests/fixtures/curl/basic.input.txt
```

## Options

### `--file <path>`
Read request input from a file.

### `--stdin`
Read request input from standard input.

### `--to <format>`
Choose the output format.

Supported values:
- `axios`
- `fetch`
- `curl`
- `json`

### `--out <path>`
Write the generated output to a file instead of printing to stdout.

### `--redact`
Redact sensitive headers and common body secrets before generating output.

## Example: redact secrets

```bash
reqparser parse --file tests/fixtures/curl/basic.input.txt --to json --redact
```

This currently redacts header values such as:
- `authorization`
- `cookie`
- `set-cookie`
- `x-api-key`

And common JSON body keys such as:
- `password`
- `token`
- `secret`
- `access_token`
- `refresh_token`

## Development shortcuts

```bash
pnpm dev parse --file tests/fixtures/curl/basic.input.txt --to axios
pnpm build
pnpm test
```
