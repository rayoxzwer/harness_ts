# Autonomous TypeScript Bug Fix Harness

**Feature Branch**: `001-autonomous-harness-bug-fix`

**Created**: 2026-08-01

**Status**: Draft

**Input**: User description: "An autonomous harness that takes a buggy TypeScript file + its failing test, asks an LLM to produce a fix, runs the fix in an isolated sandbox against vitest, and if it fails, feeds the failure back to the LLM for another attempt, up to N retries. Every attempt (code version, test result, timestamp) is persisted to Postgres."

## Clarifications

### Session 2026-08-01
- Q: For this harness, should the sandbox run only the generated fix against the existing failing test, or should it also re-run any surrounding project tests to catch regressions? → A: Run only the provided failing Vitest test for this feature's initial iterations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automated Repair Loop (Priority: P1)

A developer submits a buggy TypeScript source file and its failing Vitest test. The harness uses an LLM to propose a fix, executes the fix in an isolated sandbox, and returns the result.

**Why this priority**: This is the core value proposition: safely iterating on bug fixes until tests pass or retry budget is exhausted.

**Independent Test**: Provide a known buggy TypeScript file and failing Vitest test, run the harness, and verify that the harness either returns a passing result or a final failure after N retries.

**Acceptance Scenarios**:

1. **Given** a buggy TypeScript file and a failing Vitest test, **when** the harness runs, **then** it executes the fix in an isolated sandbox against only the provided failing test and reports whether the test passed.
2. **Given** an initial fix attempt fails, **when** the harness retries, **then** it sends the failure information back to the LLM and attempts another fix, up to the configured retry count.
3. **Given** the harness exhausts N retries without passing tests, **then** it returns a final failed outcome with the last failure details.

---

### User Story 2 - Persistent Audit Trail (Priority: P2)

Every attempted code revision is stored in Postgres along with the timestamp and the test results.

**Why this priority**: Auditability and repeatability are essential for understanding what the LLM changed and why a fix succeeded or failed.

**Independent Test**: Execute the harness with multiple attempts and inspect the Postgres records to confirm each attempt, result, and timestamp were recorded.

**Acceptance Scenarios**:

1. **Given** a sequence of fix attempts, **when** the harness completes, **then** Postgres contains a row for each attempt with code version, test result, and timestamp.
2. **Given** a passing fix on attempt 2, **when** the harness completes, **then** the database reflects attempt 1 as failed and attempt 2 as passed.

---

### User Story 3 - Isolated Sandbox Execution (Priority: P3)

The harness runs each candidate fix in an isolated sandbox so that failing code does not impact the host environment.

**Why this priority**: Isolation avoids side effects and ensures the harness can safely execute untrusted generated code.

**Independent Test**: Verify the harness executes fixes in a sandboxed environment and that host-local files or processes remain unchanged after a failed attempt.

**Acceptance Scenarios**:

1. **Given** a generated fix, **when** it is executed, **then** it runs in an isolated sandbox separate from the main repository workspace.
2. **Given** a sandbox run fails, **when** the harness retries, **then** it cleans or replaces the sandbox before the next attempt.

---

### Edge Cases

- What happens if the failing test is malformed or not compatible with Vitest?
- How does the harness handle LLM output that includes unrelated text or multiple file changes?
- How are transient sandbox execution errors distinguished from actual test failures?
- What if Postgres is unavailable during persistence?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The harness MUST accept a buggy TypeScript file and its corresponding failing Vitest test input.
- **FR-002**: The harness MUST send the buggy file and failure context to an LLM and receive a proposed code fix.
- **FR-003**: The harness MUST execute each proposed fix in an isolated sandbox environment using Vitest, running only the provided failing test for the initial feature scope.
- **FR-004**: The harness MUST persist every attempt to Postgres with the code version, test result, and timestamp.
- **FR-005**: The harness MUST retry failed fix attempts up to N configured retries.
- **FR-006**: The harness MUST provide a final status indicating pass or fail after retry exhaustion.
- **FR-007**: The harness MUST sanitize and validate LLM output before executing it, rejecting clearly invalid or malicious content.

### Key Entities *(include if feature involves data)*

- **Attempt**: A single LLM-generated fix attempt with attributes: code version, attempt number, test result, timestamp, and optional failure details.
- **Sandbox**: The isolated execution environment used to run candidate fixes safely.
- **FixRequest**: The combination of the buggy TypeScript file, failing test, failure diagnostics, and retry configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The harness successfully completes a repair attempt and returns a passing test result, or reports final failure after N retries.
- **SC-002**: Every fix attempt is recorded in Postgres with code version, timestamp, and test result.
- **SC-003**: The sandbox environment isolates execution and does not modify the host repository when attempts fail.
- **SC-004**: Retry behavior is observable and bounded by the configured maximum retries.

## Assumptions

- The harness can use an LLM with sufficient TypeScript and Vitest knowledge.
- The execution environment supports Node.js, Vitest, and sandboxing utilities.
- Postgres is available and reachable from the harness for persistence.
- The initial buggy code and test case are self-contained or provide sufficient dependency context for sandbox execution.
