# Contributing to Study Buddy

Thank you for your interest in contributing! This guide explains how to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/<your-username>/study-buddy.git`
3. Set up the project following the [Backend](backend/README.md) and [Frontend](frontend/README.md) guides
4. Create a new branch for your change (see Branch Naming below)

## Branch Naming

Branches must follow this pattern:

```
<type>/<short-description>
```

| Type | When to use |
|---|---|
| `feat/` | New feature |
| `fix/` | Bug fix |
| `refactor/` | Code change that neither fixes a bug nor adds a feature |
| `chore/` | Tooling, dependencies, config |
| `ci/` | CI/CD changes |
| `docs/` | Documentation only |

Examples: `feat/document-preview`, `fix/search-empty-results`, `chore/update-dependencies`

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>
```

Examples:
```
feat(auth): add email verification endpoint
fix(search): handle empty query string
chore: upgrade FastAPI to 0.120
```

## Branching & Releases

We follow [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow):

- `main` is always deployable — every merge deploys to Staging automatically
- Create feature branches from `main`, open a PR back into `main`
- Production releases are created by maintainers as a GitHub Release from a tag on `main` — publishing the release triggers the Production deployment

## Pull Requests

- Keep PRs focused — one feature or fix per PR
- Fill out the PR description with what changed and why
- At least one review is required before merging
- Make sure the app runs locally before submitting

## Code Style

- **Backend:** Follow PEP 8, use `uv` for dependencies, async/await throughout
- **Frontend:** TypeScript strict mode, Tailwind for styling, shadcn/ui for components, no inline styles
- No commented-out code, no debug prints/console.logs in PRs

## Reporting Issues

Open a [GitHub Issue](../../issues) with a clear title, steps to reproduce, and expected vs. actual behavior.
