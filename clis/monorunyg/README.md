# Monorun

A lightweight alternative to Turborepo for monorepo build orchestration.

## Features

- 🚀 **Automatic workspace discovery** - Finds all packages in your monorepo
- 🔄 **Dependency-aware build ordering** - Builds packages in the correct order
- ⚡ **Parallel execution** - Runs builds in parallel for faster execution
- 🎯 **Custom task strategies** - Different execution strategies per command
- 📦 **PNPM workspace support** - Works seamlessly with PNPM workspaces

## Installation

```bash
# Install as a dev dependency
npm install --save-dev monorun

# Or with pnpm
pnpm add -D monorun
```

## Usage

```bash
# Build all packages and apps
monorun build

# Start development mode
monorun dev

# Start all apps
monorun start
```

## How it works

1. **Discovery**: Reads `pnpm-workspace.yaml` to find all packages
2. **Dependency Resolution**: Builds a dependency graph of workspace packages
3. **Topological Sort**: Orders packages based on dependencies
4. **Execution**: Runs tasks with optimal parallelization:
   - **Build**: Packages in parallel, then apps in parallel
   - **Start**: All apps in parallel
   - **Dev**: Sequential execution (packages first, then apps)

## Built by

**Yagya Goel**  
GitHub: [https://github.com/yagyagoel1](https://github.com/yagyagoel1)

---

⭐️ If you find this useful, please consider starring the project on GitHub!
