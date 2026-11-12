# Known bugs of the buggy build

The Toolshop project ships a second build, `sprint5-with-bugs`, with 96 deliberately planted defects
(official list: `sprint5-with-bugs/testSessions/listOfBugs.md` in the
[Toolshop repository](https://github.com/testsmith-io/practice-software-testing)). It is meant for
exploratory-testing training, so most of the list is visual or browser-specific. This project
automates the part that suits automation best: API security and business-rule defects, plus two UI texts.

Each defect has an automated check in `tests/known-bugs/` that asserts the **correct** behaviour:

- on the normal build the check passes (it is a regression test);
- on the buggy build the CI job expects the check to fail. It passes only while the defect is reproducible, so a fixed bug
  or a test that stopped reaching the defect turns the job red.

| ID | Severity | Defect | Report |
|---:|---|---|---|
| 79 | Critical | SQL injection in the login e-mail signs the attacker in | [BUG-79-sql-injection-login.md](BUG-79-sql-injection-login.md) |
| 71 | High | The profile of another user can be read by its ID | [BUG-71-read-other-users-profile.md](BUG-71-read-other-users-profile.md) |
| 74 | High | A customer (non-admin) can delete a brand | [BUG-74-customer-can-delete-brand.md](BUG-74-customer-can-delete-brand.md) |
| 78 | High | Every user receives all invoices of all customers | [BUG-78-all-invoices-visible.md](BUG-78-all-invoices-visible.md) |
| 80 | High | The application log is served over HTTP | [BUG-80-application-log-exposed.md](BUG-80-application-log-exposed.md) |
| 2 | Medium | Sorting works the other way around | [BUG-02-sorting-reversed.md](BUG-02-sorting-reversed.md) |
| 21 | Medium | The account is locked after a single failed sign-in | [BUG-21-account-locked-after-one-failed-login.md](BUG-21-account-locked-after-one-failed-login.md) |
| 72 | Medium | Access tokens are valid for months | [BUG-72-long-lived-access-token.md](BUG-72-long-lived-access-token.md) |
| 73 | Medium | User responses expose internal fields (enabled, failed_login_attempts) | [BUG-73-internal-user-fields-exposed.md](BUG-73-internal-user-fields-exposed.md) |
| 82 | Medium | Resource IDs are sequential integers | [BUG-82-guessable-sequential-ids.md](BUG-82-guessable-sequential-ids.md) |
| 33 | Low | Typo: "Sorth" instead of "Sort" | [BUG-33-sort-label-typo.md](BUG-33-sort-label-typo.md) |
| 34 | Low | Typo: "Serch" instead of "Search" | [BUG-34-search-button-typo.md](BUG-34-search-button-typo.md) |

## Not automated, and why

Most of the remaining items need a human eye or a specific browser: layout and alignment in Firefox or Edge, tab order,
fonts, broken images, file upload rules on the contact page, e-mail templates. They are better found by exploratory
testing. Accessibility items (missing labels, low contrast) are partly covered by the axe checks in `tests/ui/a11y.spec.ts`.

## Limits of this approach

The check treats any failure of its assertion as "the defect reproduced". Set-up (users, data) runs before the check,
so a broken precondition still fails the test. The `observed` annotation in the HTML report shows what the assertion saw.
Severity ratings are my own judgement; the official list does not rank defects.
