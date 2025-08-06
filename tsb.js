#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const MAGENTA = '\x1b[35m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

const args = process.argv.slice(2);
const flags = {
  force: false,
  silent: false,
  autorun: false,
  outDir: null,
  outputName: null,
};
const files = [];

if (args.length === 0) {
  console.log(`Hello! Looks like you ran the file with no arguments. If you're confused on how this works, run ${CYAN}tsb --help${RESET}.`);
  process.exit(0);
}

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--force') flags.force = true;
  else if (arg === '--silent') flags.silent = true;
  else if (arg === '--autorun') flags.autorun = true;
  else if (arg === '--outDir') {
    flags.outDir = args[i + 1];
    i++;
  } else if (arg === '--outputName') {
    flags.outputName = args[i + 1];
    i++;
  } else if (arg === '--help') {
    console.log(`
${CYAN}tsb - simple typescript build tool${RESET}

usage:
  tsb <file.ts> [options]

options:
  --help         Show this help message
  --force        Overwrite existing output file without prompt
  --silent       No logs or prompts unless error
  --outDir       Specify output directory for compiled .js
  --outputName   Set output .js filename
  --autorun      Run compiled .js automatically after build without prompt

examples:
  tsb src/app.ts --force
  tsb main.ts --outDir dist --autorun
  tsb code.ts --outputName built.js
`);
    process.exit(0);
  } else if (arg.endsWith('.ts')) {
    files.push(arg);
  }
}

if (files.length === 0) {
  console.error(`${RED}error:${RESET} no input .ts files provided`);
  process.exit(1);
}

const cwd = process.cwd();

function log(msg) {
  if (!flags.silent) console.log(msg);
}
function error(msg) {
  console.error(`${RED}error:${RESET} ${msg}`);
}
function warning(msg) {
  if (!flags.silent) console.warn(`${YELLOW}warning:${RESET} ${msg}`);
}

const tsconfigPath = path.join(cwd, 'tsconfig.json');
const useTsconfig = fs.existsSync(tsconfigPath);
if (useTsconfig && !flags.silent) {
  console.log(`${CYAN}tsconfig.json found, using it${RESET}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

async function compileFile(tsFile) {
  const inputPath = path.resolve(tsFile);
  const baseName = path.basename(tsFile, '.ts');

  if (!fs.existsSync(inputPath)) {
    error(`input file not found: ${inputPath}`);
    return null;
  }

  let outDir = flags.outDir ? path.resolve(flags.outDir) : path.dirname(inputPath);
  if (flags.outDir && !fs.existsSync(outDir)) {
    log(`${CYAN}creating output directory:${RESET} ${outDir}`);
    try {
      fs.mkdirSync(outDir, { recursive: true });
    } catch {
      error(`failed to create outDir: ${outDir}`);
      return null;
    }
  }

  const jsFile = path.join(outDir, flags.outputName || baseName + '.js');

  if (fs.existsSync(jsFile) && !flags.force) {
    const replace = await ask(`${YELLOW}warning:${RESET} ${jsFile} already exists. Replace? (y/n): `);
    if (!replace) {
      log('Aborted by user.');
      return null;
    }
  }

  log(`${CYAN}Compiling with tsc...${RESET}`);
  const startTime = Date.now();

  let cmd = 'tsc';
  cmd += ` "${inputPath}"`;
  if (flags.outDir) cmd += ` --outDir "${outDir}"`;

  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    error(`compilation failed for ${tsFile}`);
    return null;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  if (!fs.existsSync(jsFile)) {
    error(`expected output file not found: ${jsFile}`);
    return null;
  }

  const stats = fs.statSync(jsFile);
  const sizeKB = (stats.size / 1024).toFixed(2);
  const lines = fs.readFileSync(inputPath, 'utf-8').split('\n').length;

  log(`${GREEN}Compilation successful${RESET} (${duration}s)`);
  log(`${MAGENTA}Output file:${RESET} ${path.relative(cwd, jsFile)} (${sizeKB} KB)`);
  log(`${CYAN}Source lines:${RESET} ${lines}`);

  return { jsFile, tsFile };
}

(async () => {
  for (const file of files) {
    log(`${CYAN}Preparing to compile:${RESET} ${file}`);
    const result = await compileFile(file);
    if (!result) {
      if (!flags.silent) log('Build failed or skipped.');
      continue;
    }

    if (!flags.silent && files.length === 1) {
      if (flags.autorun) {
        process.stdout.write('\x1Bc');
        try {
          execSync(`node "${result.jsFile}"`, { stdio: 'inherit' });
        } catch (e) {
          error(`execution failed:\n${e.message}`);
        }
      } else {
        const runIt = await ask(`${BLUE}Run compiled script now? (y/n): ${RESET}`);
        if (runIt) {
          process.stdout.write('\x1Bc');
          try {
            execSync(`node "${result.jsFile}"`, { stdio: 'inherit' });
          } catch (e) {
            error(`execution failed:\n${e.message}`);
          }
        }
      }
    }
  }
  rl.close();
  process.exit(0);
})();
