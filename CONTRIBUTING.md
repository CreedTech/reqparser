# Contributing to reqparser

Thanks for your interest in contributing.

## Before you start

- Read the README first.
- Open an issue before starting large changes.
- Keep pull requests focused and small where possible.

## Local setup

```bash
pnpm install
pnpm build
pnpm test
```

## Recommended pre-commit setup

This repository includes a `.pre-commit-config.yaml` file.

If you use `pre-commit`, install it and run:

```bash
pre-commit install
pre-commit install --hook-type pre-push
```

The configured hooks help catch formatting, YAML/JSON issues, build failures, and test regressions before changes are pushed.

## Development expectations

Please make sure your change:

- builds successfully with `pnpm build`
- passes tests with `pnpm test`
- includes tests when parser or generator behavior changes
- updates docs when CLI behavior or supported formats change

## Commit style

Conventional Commits are preferred, for example:

- `feat: add HAR parser skeleton`
- `fix: handle JSON.stringify request bodies`
- `docs: improve CLI examples`
- `test: add curl parser coverage`

## Pull requests

A good pull request should:

- explain what changed
- explain why it changed
- mention any parser/generator edge cases covered
- link to the related issue if one exists

## Scope guidance

Good contributions include:

- parser correctness improvements
- generator output improvements
- redaction and validation improvements
- documentation and examples
- tests and fixture coverage
- CI and repository maintenance improvements

If you are unsure whether a change is in scope, open an issue first.
