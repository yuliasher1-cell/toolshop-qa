# BUG-73: User responses expose internal fields (enabled, failed_login_attempts)

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 73 of the official list) |
| Area | API, GET /users/{id} |
| Severity | Medium |
| Category | API3:2023 Broken Object Property Level Authorization |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-73` |

## Steps to reproduce

1. Register a customer and log in.
2. Call `GET /users/{own id}`.

## Expected result

Internal account fields are not part of the response (the normal build lists them in the model's `$hidden`).

## Actual result

`enabled` and `failed_login_attempts` are returned.

## Impact

Reveals account state and brute-force progress; helps an attacker time password guessing.

## Evidence

In the buggy build the User model hides only `created_at` and `updated_at`.
