<!-- Scoped policy for docs -->
<!-- Scope: docs/** -->
<!-- Audience: autonomous coding agents only -->

# docs/AGENTS.md

## 0. Scope

Applies to all files under `docs/**`.

## 1. Inheritance

Inherits root constraints from `AGENTS.md`.

## 2. Documentation Roles

- `docs/AGENT_MAP.md` is the canonical scoped policy index.
- `docs/DECISIONS.md` is the canonical governance decision log.
- `docs/WORKFLOW_REFERENCE.md` is a non-authoritative operational reference.
- Legacy snapshots remain archival and non-authoritative.

## 3. Documentation Rules

- Keep policy files machine-first and directive.
- Keep reference files informative but non-normative.
- Avoid duplicating hard constraints across multiple docs unless needed for scope.

## 4. Update Rules

- Policy topology changes must update `docs/AGENT_MAP.md`.
- Rule-level changes must append an entry to `docs/DECISIONS.md`.
