# BUG-78: Every user receives all invoices of all customers

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 78 of the official list) |
| Area | API, GET /invoices |
| Severity | High |
| Category | API5:2023 Broken Function Level Authorization |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-78` |

## Steps to reproduce

1. Register a new customer (no orders) and log in.
2. Call `GET /invoices` with that token.

## Expected result

Only the user's own invoices; for a new user an empty list. The normal build filters by the authenticated user unless the role is admin.

## Actual result

The paginated list contains the invoices of other customers.

## Impact

Leak of personal and order data of other customers (names, addresses, purchases).

## Evidence

InvoiceController::index in the buggy build queries all invoices without a user filter.
