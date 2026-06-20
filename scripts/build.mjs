#!/usr/bin/env node

import { select, Separator } from '@inquirer/prompts';
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BACK = Symbol('back');

const ROOT_DIR = process.cwd();
const APPS_DIR = path.join(ROOT_DIR, 'apps');

const MESSAGES = {
  appPrompt: '请选择要打包的应用',
  miniappTargetPrompt: '请选择小程序目标平台',
  mobileTargetPrompt: '请选择 Mobile 打包平台',
  runConfirm: (apps) => `${apps.join('、')}`,
  runLabel: '✅ 确认构建',
  switchData: '🔄 重新选择应用',
  back: '↩ 返回',
  cancel: '❌ 取消',
  all: '📦 全部打包',
};

// ============================================================
// App 发现 & 工具函数
// ============================================================

async function readJson(jsonPath) {
  const content = await fs.readFile(jsonPath, 'utf8');
  return JSON.parse(content);
}

function normalizeScripts(scripts) {
  return Object.entries(scripts ?? {}).map(([name, command]) => ({ name, command }));
}

async function loadApps() {
  const entries = await fs.readdir(APPS_DIR, { withFileTypes: true });
  const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

  const apps = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const directory = path.join(APPS_DIR, entry.name);
        const packageJsonPath = path.join(directory, 'package.json');

        try {
          const packageJson = await readJson(packageJsonPath);
          return {
            directory,
            folderName: entry.name,
            packageName: packageJson.name ?? entry.name,
            scripts: normalizeScripts(packageJson.scripts),
          };
        } catch (error) {
          if (error.code === 'ENOENT') return null;
          throw error;
        }
      }),
  );

  return apps
    .filter(Boolean)
    .sort((left, right) => collator.compare(left.folderName, right.folderName));
}

// ============================================================
// 构建定义
// ============================================================

const BUILD_TARGETS = {
  web: {
    label: '🌐 Web',
    buildCmd: ['build'],
    outputDir: 'apps/web/dist',
  },
  miniapp: {
    label: '📱 小程序',
    targets: {
      weapp: { label: '微信小程序', buildCmd: ['build:weapp'], outputDir: 'apps/miniapp/dist' },
    },
  },
  mobile: {
    label: '📲 Mobile (App)',
    targets: {
      'ios:local': {
        label: '🍎 iOS（生成原生工程 + Xcode 打包）',
        buildCmd: ['build:ios:local'],
        outputDir: 'apps/mobile/ios',
      },
      'android:local': {
        label: '🤖 Android（本地打包 APK）',
        buildCmd: ['build:android:local'],
        outputDir: 'apps/mobile/android/app/build/outputs/apk/release',
      },
    },
  },
};

// ============================================================
// 构建执行
// ============================================================

