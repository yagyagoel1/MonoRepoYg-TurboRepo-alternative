#!/usr/bin/env tsx
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
async function run(task: "build" | "dev") {
  const all = topoSort(loadPkgs());
  // packages first: detect location by path prefix
  const pkgs = all.filter(p => p.dir.includes("/packages/"));
  const apps = all.filter(p => p.dir.includes("/apps/"));

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

const cmd = process.argv[2];
if (!cmd || !["build", "dev"].includes(cmd)) {
  console.error("usage: runner build|dev");
  process.exit(1);
}
run(cmd as any);
