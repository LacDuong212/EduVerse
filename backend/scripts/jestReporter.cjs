/**
 * Custom Jest reporter – generates Markdown test report in test-reports/
 * Format: test-reports/<suiteName>-<YYYY-MM-DD_HH-mm-ss>.md
 *         test-reports/latest.md  (always overwritten with the last run)
 */

const fs = require("fs");
const path = require("path");

const REPORTS_DIR = path.resolve(__dirname, "../test-reports");

function statusIcon(passed) {
  return passed ? "✅" : "❌";
}

function formatDuration(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

function pad(n, width) {
  return String(n).padStart(width, " ");
}

class MarkdownReporter {
  onRunComplete(_contexts, results) {
    if (!fs.existsSync(REPORTS_DIR)) fs.mkdirSync(REPORTS_DIR, { recursive: true });

    const now = new Date();
    const timestamp = now
      .toISOString()
      .replace("T", " ")
      .replace(/\.\d+Z$/, " UTC");
    const fileStamp = now
      .toISOString()
      .replace("T", "_")
      .replace(/:\d+\.\d+Z$/, "")
      .replace(/:/g, "-");

    const totalPassed = results.numPassedTests;
    const totalFailed = results.numFailedTests;
    const totalSkipped = results.numPendingTests;
    const totalTests = results.numTotalTests;
    const totalSuites = results.numTotalTestSuites;
    const totalTime = formatDuration(
      results.testResults.reduce((s, r) => s + (r.perfStats?.end - r.perfStats?.start || 0), 0)
    );

    const overallPassed = totalFailed === 0;
    const overallBadge = overallPassed
      ? "![PASS](https://img.shields.io/badge/Tests-PASS-brightgreen)"
      : `![FAIL](https://img.shields.io/badge/Tests-${totalFailed}%20FAILED-red)`;

    let lines = [];

    lines.push(`# EduVerse API — Test Report`);
    lines.push(``);
    lines.push(`${overallBadge}`);
    lines.push(``);
    lines.push(`| Field | Value |`);
    lines.push(`|---|---|`);
    lines.push(`| Run date | ${timestamp} |`);
    lines.push(`| Total suites | ${totalSuites} |`);
    lines.push(`| Total tests | ${totalTests} |`);
    lines.push(`| ✅ Passed | ${totalPassed} |`);
    lines.push(`| ❌ Failed | ${totalFailed} |`);
    lines.push(`| ⏭ Skipped | ${totalSkipped} |`);
    lines.push(`| Duration | ${totalTime} |`);
    lines.push(``);

    // Per-suite sections
    for (const suite of results.testResults) {
      const suiteName = path.relative(process.cwd(), suite.testFilePath).replace(/\\/g, "/");
      const suitePassed = suite.numFailingTests === 0;
      const suiteIcon = statusIcon(suitePassed);
      const suiteTime = formatDuration(suite.perfStats?.end - suite.perfStats?.start || 0);

      lines.push(`---`);
      lines.push(``);
      lines.push(`## ${suiteIcon} ${suiteName}`);
      lines.push(``);
      lines.push(
        `**${suite.numPassingTests} passed** | **${suite.numFailingTests} failed** | ${suiteTime}`
      );
      lines.push(``);
      lines.push(`| # | Status | Test name | Duration |`);
      lines.push(`|---|---|---|---|`);

      let counter = 1;
      for (const test of suite.testResults) {
        const icon = test.status === "passed" ? "✅" : test.status === "pending" ? "⏭" : "❌";
        const duration = test.duration != null ? formatDuration(test.duration) : "—";
        // Escape pipe characters in test names
        const name = test.fullName.replace(/\|/g, "\\|");
        lines.push(`| ${pad(counter++, 2)} | ${icon} | ${name} | ${duration} |`);
      }

      // Failure details
      const failures = suite.testResults.filter((t) => t.status === "failed");
      if (failures.length > 0) {
        lines.push(``);
        lines.push(`### ❌ Failure Details`);
        lines.push(``);
        for (const f of failures) {
          lines.push(`#### \`${f.fullName}\``);
          lines.push(``);
          for (const msg of f.failureMessages) {
            // Trim ANSI escape codes
            const clean = msg.replace(/\x1b\[[0-9;]*m/g, "");
            lines.push("```");
            lines.push(clean.trim());
            lines.push("```");
            lines.push(``);
          }
        }
      }

      lines.push(``);
    }

    const content = lines.join("\n");

    // Timestamped file
    const suiteBasenames = results.testResults
      .map((r) => path.basename(r.testFilePath, ".test.js"))
      .join("_");
    const timedFile = path.join(REPORTS_DIR, `${suiteBasenames}_${fileStamp}.md`);
    fs.writeFileSync(timedFile, content, "utf8");

    // Always-overwrite latest.md
    const latestFile = path.join(REPORTS_DIR, "latest.md");
    fs.writeFileSync(latestFile, content, "utf8");

    console.log(`\n📄 Test report saved:\n   ${timedFile}\n   ${latestFile}\n`);
  }
}

module.exports = MarkdownReporter;
