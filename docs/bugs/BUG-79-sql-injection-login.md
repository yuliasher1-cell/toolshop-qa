# BUG-79: SQL injection in the login e-mail signs the attacker in

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 79 of the official list) |
| Area | API, POST /users/login |
| Severity | Critical |
| Category | API8:2019 Injection |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-79` |

## Steps to reproduce

1. Send `POST /users/login` with the e-mail `customer@practicesoftwaretesting.com' -- ` (note the quote and the SQL comment at the end) and any password.
2. Read the response.

## Expected result

The request is rejected (4xx). The e-mail is treated as data, never as part of the SQL statement.

## Actual result

The comment sequence cuts the password check out of the query and the API returns a token for the targeted account.

## Impact

Anyone who knows a customer's or the admin's e-mail address can take over the account without the password.

## Evidence

The login handler of the buggy build contains a dedicated branch that detects the injection pattern (UserController::login, see the CTF comment in sprint5-with-bugs/API).
