import { chmodSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
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

if (process.platform === 'linux') {
  const targetArchitecture = process.arch === 'arm64' ? 'aarch64' : 'x86_64';
  const binaryPath = join(
    nativeDirectory,
    `${targetArchitecture}-unknown-linux-gnu`,
    'nestjs-trpc',
  );
  const loader = process.env.NESTJS_TRPC_LINUX_LOADER;
  const rpath = process.env.NESTJS_TRPC_LINUX_RPATH;

  if (loader && rpath) {
    const patchResult = spawnSync(
      'patchelf',
      ['--set-interpreter', loader, '--set-rpath', rpath, binaryPath],
      { encoding: 'utf8' },
    );

    if (patchResult.status !== 0) {
      const detail = patchResult.stderr.trim() || patchResult.error?.message || 'unknown error';
      throw new Error(`Failed to make nestjs-trpc compatible with the Nix GLIBC: ${detail}`);
    }

    const configuredLoader = spawnSync('patchelf', ['--print-interpreter', binaryPath], {
      encoding: 'utf8',
    });

    if (configuredLoader.status !== 0 || configuredLoader.stdout.trim() !== loader) {
      throw new Error('Failed to verify the nestjs-trpc Nix dynamic loader.');
    }

    // Force an early read so a missing loader is reported during installation,
    // rather than later when tRPC generation starts.
    readFileSync(loader);
    console.log('Configured nestjs-trpc to use the Nix-provided GLIBC.');
  }
}
