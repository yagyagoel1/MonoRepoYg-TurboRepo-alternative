# create-monorun

A CLI tool to create a new monorepo project with Monorun, a lightweight alternative to Turborepo.

## Usage

```bash
npx create-monorun my-project
```

or

```bash
npm create monorun my-project
```

## What it creates

This tool scaffolds a complete monorepo setup with:

- **Frontend app** (Vite + React + TypeScript)
- **Next.js app** (Next.js 15 + TypeScript + Tailwind)
- **Shared packages** (UI components and utilities)
- **Monorun** for build orchestration
- **pnpm workspace** configuration
- **TypeScript** configuration across all packages

## Project Structure

```
my-project/
├── apps/
│   ├── frontend/          # Vite + React app
│   └── nexttest/          # Next.js app
├── packages/
│   ├── ui/                # Shared UI components
│   └── test/              # Shared utilities
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Available Commands

After creating your project:

```bash
cd my-project

# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run all apps in development mode
pnpm run dev

# Run a specific command across all packages
monorun build
monorun dev
monorun start
```

## Features

- 🚀 **Fast builds** with intelligent dependency resolution
- 📦 **Workspace management** with pnpm workspaces
- 🔧 **TypeScript support** out of the box
- ⚡ **Hot reloading** for development
- 🎯 **Selective execution** - only builds what changed
- 🔄 **Parallel execution** for maximum speed

## Requirements

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

## License

MIT
