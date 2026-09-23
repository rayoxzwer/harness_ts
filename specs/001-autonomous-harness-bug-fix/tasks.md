# Tasks: Autonomous TypeScript Bug Fix Harness

**Input**: Design documents from `/specs/001-autonomous-harness-bug-fix`

**Prerequisites**: plan.md, spec.md

**Tests**: Each phase includes a dedicated smoke-test task so the next phase can begin only after validation.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize code layout, dependencies, and environment scripts.

- [ ] T001 Create project structure with `src/`, `benchmarks/`, and `specs/001-autonomous-harness-bug-fix/`.
- [ ] T002 Initialize Node.js/TypeScript project and install core dependencies: `zod`, `execa`, `pg`, `vitest`, and any fetch library for Groq.
- [ ] T003 Add `package.json` scripts for `test`, `sandbox-smoke`, `llm-smoke`, and `benchmark`.
- [ ] T004 Add TypeScript configuration and a minimal `.env.example` with placeholders for `DATABASE_URL` and Groq API credentials.

---

## Phase 2: Foundational (Schema + Types)

**Purpose**: Define type contracts and validation before implementing behavior.

- [ ] T005 Implement `src/schemas.ts` with Zod schemas for:
  - LLM patch response structure
  - `FixRequest`
  - `FixAttempt`
  - `PatchResult`
- [ ] T006 Add a unit test for `src/schemas.ts` that verifies valid sample LLM payloads pass and invalid payloads fail.
- [ ] T007 Document the Zod contract in `specs/001-autonomous-harness-bug-fix/contracts/llm-patch-schema.md`.

**Independent Test**: Run schema validation smoke tests to confirm the type contract is stable before building sandbox or LLM logic.

---

## Phase 3: Sandbox Runner in Isolation

**Purpose**: Build and verify sandboxed Vitest execution separately.

- [ ] T008 Implement `src/sandbox.ts` to:
  - create a temporary isolated directory
  - write provided source and test files into the sandbox
  - run `vitest` via `execa` with `cwd` set to the temp directory
  - enforce a 15s timeout
  - prevent network access from within the sandbox to the extent possible via env and working directory restrictions
  - return structured success/failure output and diagnostics
- [ ] T009 Add a manual sandbox smoke test script or vitest case that uses `benchmarks/sandbox-smoke/buggy.ts` and `benchmarks/sandbox-smoke/buggy.test.ts` to verify the runner completes and returns a failure or pass result.
- [ ] T010 Ensure the sandbox runner cleans up temp directories after execution unless debugging mode is enabled.

**Independent Test**: Validate the sandbox runner works end-to-end with the sample benchmark files before proceeding to LLM integration.

---

## Phase 4: LLM Call + Parsing in Isolation

**Purpose**: Implement Groq API integration and ensure response validation works independently.

- [ ] T011 Implement `src/llm.ts` to call the Groq API (`llama-3.3-70b-versatile`) and return a parsed patch candidate.
- [ ] T012 Use `src/schemas.ts` in `src/llm.ts` to validate every response with Zod.
- [ ] T013 Add retry logic inside `src/llm.ts` for invalid schema responses so invalid output is discarded and the request is retried.
- [ ] T014 Add a manual LLM smoke test script or vitest case that sends a simple prompt and verifies the returned patch parses cleanly through the Zod schema.

**Independent Test**: Verify the LLM integration and schema parsing work without wiring into sandbox execution.

---

## Phase 5: Postgres Snapshot Writer in Isolation

**Purpose**: Persist attempt records before wiring the harness loop.

- [ ] T015 Implement `src/db.ts` to connect to Postgres using `pg`.
- [ ] T016 Add `saveAttempt(attempt: FixAttempt)` and a simple initialization function that creates the `attempts` table if needed.
- [ ] T017 Add a manual Postgres smoke test that writes and reads back a sample `FixAttempt` record.
- [ ] T018 Document the Postgres schema in `specs/001-autonomous-harness-bug-fix/data-model.md`.

