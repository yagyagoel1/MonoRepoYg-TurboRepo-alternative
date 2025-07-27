import * as fs from 'fs-extra';
import * as path from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import prompts from 'prompts';

interface ProjectOptions {
  name: string;
  directory: string;
  packageManager: 'npm' | 'pnpm' | 'yarn';
}

export async function createMonorepo(): Promise<void> {
  console.log(chalk.blue('🚀 Welcome to Monorun Project Creator!'));
  console.log();

  // Check for command line arguments
  const args = process.argv.slice(2);
  let options: ProjectOptions;

  if (args.length >= 3) {
    // Non-interactive mode with command line arguments
    options = {
      name: args[0],
      directory: args[1],
      packageManager: args[2] as 'npm' | 'pnpm' | 'yarn'
    };
    console.log(chalk.blue(`Creating project: ${options.name} in ${options.directory} using ${options.packageManager}`));
  } else {
    // Interactive mode
    const response = await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'What is your project named?',
        initial: 'my-monorun-project',
        validate: (value: string) => value.length > 0 ? true : 'Project name is required'
      },
      {
        type: 'text',
        name: 'directory',
        message: 'Where should we create your project?',
        initial: (prev: string) => `./${prev}`,
        validate: (value: string) => value.length > 0 ? true : 'Directory is required'
      },
      {
        type: 'select',
        name: 'packageManager',
        message: 'Which package manager would you like to use?',
        choices: [
          { title: 'pnpm (recommended)', value: 'pnpm' },
          { title: 'npm', value: 'npm' },
          { title: 'yarn', value: 'yarn' }
        ],
        initial: 0
      }
    ]);

    if (!response.name || !response.directory || !response.packageManager) {
      console.log(chalk.red('❌ Operation cancelled'));
      return;
    }

    options = response;
  }

  const projectPath = path.resolve(options.directory);

  // Check if directory already exists
  if (await fs.pathExists(projectPath)) {
    const { overwrite } = await prompts({
      type: 'confirm',
      name: 'overwrite',
      message: `Directory ${projectPath} already exists. Overwrite?`,
      initial: false
    });

    if (!overwrite) {
      console.log(chalk.red('❌ Operation cancelled'));
      return;
    }

    await fs.remove(projectPath);
  }

  console.log(chalk.blue(`📁 Creating project in ${projectPath}...`));
  
  try {
    await createProjectStructure(projectPath, options);
    await installDependencies(projectPath, options.packageManager);
    
    console.log();
    console.log(chalk.green('✅ Project created successfully!'));
    console.log();
    console.log(chalk.blue('🎉 Next steps:'));
    console.log(`  cd ${options.directory}`);
    console.log(`  ${options.packageManager} run build`);
    console.log(`  ${options.packageManager} run dev`);
    console.log();
    console.log(chalk.yellow('💡 Use "monorun run <command>" to run commands across all packages'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error creating project:'), error);
    throw error;
  }
}

async function createProjectStructure(projectPath: string, options: ProjectOptions): Promise<void> {
  console.log(chalk.blue('📝 Creating project structure...'));
  
  // Create directory structure
  await fs.ensureDir(projectPath);
  await fs.ensureDir(path.join(projectPath, 'apps'));
  await fs.ensureDir(path.join(projectPath, 'packages'));
  await fs.ensureDir(path.join(projectPath, 'apps/frontend/src'));
  await fs.ensureDir(path.join(projectPath, 'apps/frontend/public'));
  await fs.ensureDir(path.join(projectPath, 'apps/nexttest/app'));
  await fs.ensureDir(path.join(projectPath, 'apps/nexttest/public'));
  await fs.ensureDir(path.join(projectPath, 'packages/ui/src'));
  await fs.ensureDir(path.join(projectPath, 'packages/test/src'));

  // Get template directory
  const templateDir = path.join(__dirname, '../templates');

  // Copy template files
  const templates = [
    // Root files
    { src: 'package.json', dest: 'package.json' },
    { src: 'pnpm-workspace.yaml', dest: 'pnpm-workspace.yaml' },
    { src: 'tsconfig.json', dest: 'tsconfig.json' },
    { src: 'Dockerfile', dest: 'Dockerfile' },
    
    // Frontend app
    { src: 'apps/frontend/package.json', dest: 'apps/frontend/package.json' },
    { src: 'apps/frontend/vite.config.ts', dest: 'apps/frontend/vite.config.ts' },
    { src: 'apps/frontend/index.html', dest: 'apps/frontend/index.html' },
    { src: 'apps/frontend/tsconfig.json', dest: 'apps/frontend/tsconfig.json' },
    { src: 'apps/frontend/tsconfig.app.json', dest: 'apps/frontend/tsconfig.app.json' },
    { src: 'apps/frontend/tsconfig.node.json', dest: 'apps/frontend/tsconfig.node.json' },
    { src: 'apps/frontend/eslint.config.js', dest: 'apps/frontend/eslint.config.js' },
    { src: 'apps/frontend/src/main.tsx', dest: 'apps/frontend/src/main.tsx' },
    { src: 'apps/frontend/src/App.tsx', dest: 'apps/frontend/src/App.tsx' },
    { src: 'apps/frontend/src/App.css', dest: 'apps/frontend/src/App.css' },
    { src: 'apps/frontend/src/index.css', dest: 'apps/frontend/src/index.css' },
    { src: 'apps/frontend/src/vite-env.d.ts', dest: 'apps/frontend/src/vite-env.d.ts' },
    { src: 'apps/frontend/public/vite.svg', dest: 'apps/frontend/public/vite.svg' },
    
    // Next.js app
    { src: 'apps/nexttest/package.json', dest: 'apps/nexttest/package.json' },
    { src: 'apps/nexttest/next.config.ts', dest: 'apps/nexttest/next.config.ts' },
    { src: 'apps/nexttest/tsconfig.json', dest: 'apps/nexttest/tsconfig.json' },
    { src: 'apps/nexttest/postcss.config.mjs', dest: 'apps/nexttest/postcss.config.mjs' },
    { src: 'apps/nexttest/app/layout.tsx', dest: 'apps/nexttest/app/layout.tsx' },
    { src: 'apps/nexttest/app/page.tsx', dest: 'apps/nexttest/app/page.tsx' },
    { src: 'apps/nexttest/app/globals.css', dest: 'apps/nexttest/app/globals.css' },
    
    // Packages
    { src: 'packages/ui/package.json', dest: 'packages/ui/package.json' },
    { src: 'packages/ui/tsconfig.json', dest: 'packages/ui/tsconfig.json' },
    { src: 'packages/ui/src/index.ts', dest: 'packages/ui/src/index.ts' },
    { src: 'packages/test/package.json', dest: 'packages/test/package.json' },
    { src: 'packages/test/tsconfig.json', dest: 'packages/test/tsconfig.json' },
    { src: 'packages/test/src/index.ts', dest: 'packages/test/src/index.ts' },
  ];

  for (const template of templates) {
    const srcPath = path.join(templateDir, template.src);
    const destPath = path.join(projectPath, template.dest);
    
    if (await fs.pathExists(srcPath)) {
      await fs.copy(srcPath, destPath);
    }
  }

  // Replace project name in package.json files
  await replaceProjectName(projectPath, options.name);
}

async function replaceProjectName(projectPath: string, projectName: string): Promise<void> {
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

async function installDependencies(projectPath: string, packageManager: string): Promise<void> {
  console.log(chalk.blue(`📦 Installing dependencies with ${packageManager}...`));
  
  const installCommand = packageManager === 'yarn' ? 'install' : 'install';
  
  await execa(packageManager, [installCommand], {
    cwd: projectPath,
    stdio: 'inherit'
  });

  console.log(chalk.yellow('� Note: You can add monorun later by running:'));
  console.log(chalk.yellow(`  ${packageManager} add monorun --save-dev`));
}
