# CI

The project uses simple GitHub Actions CI generated and managed through Vite+ conventions.

The setup follows the Vite+ guide:

```text
https://viteplus.dev/guide/ci
```

## Purpose

CI should verify that pushed code can be installed, checked, tested, and built in a clean environment.

At minimum, CI should cover:

1. Dependency installation.
2. Formatting, linting, and type checks.
3. Test execution.
4. Build verification.

The current workflow runs:

```bash
vp install --frozen-lockfile
vp run -w repo:check
vp run -w repo:test
vp run -w repo:build
```

## Local Equivalent

Before opening a pull request, run:

```bash
vp run check
vp run test
vp run build
```

The commit hook catches many issues earlier, but CI is still the final clean-environment check.
