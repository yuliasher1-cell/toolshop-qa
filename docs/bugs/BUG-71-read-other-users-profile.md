# BUG-71: The profile of another user can be read by its ID

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 71 of the official list) |
| Area | API, GET /users/{id} |
| Severity | High |
| Category | API1:2023 Broken Object Level Authorization |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-71` |

## Steps to reproduce

1. Register users A and B and log in as B.
2. Call `GET /users/{id of A}` with B's token.

## Expected result

A refusal (the normal build answers 404 for a user who is neither the owner nor an admin) and A's data is not in the body.

## Actual result

200 with the full profile of A.

## Impact

Personal data of every user is readable by any signed-in user. Combined with BUG-82 (sequential IDs) all users can be enumerated.

## Evidence

Normal build: UserService::getUserById allows only admins or the owner.
