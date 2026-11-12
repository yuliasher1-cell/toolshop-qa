# BUG-80: The application log is served over HTTP

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 80 of the official list) |
| Area | API, GET /logs/laravel.log |
| Severity | High |
| Category | API8:2023 Security Misconfiguration |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-80` |

## Steps to reproduce

1. Call `GET /logs/laravel.log` without any authentication.

## Expected result

404 (the route does not exist) or at least 401/403.

## Actual result

200 and the content of the Laravel log, which can contain user data and internal details.

## Impact

Information disclosure that helps further attacks.

## Evidence

routes/api.php of the buggy build declares a public route that returns the log file.
