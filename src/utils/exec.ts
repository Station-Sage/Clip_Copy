import * as cp from 'child_process';

export function execSync(command: string, cwd: string): string {
  try {
    return cp.execSync(command, { cwd, encoding: 'utf8', timeout: 30000 });
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'stdout' in err) {
      return String((err as { stdout: string }).stdout || '');
    }
    return '';
  }
}

const DEFAULT_SPAWN_TIMEOUT_MS = 120_000;

export function spawnAsync(
  command: string,
  args: string[],
  cwd: string,
  onData?: (data: string) => void,
  timeoutMs: number = DEFAULT_SPAWN_TIMEOUT_MS
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const stdout: string[] = [];
    const stderr: string[] = [];
    const [cmd, ...cmdArgs] = command.split(' ');
    const allArgs = [...cmdArgs, ...args];
    let settled = false;

    const proc = cp.spawn(cmd, allArgs, { cwd, shell: true });

    // B-019: timeout to prevent hung processes blocking forever
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        proc.kill('SIGTERM');
        setTimeout(() => { try { proc.kill('SIGKILL'); } catch { /* already dead */ } }, 5000);
        resolve({
          exitCode: 1,
          stdout: stdout.join(''),
          stderr: stderr.join('') + `\n[CodeBreeze] Process timed out after ${timeoutMs}ms`,
        });
      }
    }, timeoutMs);

    proc.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      stdout.push(text);
      onData?.(text);
    });

    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString();
      stderr.push(text);
      onData?.(text);
    });

    proc.on('close', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({
          exitCode: code ?? 1,
          stdout: stdout.join(''),
          stderr: stderr.join(''),
        });
      }
    });

    proc.on('error', (err) => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve({ exitCode: 1, stdout: '', stderr: err.message });
      }
    });
  });
}
