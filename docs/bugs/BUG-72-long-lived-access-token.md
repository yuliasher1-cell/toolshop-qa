# BUG-72: Access tokens are valid for months

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 72 of the official list) |
| Area | API, POST /users/login |
| Severity | Medium |
| Category | API2:2023 Broken Authentication |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-72` |

## Steps to reproduce

1. Log in with a valid user.
2. Read `expires_in` (seconds) from the response.

## Expected result

A short lifetime (the normal build uses 5 minutes, so about 300 seconds).

## Actual result

`expires_in` corresponds to 260000 minutes (about 180 days); the refresh token to 520000 minutes.

## Impact

A leaked token stays usable for half a year and cannot be limited in time.

## Evidence

`JWT_TTL` defaults to 260000 and `JWT_REFRESH_TTL` to 520000 in the buggy build's config/jwt.php.
