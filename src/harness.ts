import { requestPatch } from './llm.js';
import { runSandbox } from './sandbox.js';
import { saveAttempt, connectDb, ensureSchema, closeDb } from './db.js';
import { FixRequestSchema, FixAttemptSchema } from './schemas.js';

export async function runHarness(raw: unknown) {
  const request = FixRequestSchema.parse(raw);
  await connectDb();
  await ensureSchema();

  let attemptNumber = 0;
  let lastDiagnosis = '';
  let codeVersion = request.buggyCode;

  while (attemptNumber < Math.min(request.retryCount, 3)) {
    attemptNumber += 1;

    const prompt = `Fix the following TypeScript file and make the provided Vitest test pass.\n\nBuggy file:\n${codeVersion}\n\nTest file:\n${request.failingTest}\n\nPrevious failure:\n${lastDiagnosis}`;
    const patchResponse = await requestPatch(prompt);
    codeVersion = patchResponse.patchedCode;

    const sandboxResult = await runSandbox(codeVersion, request.failingTest);
    const attempt = FixAttemptSchema.parse({
      taskId: request.taskId,
      attemptNumber,
      codeVersion,
      testResult: sandboxResult.output,
      diagnosis: sandboxResult.diagnostics,
      succeeded: sandboxResult.succeeded,
      createdAt: new Date().toISOString(),
    });

    await saveAttempt(attempt);

    if (sandboxResult.succeeded) {
      await closeDb();
      return { success: true, attempt, output: sandboxResult.output };
    }

    lastDiagnosis = sandboxResult.diagnostics;
  }

  await closeDb();
  return { success: false, attempts: attemptNumber };
}
