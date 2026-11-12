# BUG-21: The account is locked after a single failed sign-in

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 21 of the official list) |
| Area | API and login page |
| Severity | Medium |
| Category | Functional (account lockout policy) |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-21` |

## Steps to reproduce

1. Register a user.
2. Try to sign in twice with a wrong password.
3. Sign in with the correct password.

## Expected result

Sign-in succeeds; the lock applies after three consecutive failures (MAX_LOGIN_ATTEMPTS = 3 in the normal build).

## Actual result

The correct password is refused because the account is already locked after the first failure.

## Impact

One typo locks a real user out; also an easy denial-of-service against any known e-mail address.

## Evidence

The buggy build's login handler checks `failed_login_attempts >= 1`.
