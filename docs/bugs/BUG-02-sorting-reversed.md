# BUG-2: Sorting works the other way around

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 2 of the official list) |
| Area | Product list / category page |
| Severity | Medium |
| Category | Functional |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-2` |

## Steps to reproduce

1. Call `GET /products?sort=price,asc` (or choose price ascending in the UI).

## Expected result

Prices in ascending order.

## Actual result

The order is reversed, according to the official bug list.

## Impact

Users get the opposite of what they selected.

## Evidence

Official list, item 2 (found with the Supporting Actor Tour).
