<!-- Scoped policy index -->
<!-- Scope: repository policy topology -->
<!-- Audience: autonomous coding agents only -->

# AGENT_MAP

## 0. Purpose

Defines which scoped policy files apply to which paths.

## 1. Resolution Algorithm

1. Match changed file path against all `applyTo` patterns.
2. Apply root policy in `AGENTS.md` first.
3. Apply all matching scoped policy files in listed order.
4. If conflict exists, higher authority from root policy order wins.

## 2. Scoped Policies

### 2.1 Source Tree

- file: `src/AGENTS.md`
- applyTo: `src/**`
- purpose: source-tree implementation boundaries

### 2.2 Content Entries

- file: `src/content/AGENTS.md`
- applyTo: `src/content/**`
- purpose: content frontmatter and authoring enforcement

### 2.3 Routes

- file: `docs/policies/src-pages.AGENTS.md`
- applyTo: `src/pages/**`
- purpose: route behavior and detail/listing contracts

### 2.4 Components

- file: `src/components/AGENTS.md`
- applyTo: `src/components/**`
- purpose: UI component and island constraints

### 2.5 Documentation

- file: `docs/AGENTS.md`
- applyTo: `docs/**`
- purpose: governance/documentation maintenance rules

## 3. Change Rule

Any new scoped policy file must be added to this map in the same change.
