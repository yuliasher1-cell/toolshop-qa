// Prints a short Markdown summary of a Playwright JSON report.
// In GitHub Actions it is appended to the job summary, otherwise it goes to the console.
//
// Usage: node scripts/summarize-results.mjs <report.json> ["Title"]
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const [file, title = 'Playwright results'] = process.argv.slice(2);

function emit(markdown) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
  } else {
    console.log(markdown);
  }
}

if (!file || !existsSync(file)) {
  emit(
    `### ${title}\n\nNo report found at \`${file}\`. The run did not get as far as executing tests ` +
      '(for example the target app was unavailable).',
  );
  process.exit(0);
}

const report = JSON.parse(readFileSync(file, 'utf8'));
const counts = { expected: 0, unexpected: 0, flaky: 0, skipped: 0 };
const failed = [];

function walk(suite, trail) {
  const names = suite.title ? [...trail, suite.title] : trail;
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      counts[test.status] = (counts[test.status] ?? 0) + 1;
      if (test.status === 'unexpected') {
        failed.push(`${[...names, spec.title].join(' › ')} [${test.projectName}]`);
      }
    }
  }
  for (const child of suite.suites ?? []) walk(child, names);
}
for (const suite of report.suites ?? []) walk(suite, []);

const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
const lines = [
  `### ${title}`,
  '',
  '| Total | Passed | Failed | Flaky | Skipped |',
  '| ---: | ---: | ---: | ---: | ---: |',
  `| ${total} | ${counts.expected} | ${counts.unexpected} | ${counts.flaky} | ${counts.skipped} |`,
];
if (failed.length > 0) {
  lines.push('', '**Failed tests**', '', ...failed.map((name) => `- ${name}`));
}

// Errors outside of any test, e.g. the global setup reporting that the target app is down.
// Without this a run that never started would look like "0 tests, nothing wrong".
const ansi = /\u001b\[[0-9;]*m/g;
const runErrors = (report.errors ?? []).map((error) =>
  String(error.message ?? error).replace(ansi, '').split('\n')[0],
);
if (runErrors.length > 0) {
  lines.push('', '**Errors outside of tests**', '', ...runErrors.map((message) => `- ${message}`));
}
emit(lines.join('\n'));