**Independent Test**: Validate persistence works before composition with sandbox and LLM logic.

---

## Phase 6: Core Harness Loop Wiring

**Purpose**: Integrate schema, sandbox, LLM, and DB into the retry loop.

- [ ] T019 Implement `src/harness.ts` with the core loop that:
  - accepts `task_id`, buggy code, and a failing test
  - calls `src/llm.ts` for a patch
  - executes the patch in `src/sandbox.ts`
  - persists each attempt to Postgres via `src/db.ts`
  - repeats failures up to 3 retries
  - stops on pass or retry exhaustion
- [ ] T020 Add a smoke test that runs `src/harness.ts` with a stubbed or local LLM response and verifies:
  - the harness attempts the patch
  - the loop retries after failure
  - the database records each attempt
- [ ] T021 Add a `package.json` script to invoke `src/harness.ts` for manual local verification.

**Independent Test**: Confirm the loop is wired correctly with one isolated harness execution before adding the full benchmark suite.

---

## Phase 7: Benchmark Suite of 8 Buggy TS Snippets

**Purpose**: Provide reproducible sample failures for validation.

- [ ] T022 Create `benchmarks/repair-loop/buggy-1/buggy.ts` and `buggy.test.ts`.
- [ ] T023 Create `benchmarks/repair-loop/buggy-2/buggy.ts` and `buggy.test.ts`.
- [ ] T024 Create `benchmarks/repair-loop/buggy-3/buggy.ts` and `buggy.test.ts`.
- [ ] T025 Create `benchmarks/repair-loop/buggy-4/buggy.ts` and `buggy.test.ts`.
- [ ] T026 Create `benchmarks/repair-loop/buggy-5/buggy.ts` and `buggy.test.ts`.
- [ ] T027 Create `benchmarks/repair-loop/buggy-6/buggy.ts` and `buggy.test.ts`.
- [ ] T028 Create `benchmarks/repair-loop/buggy-7/buggy.ts` and `buggy.test.ts`.
- [ ] T029 Create `benchmarks/repair-loop/buggy-8/buggy.ts` and `buggy.test.ts`.
- [ ] T030 Add a README or comment in `benchmarks/repair-loop/` describing the intended bug for each sample.

**Independent Test**: Confirm each benchmark case fails locally with Vitest before using them in the harness.

---

## Phase 8: Benchmark Runner Script

**Purpose**: Execute benchmarks and report a success rate.

- [ ] T031 Implement `src/run-benchmarks.ts` to:
  - discover benchmark directories under `benchmarks/repair-loop/`
  - run the harness or sandbox+LLM flow for each case
  - calculate and report pass/fail results and a success percentage
- [ ] T032 Add a smoke test or script to validate the benchmark runner output and formatting.
- [ ] T033 Add `package.json` script `benchmark` that runs `src/run-benchmarks.ts`.

**Independent Test**: Verify the benchmark runner reports a success rate before any final polish.

---

## Phase 9: Final Review and Cleanup

**Purpose**: Polish the implementation and ensure deliverables are complete.

- [ ] T034 Review the feature end-to-end and ensure each phase was independently verified.
- [ ] T035 Add documentation to `specs/001-autonomous-harness-bug-fix/quickstart.md` explaining how to run the harness and benchmarks.
- [ ] T036 Confirm `benchmarks/repair-loop/` sample files and `src/` scripts are consistent with the spec.
- [ ] T037 Remove any debug-only temp files or experimental scripts from the final deliverable.

---

## Dependencies & Execution Order

1. Phase 1: Setup
2. Phase 2: Foundational (schemas/types)
3. Phase 3: Sandbox runner isolation
4. Phase 4: LLM call + parsing isolation
5. Phase 5: Postgres snapshot writer isolation
6. Phase 6: Core harness loop wiring
7. Phase 7: Benchmark suite
8. Phase 8: Benchmark runner script
9. Phase 9: Final review

Each phase is designed so its smoke test verifies readiness for the next phase.
