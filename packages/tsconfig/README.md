# @repo/tsconfig

Shared TypeScript configuration package for the monorepo.

This package exports the base `tsconfig.json` used by workspaces that opt into the common compiler settings. It keeps strictness, target libraries, and baseline TypeScript behavior consistent across apps and packages.

## Start Here

- Monorepo layout: [Monorepo](../../docs/MONOREPO.md)
- Tooling and checks: [Tooling](../../docs/TOOLING.md)
- Stack overview: [Stack](../../docs/STACK.md)

## Important Files

| Path                             | Purpose                                        |
| -------------------------------- | ---------------------------------------------- |
| [tsconfig.json](./tsconfig.json) | Shared compiler options.                       |
| [package.json](./package.json)   | Exports the shared config as `@repo/tsconfig`. |

## Usage

Workspace `tsconfig.json` files can extend this package:

```json
{
  "extends": "@repo/tsconfig"
}
```

Run TypeScript-related checks through the root Vite+ tasks:

```bash
vp run check
```
