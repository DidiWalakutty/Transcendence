import { chmodSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform === 'win32') {
  process.exit(0);
}

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const nativeDirectory = join(
  repositoryRoot,
  'apps',
  'backend',
  'node_modules',
  'nestjs-trpc',
  'native',
);

let targetDirectories;
try {
  targetDirectories = readdirSync(nativeDirectory, { withFileTypes: true });
} catch (error) {
  if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
    console.warn('nestjs-trpc is not installed; skipping its executable permission check.');
    process.exit(0);
  }
  throw error;
}

let repairedCount = 0;

for (const targetDirectory of targetDirectories) {
  if (!targetDirectory.isDirectory()) {
    continue;
  }

  const binaryPath = join(nativeDirectory, targetDirectory.name, 'nestjs-trpc');

  try {
    const mode = statSync(binaryPath).mode;
    if ((mode & 0o111) === 0) {
      chmodSync(binaryPath, mode | 0o111);
      repairedCount += 1;
    }
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error;
    }
  }
}

if (repairedCount > 0) {
  console.log(`Made ${repairedCount} nestjs-trpc native binaries executable.`);
}
