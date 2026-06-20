#!/usr/bin/env node
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

/**
 * 扫描 apps/ 下所有有 tsconfig.json 的子目录，
 * 返回 [前缀, tsconfig路径] 的数组，按路径从长到短排序。
 */
async function discoverProjects() {
  const projects = [];

  for (const dir of ['apps', 'packages']) {
    const dirPath = path.join(ROOT, dir);
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const tsconfig = path.join(dirPath, entry.name, 'tsconfig.json');
        if (existsSync(tsconfig)) {
          projects.push({
            prefix: `${dir}/${entry.name}/`,
            tsconfig,
          });
        }
      }
    } catch {
      // 目录不存在则跳过
    }
  }

  // 长路径优先，确保 apps/web/ 比 apps/ 优先匹配
  projects.sort((a, b) => b.prefix.length - a.prefix.length);
  return projects;
}

/**
 * 根据文件路径匹配到对应的 tsconfig 项目。
 * 返回 tsconfig.json 路径，若匹配不到则返回 null。
 */
function resolveProject(filePath, projects) {
  for (const p of projects) {
    if (filePath.startsWith(p.prefix)) {
      return p.tsconfig;
    }
  }
  return null;
}

const files = process.argv.slice(2);
if (files.length === 0) {
  process.exit(0);
}

const projects = await discoverProjects();

// 按项目去重
const tsconfigs = new Set();
for (const f of files) {
  const tsconfig = resolveProject(f, projects);
  if (tsconfig) tsconfigs.add(tsconfig);
}

if (tsconfigs.size === 0) {
  process.exit(0);
}

// 逐个运行 tsc
let hasError = false;
for (const tsconfig of tsconfigs) {
  const relPath = path.relative(ROOT, tsconfig);
  console.log(`  tsc -p ${relPath} --noEmit`);

  const result = spawnSync('pnpm', ['exec', 'tsc', '-p', tsconfig, '--noEmit'], {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  if (result.status !== 0) {
    hasError = true;
  }
}

if (hasError) {
  process.exit(1);
}
