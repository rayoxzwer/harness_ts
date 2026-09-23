<!--
Sync Impact Report
Version change: none -> 1.0.0
Modified principles: created five project principles
Added sections: Technical Constraints, Development Workflow
Removed sections: none
Deferred items: none
-->

# harness_codeEval Constitution

## Core Principles

### I. Spec-Driven Development
All feature work begins with an explicit spec and a shared understanding of requirements. The `.specify` artifacts are the source of truth for planning, tasking, and implementation.

### II. Traceable, Actionable Tasks
Every feature is broken into dependency-ordered, testable tasks in `tasks.md`. Tasks must be specific enough to complete without guessing and must map directly to the feature spec.

### III. Minimal, Maintainable Implementation
Implementations must favor simplicity, clarity, and maintainability. Avoid unnecessary complexity and ensure every change is supported by tests, validation, or documented review rationale.

### IV. Review Gates and Consistency Checks
Use Speckit workflow gates and repository checks before advancing phases. Validate plan, tasks, and implementation artifacts against the constitution and the feature spec.

### V. Collaboration and Transparent Documentation
Document design decisions, test expectations, and implementation status clearly. Pull requests must include context and references to `.specify` artifacts so reviewers can verify compliance.

## Technical Constraints
This project is governed by the Speckit `.specify` workflow and the configured Copilot integration in `.specify/integration.json`. Feature definitions, plans, and tasks must remain within the repository and follow the `speckit.*` command conventions. Use the provided PowerShell helper scripts for prerequisite checking and feature scaffolding.

## Development Workflow
Feature work follows a gated flow: `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`. Every feature branch should preserve traceability between spec, plan, tasks, and implementation. Run `.specify/scripts/powershell/check-prerequisites.ps1` when applicable to validate required artifacts before implementation.

## Governance
This constitution governs the project’s feature delivery workflow and supersedes informal process habits. Amendments require a documented pull request and review by maintainers responsible for workflow and quality.

- Every PR must cite relevant constitution principles when introducing new process or implementation patterns.
- Non-compliant feature work must be remediated before merge by updating `.specify` artifacts or revising the implementation.
- Constitution updates are versioned using semantic versioning and are reviewed independently from implementation changes.

**Version**: 1.0.0 | **Ratified**: 2026-08-01 | **Last Amended**: 2026-08-01
