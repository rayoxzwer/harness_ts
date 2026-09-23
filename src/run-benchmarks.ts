import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runHarness } from './harness.js';

async function runBenchmark(taskDir: string) {
  const buggyPath = join(taskDir, 'buggy.ts');
  const testPath = join(taskDir, 'buggy.test.ts');

  const buggyCode = readFileSync(buggyPath, 'utf8');
  const failingTest = readFileSync(testPath, 'utf8');

  const result = await runHarness({
    taskId: taskDir,
    buggyCode,
    failingTest,
    retryCount: 3,
  });

  return result.success;
}

async function main() {
  const benchmarksDir = join(process.cwd(), 'benchmarks');
  const tasks = readdirSync(benchmarksDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(benchmarksDir, entry.name));

  let passed = 0;
  let total = tasks.length;

  for (const taskDir of tasks) {
    const success = await runBenchmark(taskDir);
    console.log(`${taskDir}: ${success ? 'PASS' : 'FAIL'}`);
    if (success) passed += 1;
  }

  const rate = total === 0 ? 0 : (passed / total) * 100;
  console.log(`\nBenchmark success rate: ${passed}/${total} (${rate.toFixed(1)}%)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
