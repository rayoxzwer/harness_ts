# Implementation Plan: Autonomous TypeScript Bug Fix Harness

**Branch**: `001-autonomous-harness-bug-fix` | **Date**: 2026-08-01 | **Spec**: spec.md

**Input**: Feature specification from `/specs/001-autonomous-harness-bug-fix/spec.md`

## Summary

Build a TypeScript Node.js harness that accepts a buggy TypeScript file and a failing Vitest test, uses Groq API (llama-3.3-70b-versatile) to generate candidate fixes, validates LLM responses with Zod, runs each patch in an isolated temp-directory sandbox through Vitest, and records every attempt in Postgres via `pg`. The harness loop retries failed fixes up to 3 times and feeds failure output back to the LLM on each retry.

## Technical Context

**Language/Version**: TypeScript on Node.js 20+.

**Primary Dependencies**: `zod`, `execa`, `pg`, `vitest`, `dotenv`, `node-fetch` or native fetch for Groq API calls.

**Storage**: PostgreSQL via the `pg` package, targeting Supabase free tier as the persistence backend.

**Testing**: `vitest` for harness unit tests and sandbox behavior; feature benchmark tests under `benchmarks/<task-name>/`.

**Target Platform**: Server-side Node.js process, local developer machine, or container runtime.

**Project Type**: CLI-oriented service/harness library.

**Performance Goals**: keep individual sandbox runs within 15 seconds; avoid more than 3 LLM-fix retries per task.

**Constraints**: generated code must execute only inside a temporary sandbox directory; no network access from within the sandbox; sandbox subprocesses are limited to a 15s timeout; retry count capped at 3.

**Scale/Scope**: single-task repair loop for one task at a time; out of scope: deployment, auth, multi-user support, parallel execution.

## Constitution Check

- The harness is built around the existing `.specify` workflow and traceable tasks.
- The plan keeps scope narrow by validating only the provided failing test inside the sandbox.
- Persistence and auditability are required by the spec.

## Project Structure

### Documentation (this feature)

```text
specs/001-autonomous-harness-bug-fix/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── db.ts
├── harness.ts
├── llm.ts
├── sandbox.ts
├── schemas.ts
└── run-benchmarks.ts

benchmarks/
├── <task-name>/
│   ├── buggy.ts
│   └── buggy.test.ts
```

**Structure Decision**: Single project codebase with a focused `src/` implementation and feature benchmarks under `benchmarks/`.

## Phase 0: Research

### Research Goals

- Confirm the Groq API request and response shape for `llama-3.3-70b-versatile`.
- Define a Zod schema that captures patch metadata, modified file contents, and any diagnostic hints.
- Determine how to securely create an isolated temp directory with no network access and a 15s limit using `execa`.
- Identify the minimal `pg` schema for attempt persistence and how to run migration or initialization locally.

### Research Deliverables

- `research.md` with Groq request structure, API auth handling, and sandbox strategy.
- `data-model.md` with Postgres schema and attempt record definition.
- `quickstart.md` describing local environment setup for Node.js, Postgres, and Vitest.
- `contracts/` containing the `Zod` output contract for the LLM patch response.

## Phase 1: Design

### Core Components

- `src/schemas.ts`
  - Zod schema for LLM patch responses.
  - Type definitions for `FixRequest`, `FixAttempt`, and `PatchResult`.

- `src/llm.ts`
  - Function to call the Groq API and return parsed/validated patch output.
  - Retry on schema validation failures.
  - Inject failure diagnostics from previous sandbox runs into prompts.

- `src/sandbox.ts`
  - Create and manage a temporary isolated directory.
  - Write buggy source and test files into sandbox.
  - Run `vitest` using `execa` with working-directory jail and `timeout: 15000`.
  - Prevent network access by defaulting to environment restrictions and using a fresh temp directory.

- `src/db.ts`
  - Connect to Postgres using `pg` and persist attempts.
  - Define `saveAttempt(attempt: FixAttempt)` and `getAttempts(taskId: string)`.
  - Provide migration initialization (simple table if not exists).

- `src/harness.ts`
  - Single loop: receive `task_id`, buggy TS source, failing test content.
  - Call `llm.ts` to generate a patch.
  - Execute patch in `sandbox.ts` against the failing test.
  - Persist attempt data to Postgres before continuing.
  - If failure and retries remain, feedback failure output into the next LLM prompt.
  - End on pass or after 3 retries.

- `src/run-benchmarks.ts`
  - Load benchmark task files and run the harness against sample buggy cases.
  - Measure end-to-end success and retry counts.

### Data Model

- `attempts` table:
  - `id` UUID primary key
  - `task_id` text
  - `attempt_number` integer
  - `code_version` text
  - `test_result` text
  - `diagnosis` text
  - `succeeded` boolean
  - `created_at` timestamp with time zone default now()

- `tasks` table (optional later): record `task_id`, `status`, `created_at`, `updated_at`.

### Security and Constraints

- Ensure sandbox subprocess uses `cwd` inside the temp directory and does not inherit host working directory.
- Do not allow network access from within the sandbox; if Node options are required, pass `--no-warnings` and restrict environment variables.
- Validate every LLM response via Zod; discard and retry on invalid schema.
- Store only patch attempt metadata and code versions; do not persist LLM auth keys or secrets.

## Tasks

The next phase will generate `tasks.md`, but the plan outlines the expected task breakdown:

1. Research Groq API and Zod schema.
2. Define database schema and persistence helper.
3. Implement sandbox environment and test execution helper.
4. Implement LLM integration with Zod validation.
5. Implement harness loop and retry logic.
6. Add benchmark sample task files and run end-to-end harness flow.
7. Validate everything with `vitest` and local Postgres.

## Quickstart Notes

- Use Node.js 20+.
- Configure `DATABASE_URL` for Supabase Postgres.
- Configure Groq API credentials via environment variables.
- Run the harness locally with sample benchmark task files.
