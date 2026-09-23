# Autonomous TypeScript Bug Fix Harness

An experimental project that explores autonomous repair of TypeScript bugs by combining an LLM, a sandboxed Vitest runner, and persistent attempt tracking.

## What this project does

This harness takes:

- a buggy TypeScript file
- a failing Vitest test
- a retry budget

Then it:

1. sends the bug and test context to an LLM,
2. asks for a patched version of the file,
3. validates and executes the patch in an isolated temporary sandbox,
4. re-runs only the provided failing test,
5. stores each attempt in Postgres with metadata such as timestamp, result, and diagnosis,
6. retries failed attempts until the fix passes or the retry limit is reached.

The goal is to automate a small repair loop for TypeScript bugs with traceability and repeatability.

## Why this project exists

The project is designed to test the idea of an autonomous bug-fix agent for code repair tasks. It aims to be a lightweight harness for experimenting with:

- LLM-generated patches
- sandboxed execution safety
- deterministic test verification
- audit trails for repair attempts
- iterative retry loops with failure feedback

## How the workflow works

```text
buggy.ts + failing test
        |
        v
LLM proposes fix
        |
        v
sandbox runs Vitest against the failing test
        |
        +--> pass: stop and return success
        |
        +--> fail: save attempt to Postgres and retry
```

## Current status

This project is an early-stage prototype and is still under active development. The repository includes the core harness structure, benchmark examples, and the intended feature design, but some parts still need final completion and validation in a fully configured environment.

## Repository structure

```text
.
├── benchmarks/
│   ├── 01-off-by-one/
│   ├── 02-null-check/
│   ├── ...
│   └── 08-loop-bug/
├── specs/
│   └── 001-autonomous-harness-bug-fix/
├── src/
│   ├── db.ts
│   ├── harness.ts
│   ├── llm.ts
│   ├── run-benchmarks.ts
│   ├── sandbox.ts
│   └── schemas.ts
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js
- pnpm
- PostgreSQL database
- Groq API key

## Setup

Install dependencies:

```bash
corepack enable
pnpm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Then add values such as:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_db
GROQ_API_KEY=your_api_key_here
```

## Run the project

Run the harness:

```bash
pnpm start
```

Run the benchmark suite:

```bash
pnpm bench
```

Run tests:

```bash
pnpm test
```

## Important note

This project focuses on using the provided failing Vitest test as the verification target during early development. It is primarily a research and prototype harness rather than a production-ready autonomous coding system.

## License

ISC
