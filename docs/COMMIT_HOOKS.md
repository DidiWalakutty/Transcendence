# Commit Hooks

The repository uses Vite+ commit hooks to keep committed code formatted, linted, and type-safe.

The setup follows the Vite+ guide:

```text
https://viteplus.dev/guide/commit-hooks
```

## What The Hook Does

Before a commit is accepted, staged files are checked with the configured Vite+ tasks.

If formatting, linting, or type errors are found, the commit is blocked and the original staged state is restored.

## Fixing Hook Failures

Run:

```bash
vp run check:fix
```

Then review the changes, stage them, and commit again.

## Notes

- Do not bypass hooks unless the team explicitly agrees.
- Generated files should be regenerated through Vite+ tasks, not edited by hand.
- If a hook fails because generated tRPC types are stale, run `vp run trpc:generate`.
