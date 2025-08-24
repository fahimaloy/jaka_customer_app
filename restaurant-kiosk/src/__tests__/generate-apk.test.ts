import { execSync } from 'node:child_process';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

describe('generate-apk script', () => {
  it('runs dependency checks with --check flag', () => {
    const script = path.resolve(__dirname, '../../../scripts/generate-apk.sh');
    const output = execSync(`${script} --check`, { encoding: 'utf8' });
    expect(output).toMatch(/Node\.js/i);
    expect(output).toMatch(/Android SDK/i);
    expect(output).toMatch(/Android Studio/i);
  });
});
