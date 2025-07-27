#!/usr/bin/env node
/**
 * Monorun CLI - Custom Monorepo Build Orchestrator
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

import { run } from './index';
import chalk from 'chalk';

const cmd = process.argv[2];
if (!cmd || !["build", "dev", "start"].includes(cmd)) {
  console.error("usage: monorun build|dev|start");
  process.exit(1);
}

console.log(chalk.cyan("❤️ Monorun by Yagya Goel"));
console.log(chalk.dim("   GitHub: https://github.com/yagyagoel1"));
console.log(chalk.dim(`   Running command: ${cmd}`));
console.log(chalk.dim(`   Timestamp: ${new Date().toISOString()}`));
console.log("");

run(cmd as "build" | "dev" | "start").then(() => {
  console.log("");
  console.log(chalk.cyan("✨ Build completed successfully!"));
  console.log(chalk.dim(`   Completed at: ${new Date().toISOString()}`));
  console.log(chalk.dim("   Thanks for using Monorun if you liked it"));
  console.log(chalk.greenBright("⭐️ Please consider starring the project on GitHub"));
  console.log(chalk.magenta("❤️  GitHub: https://github.com/yagyagoel1"));
}).catch((error: any) => {
  console.error(chalk.red("\n❌ Build failed:"), error.message);
  console.log(chalk.dim(`   Failed at: ${new Date().toISOString()}`));
  console.log(chalk.greenBright("   GitHub: https://github.com/yagyagoel1"));
  process.exit(1);
});