function runBuild(app, buildCmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 开始构建 ${app.folderName}...`);
    const child = spawn('pnpm', ['--dir', path.join('apps', app.folderName), ...buildCmd], {
      cwd: ROOT_DIR,
      shell: true,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`构建失败，退出码 ${code}`));
    });
    child.on('error', reject);
  });
}

// ============================================================
// Mock 泄漏检测
// ============================================================

/** 需要在产物中搜索的 mock 敏感标识符 */
const MOCK_SIGNATURES = [
  'mockUsers',
  'mockDepartments',
  'mockLoginResponse',
  'mockMembers',
  'searchOrg',
  'mockHandlers',
];

/** 用 ripgrep 风格在产物目录中搜索，返回匹配的文件列表 */
async function searchInDist(distDir, pattern) {
  const files = [];
  const distPath = path.resolve(ROOT_DIR, distDir);

  try {
    await fs.access(distPath);
  } catch {
    return { found: false, files: [], error: `产物目录不存在: ${distDir}` };
  }

  const { spawnSync } = await import('node:child_process');

  // 优先用 rg，更快
  let result;
  try {
    result = spawnSync('rg', ['-l', pattern, distPath], { encoding: 'utf8' });
  } catch {
    // rg 不可用时用 grep
    result = spawnSync('grep', ['-rl', pattern, distPath], { encoding: 'utf8' });
  }

  if (result.error && result.error.code !== 'ENOENT') {
    return { found: false, files: [], error: result.error.message };
  }

  const matched = (result.stdout || '').trim().split('\n').filter(Boolean);

  // 如果 rg/grep 都不可用，回退到 node 原生遍历
  if (result.error?.code === 'ENOENT') {
    const foundFiles = await walkAndSearch(distPath, pattern);
    return foundFiles.length > 0 ? { found: true, files: foundFiles } : { found: false, files: [] };
  }

  return matched.length > 0 ? { found: true, files: matched } : { found: false, files: [] };
}

async function walkAndSearch(dirPath, pattern) {
  const results = [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const sub = await walkAndSearch(fullPath, pattern);
      results.push(...sub);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.js') || entry.name.endsWith('.mjs') || entry.name.endsWith('.ts'))
    ) {
      const content = await fs.readFile(fullPath, 'utf8');
      if (content.includes(pattern)) {
        results.push(fullPath);
      }
    }
  }

  return results;
}

async function checkMockLeak(distDir) {
  const results = {};

  for (const sig of MOCK_SIGNATURES) {
    results[sig] = await searchInDist(distDir, sig);
  }

  return results;
}

function printMockReport(appName, distDir, results) {
  const entries = Object.entries(results);
  const leaked = entries.filter(([, r]) => r.found);
  const errors = entries.filter(([, r]) => r.error);
  const clean = entries.filter(([, r]) => !r.found && !r.error);

  if (leaked.length === 0 && errors.length === 0) {
    console.log(`  ✅ ${appName}: 未发现 mock 数据泄漏`);
    return true;
  }

  if (leaked.length > 0) {
    console.log(`  ❌ ${appName}: 发现 mock 数据泄漏！`);
    for (const [sig, r] of leaked) {
      console.log(`      - "${sig}" 出现在:`);
      for (const f of r.files) {
        console.log(`        ${f}`);
      }
    }
    return false;
  }

  if (errors.length > 0) {
    console.log(`  ⚠️  ${appName}: 无法检测（${errors[0][1].error}）`);
    // 无法检测不算失败，返回 true
  }

  return true;
}

// ============================================================
// 交互流程
// ============================================================

async function chooseApp(apps) {
  const choices = [
    ...apps.map((app) => ({
      name: BUILD_TARGETS[app.folderName]?.label ?? app.folderName,
      value: app,
    })),
    new Separator(),
    { name: MESSAGES.all, value: 'all' },
    new Separator(),
    { name: MESSAGES.cancel, value: 'cancel' },
  ];

  return select({ message: MESSAGES.appPrompt, choices });
}

async function chooseMiniappTarget() {
  const targets = BUILD_TARGETS.miniapp.targets;
  const choices = [
    ...Object.entries(targets).map(([key, t]) => ({ name: t.label, value: key })),
    new Separator(),
    { name: MESSAGES.back, value: BACK },
  ];

  return select({ message: MESSAGES.miniappTargetPrompt, choices });
}

async function chooseMobileTarget() {
  const targets = BUILD_TARGETS.mobile.targets;
  const choices = [
    ...Object.entries(targets).map(([key, t]) => ({ name: t.label, value: key })),
    new Separator(),
    { name: MESSAGES.back, value: BACK },
  ];

  return select({ message: MESSAGES.mobileTargetPrompt, choices });
}

/** 根据 app 类型构建 target 列表 */
async function resolveTargets(app) {
  const targets = [];
  const def = BUILD_TARGETS[app.folderName];
  if (!def) return targets;

  if (def.targets) {
    let targetKey;
    if (app.folderName === 'miniapp') {
      targetKey = await chooseMiniappTarget();
    } else if (app.folderName === 'mobile') {
      targetKey = await chooseMobileTarget();
    }
    if (!targetKey || targetKey === BACK) return null;
    const targetDef = def.targets[targetKey];
    targets.push({
      app,
      target: targetKey,
      buildCmd: targetDef.buildCmd,
      outputDir: targetDef.outputDir,
    });
  } else {
    targets.push({ app, buildCmd: def.buildCmd, outputDir: def.outputDir });
  }

  return targets;
}

// ============================================================
// 主流程
// ============================================================

async function main() {
  console.log('📦 Fullstack Build & Mock Leak Check\n');

  const apps = await loadApps();
  if (apps.length === 0) {
    console.log('未在 apps 目录下找到可构建的应用包。');
    process.exit(1);
  }

  // 1. 选择应用
  const selected = await chooseApp(apps);
  if (selected === 'cancel') {
    console.log('已取消。');
    process.exit(0);
  }

  let targetsToBuild = [];

  if (selected === 'all') {
    for (const app of apps) {
      const def = BUILD_TARGETS[app.folderName];
      if (!def) continue;
      if (def.targets) {
        // 有子平台的取第一个作为默认值
        const firstKey = Object.keys(def.targets)[0];
        const t = def.targets[firstKey];
        targetsToBuild.push({
          app,
          target: firstKey,
          buildCmd: t.buildCmd,
          outputDir: t.outputDir,
        });
      } else {
        targetsToBuild.push({ app, buildCmd: def.buildCmd, outputDir: def.outputDir });
      }
    }
  } else {
    const result = await resolveTargets(selected);
    if (!result) {
      console.log('已取消。');
      process.exit(0);
    }
    targetsToBuild = result;
  }

  // 2. 确认 & 开始
  while (true) {
    const labels = targetsToBuild.map(
      (t) => `${t.app.folderName}${t.target ? `:${t.target}` : ''}`,
    );
    const action = await select({
      message: `确认打包：${MESSAGES.runConfirm(labels)}`,
      choices: [
        { name: `✅ 确认构建（${labels.join('、')}）`, value: 'run' },
        { name: MESSAGES.switchData, value: 'switch' },
        { name: MESSAGES.cancel, value: 'cancel' },
      ],
    });

    if (action === 'run') break;
    if (action === 'cancel') {
      console.log('已取消。');
      process.exit(0);
    }
    if (action === 'switch') {
      const res = await chooseApp(apps);
      if (res === 'cancel') {
        console.log('已取消。');
        process.exit(0);
      }
      if (res === 'all') {
        targetsToBuild = [];
        for (const app of apps) {
          const def = BUILD_TARGETS[app.folderName];
          if (!def) continue;
          if (def.targets) {
            const firstKey = Object.keys(def.targets)[0];
            const t = def.targets[firstKey];
            targetsToBuild.push({
              app,
              target: firstKey,
              buildCmd: t.buildCmd,
              outputDir: t.outputDir,
            });
          } else {
            targetsToBuild.push({ app, buildCmd: def.buildCmd, outputDir: def.outputDir });
          }
        }
      } else {
        const result = await resolveTargets(res);
        if (!result) continue;
        targetsToBuild = result;
      }
    }
  }

  // 3. 构建
  let buildFailed = false;
  for (const t of targetsToBuild) {
    try {
      await runBuild(t.app, t.buildCmd);
    } catch (err) {
      console.error(`❌ ${t.app.folderName} 构建失败: ${err.message}`);
      buildFailed = true;
    }
  }

  // 4. Mock 泄漏检测
  console.log('\n--- Mock 泄漏检测 ---\n');
  let allClean = true;

  for (const t of targetsToBuild) {
    if (!t.outputDir) continue;
    const results = await checkMockLeak(t.outputDir);
    const label = `${t.app.folderName}${t.target ? `:${t.target}` : ''}`;
    if (!printMockReport(label, t.outputDir, results)) {
      allClean = false;
    }
  }

  // 5. 总结
  console.log('');
  if (buildFailed) {
    console.log('⚠️  部分构建失败，请检查上方错误信息。');
  }
  if (allClean) {
    console.log('✅ 所有产物 Mock 检查通过！');
  } else {
    console.log('❌ 部分产物存在 Mock 数据泄漏，请排查！');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('脚本异常:', err);
  process.exit(1);
});
