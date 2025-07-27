#!/usr/bin/env tsx
/**
 * Turbo Repo Clone - Custom Monorepo Build Orchestrator
 * 
 * Built by: Yagya Goel
 * GitHub: https://github.com/yagyagoel1
 * 
 * A lightweight alternative to Turborepo that provides:
 * - Automatic workspace discovery
 * - Dependency-aware build ordering
 * - Parallel execution for faster builds
 * - Custom task strategies per command
 */
import fs from "fs";
import path from "path";
import { execa } from "execa";
import chalk from "chalk";
import glob from "fast-glob";

type Pkg = { name: string; dir: string; deps: string[] };

const ROOT = process.cwd();
const WS = path.join(ROOT, "pnpm-workspace.yaml");
const pkgsRoot = (p: string) => path.join(ROOT, p);

// 1. Discover workspace globs, read package.json from each
function loadPkgs(): Pkg[] {
  const lines = fs.readFileSync(WS, "utf8")
    .split("\n")
    .filter(l => l.trim().startsWith("-"))
    .map(l => l.trim().replace(/^-\s*/, "").replace(/['"]/g, ""));
  
  const pkgPaths = lines.flatMap(pattern => 
    glob.sync(pattern, { cwd: ROOT, onlyDirectories: true })
  );
  return pkgPaths
    .map(rel => {
      const pkgJson = path.join(ROOT, rel, "package.json");
      if (!fs.existsSync(pkgJson)) return null;
      const { name, dependencies = {} } = JSON.parse(
        fs.readFileSync(pkgJson, "utf8")
      );
      const deps = Object.keys(dependencies).filter(d =>
        pkgPaths.includes((dependencies as any)[d])
      );
      return { name, dir: path.join(ROOT, rel), deps };
    })
    .filter(Boolean) as Pkg[];
}

// 2. Topo‑sort
function topoSort(all: Pkg[]): Pkg[] {
  const res: Pkg[] = [];
  const seen = new Set<string>();
  function visit(p: Pkg) {
    if (seen.has(p.name)) return;
    p.deps.forEach(d => {
      const dp = all.find(x => x.name === d);
      if (dp) visit(dp);
    });
    seen.add(p.name);
    res.push(p);
  }
  all.forEach(visit);
  return res;
}

// 3. Run a task on packages, then apps
async function run(task: "build" | "dev" | "start") {
  const all = topoSort(loadPkgs());
  // packages first: detect location by path prefix
  const pkgs = all.filter(p => p.dir.includes("/packages/"));
  const apps = all.filter(p => p.dir.includes("/apps/"));

  // Run pnpm install before build to ensure workspace dependencies are up-to-date
  if (task === "build") {
    console.log(chalk.blue("\n📦 Installing dependencies to ensure workspace is up-to-date..."));
    await execa("pnpm", ["install"], {
      cwd: ROOT,
      stdio: "inherit",
    });
    console.log(chalk.green("✅ Dependencies installed successfully!"));
  }

  if (task === "start") {
    // For start command, only run apps
    for (const p of apps) {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.join(p.dir, "package.json"), "utf8")
      );
      if (!pkgJson.scripts?.[task]) continue;
      console.log(chalk.blue(`\n▶ ${task} › ${p.name}`));
      await execa("pnpm", ["run", task], {
        cwd: p.dir,
        stdio: "inherit",
      });
    }
  } else if (task === "build") {
    // For build, run packages in parallel first, then apps in parallel
    
    // Build all packages in parallel
    if (pkgs.length > 0) {
      console.log(chalk.yellow("\n🔧 Building packages in parallel..."));
      const packagePromises = pkgs.map(async (p) => {
        const pkgJson = JSON.parse(
          fs.readFileSync(path.join(p.dir, "package.json"), "utf8")
        );
        if (!pkgJson.scripts?.[task]) return;
        
        console.log(chalk.blue(`\n▶ ${task} › ${p.name}`));
        return execa("pnpm", ["run", task], {
          cwd: p.dir,
          stdio: "inherit",
        });
      }).filter(Boolean);
      
      // Wait for all packages to build
      await Promise.all(packagePromises);
      console.log(chalk.green("\n✅ All packages built successfully!"));
    }
    
    // Then build all apps in parallel
    if (apps.length > 0) {
      console.log(chalk.yellow("\n🚀 Building apps in parallel..."));
      const appPromises = apps.map(async (p) => {
        const pkgJson = JSON.parse(
          fs.readFileSync(path.join(p.dir, "package.json"), "utf8")
        );
        if (!pkgJson.scripts?.[task]) return;
        
        console.log(chalk.blue(`\n▶ ${task} › ${p.name}`));
        return execa("pnpm", ["run", task], {
          cwd: p.dir,
          stdio: "inherit",
        });
      }).filter(Boolean);
      
      // Wait for all apps to build
      await Promise.all(appPromises);
      console.log(chalk.green("\n✅ All apps built successfully!"));
    }
  } else {
    // For dev, run packages first, then apps sequentially (as before)
    for (const p of [...pkgs, ...apps]) {
      const pkgJson = JSON.parse(
        fs.readFileSync(path.join(p.dir, "package.json"), "utf8")
      );
      if (!pkgJson.scripts?.[task]) continue;
      console.log(chalk.blue(`\n▶ ${task} › ${p.name}`));
      await execa("pnpm", ["run", task], {
        cwd: p.dir,
        stdio: "inherit",
      });
    }
  }
}

const cmd = process.argv[2];
if (!cmd || !["build", "dev", "start"].includes(cmd)) {
  console.error("usage: runner build|dev|start");
  process.exit(1);
}

console.log(chalk.cyan("❤️ Turbo Repo Clone by Yagya Goel"));
console.log(chalk.dim("   GitHub: https://github.com/yagyagoel1"));
console.log(chalk.dim(`   Running command: ${cmd}`));
console.log(chalk.dim(`   Timestamp: ${new Date().toISOString()}`));
console.log("");

run(cmd as any).then(() => {
  console.log("");
  console.log(chalk.cyan("✨ Build completed successfully!"));
  console.log(chalk.dim(`   Completed at: ${new Date().toISOString()}`));
  console.log(chalk.dim("   Thanks for using Turbo Repo Clone if you liked it"));
  console.log(chalk.greenBright("⭐️ Please consider starring the project on GitHub"));
  console.log(chalk.magenta("❤️  GitHub: https://github.com/yagyagoel1"));
}).catch((error) => {
  console.error(chalk.red("\n❌ Build failed:"), error.message);
  console.log(chalk.dim(`   Failed at: ${new Date().toISOString()}`));
  console.log(chalk.greenBright("   GitHub: https://github.com/yagyagoel1"));
  process.exit(1);
});
