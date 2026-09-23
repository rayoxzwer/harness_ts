import { execa } from 'execa';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

export interface SandboxResult {
  succeeded: boolean;
  output: string;
  diagnostics: string;
}

export async function runSandbox(buggyCode: string, failingTest: string): Promise<SandboxResult> {
  const sandboxDir = mkdtempSync(join(tmpdir(), 'harness-'));
  try {
    writeFileSync(join(sandboxDir, 'buggy.ts'), buggyCode, 'utf8');
    writeFileSync(join(sandboxDir, 'buggy.test.ts'), failingTest, 'utf8');

    const result = await execa('npx', ['vitest', 'run', 'buggy.test.ts'], {
      cwd: sandboxDir,
      timeout: 15000,
      env: {
        ...process.env,
        CI: '1',
        NODE_ENV: 'test',
        // prevent child from inheriting network-related env if desired
        HTTP_PROXY: '',
        HTTPS_PROXY: '',
        NO_PROXY: '*',
      },
    });

    return {
      succeeded: true,
      output: result.stdout,
      diagnostics: result.stderr,
    };
  } catch (error: any) {
    return {
      succeeded: false,
      output: error.stdout ?? '',
      diagnostics: error.stderr ?? error.message,
    };
  } finally {
    rmSync(sandboxDir, { recursive: true, force: true });
  }
}
