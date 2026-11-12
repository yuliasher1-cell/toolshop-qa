# BUG-74: A customer (non-admin) can delete a brand

| | |
|---|---|
| Build | `sprint5-with-bugs` (planted defect, item 74 of the official list) |
| Area | API, DELETE /brands/{id} |
| Severity | High |
| Category | API5:2023 Broken Function Level Authorization |
| Automated check | `tests/known-bugs/api-security.spec.ts, BUG-74` |

## Steps to reproduce

1. As admin create a brand (`POST /brands`).
2. Register an ordinary customer and log in.
3. Call `DELETE /brands/{id}` with the customer's token.
4. Call `GET /brands/{id}`.

## Expected result

403 Forbidden, and the brand still exists. The normal build protects the route with the `role:admin` middleware.

## Actual result

204 No Content and the brand is gone. The buggy build has no role check on this route.

## Impact

Any registered user can remove catalogue data.

## Evidence

BrandController::destroy in the buggy build deletes first and only afterwards inspects the role; the normal build registers `role:admin` for `destroy` in the controller constructor.
