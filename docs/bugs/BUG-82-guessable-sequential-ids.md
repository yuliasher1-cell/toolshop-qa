# BUG-82: Resource IDs are sequential integers

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 82 of the official list) |
| Area | API, all resources |
| Severity | Medium |
| Category | API1:2023 Broken Object Level Authorization |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-82` |

## Steps to reproduce

1. Register a user and look at the `id` in the response.

## Expected result

A non-guessable identifier (the normal build uses ULIDs).

## Actual result

A plain incrementing number. Other users' IDs are trivially guessed.

## Impact

Makes object-level attacks such as BUG-71 trivial to automate. Also the reason why the contract tests of the normal build (string IDs) cannot run against this build.

## Evidence

Normal build: `HasUlids` on the models and `ulid` primary keys in the migrations.
