#!/usr/bin/env node

import { select, input } from '@inquirer/prompts';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const BACK = Symbol('back');

const ROOT_DIR = process.cwd();
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const collator = new Intl.Collator('zh-CN', { numeric: true, sensitivity: 'base' });

const MESSAGES = {
  noApps: '未在 apps 目录下找到可运行的应用包。',
  noScripts: '这个应用包里没有可运行的 scripts，请重新选择。',
  packagePrompt: '请选择要运行的应用包',
  scriptPrompt: (appName) => `请选择 ${appName} 的脚本命令`,
  dataModePrompt: '选择数据模式',
  customApiUrlPrompt: '输入后端接口地址',
  runConfirm: (appName, scriptName, dataMode) => `${appName} → ${scriptName}（${dataMode}）`,
  back: '↩ 返回',
  cancel: '❌ 取消',
};

const DATA_MODES = {
  mock: { name: '📦 模拟数据（Mock）', env: {} },
  real: { name: '🔗 联调真实接口', env: { DISABLE_MOCK: 'true' } },
  realCustom: { name: '🔗 联调接口（自定义地址）', env: { DISABLE_MOCK: 'true' } },
};

async function readJson(jsonPath) {
  const content = await fs.readFile(jsonPath, 'utf8');
  return JSON.parse(content);
}

function normalizeScripts(scripts) {
  return Object.entries(scripts ?? {}).map(([name, command]) => ({ name, command }));
}

async function loadApps() {
  const entries = await fs.readdir(APPS_DIR, { withFileTypes: true });
  const apps = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry) => {
        const directory = path.join(APPS_DIR, entry.name);
        const packageJsonPath = path.join(directory, 'package.json');

        try {
          const packageJson = await readJson(packageJsonPath);
          return {
            description: packageJson.description ?? '',
            directory,
            folderName: entry.name,
            packageName: packageJson.name ?? entry.name,
            scripts: normalizeScripts(packageJson.scripts),
          };
        } catch (error) {
          if (error.code === 'ENOENT') {
            return null;
          }
          throw error;
        }
      }),
  );

  return apps
    .filter(Boolean)
    .sort((left, right) => collator.compare(left.folderName, right.folderName));
}

function getAppLabel(app) {
  const parts = [app.folderName];

  if (app.packageName && app.packageName !== app.folderName) {
    parts.push(`(${app.packageName})`);
  }

  if (app.description) {
    parts.push(`- ${app.description}`);
  }

  return parts.join(' ');
}

function rankScript(scriptName) {
  if (scriptName === 'start') {
    return 0;
  }

  if (scriptName.startsWith('dev')) {
    return 1;
  }

  if (scriptName.startsWith('build')) {
    return 2;
  }

  return 3;
}

function sortScripts(scripts) {
  return [...scripts].sort((left, right) => {
    const leftRank = rankScript(left.name);
    const rightRank = rankScript(right.name);

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return collator.compare(left.name, right.name);
  });
}

function formatScriptChoice(script) {
  return {
    name: `${script.name}  ${script.command}`,
    value: script,
  };
}

function resolveRequestedApp(apps, requestedApp) {
  if (!requestedApp) {
    return null;
  }

  return (
    apps.find((app) => app.folderName === requestedApp) ??
    apps.find((app) => app.packageName === requestedApp) ??
    null
  );
}

function isDevScript(scriptName) {
  // build 命令不需要选数据模式（生产构建走真实 API）
  const lower = scriptName.toLowerCase();
  return !lower.startsWith('build');
}

/** 非 build 命令询问数据模式 */
async function chooseDataMode(app, scriptName) {
  if (!isDevScript(scriptName)) return null;

  const key = await select({
    message: MESSAGES.dataModePrompt,
    choices: [
      { name: DATA_MODES.mock.name, value: 'mock' },
      { name: DATA_MODES.real.name, value: 'real' },
      { name: DATA_MODES.realCustom.name, value: 'realCustom' },
      { name: MESSAGES.back, value: 'back' },
    ],
  });

  if (key === 'back') return BACK;

  const mode = DATA_MODES[key];
  const env = { ...mode.env };

  // 各平台专用环境变量（编译时注入，确保跨运行时传递）
  if (app.folderName === 'web' && key !== 'mock') {
    env.VITE_ENABLE_MOCK = 'false';
  } else if (app.folderName === 'mobile' && key !== 'mock') {
    env.EXPO_PUBLIC_ENABLE_MOCK = 'false';
  } else if (app.folderName === 'miniapp') {
    env.TARO_APP_ENABLE_MOCK = key === 'mock' ? 'true' : 'false';
  }

  // 自定义 API 地址
  if (key === 'realCustom') {
    env.API_BASE_URL = await input({
      message: MESSAGES.customApiUrlPrompt,
      default: 'http://localhost:3000/api',
    });
    if (app.folderName === 'web') {
      env.VITE_API_BASE_URL = env.API_BASE_URL;
      delete env.API_BASE_URL;
    }
  }

  return env;
}

function resolvePackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const preferred = [];

  if (userAgent.startsWith('pnpm/')) {
    preferred.push('pnpm');
  }

  if (userAgent.startsWith('npm/')) {
    preferred.push('npm');
  }

  preferred.push('pnpm', 'npm');

  for (const manager of [...new Set(preferred)]) {
    const probe = spawnSync(manager, ['--version'], { stdio: 'ignore' });

    if (probe.status === 0) {
      return manager;
    }
  }

  throw new Error('未找到可用的包管理器，请先安装 pnpm 或 npm。');
}

function buildRunArgs(scriptName) {
  return ['run', scriptName];
}

async function runScript(app, scriptName, extraEnv) {
  const packageManager = resolvePackageManager();
  const args = buildRunArgs(scriptName);

  const env = { ...process.env, ...extraEnv };
  console.log(`\n> ${packageManager} ${args.join(' ')}\n`);

  await new Promise((resolve, reject) => {
    const child = spawn(packageManager, args, {
      cwd: app.directory,
      env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0 || signal !== null) {
        resolve(); // 正常退出或被信号终止（Ctrl+C）
        return;
      }

      reject(new Error(`脚本执行失败，退出码: ${code}`));
    });
  });
}

async function chooseScript(app) {
  if (app.scripts.length === 0) {
    console.log(`\n${MESSAGES.noScripts}\n`);
    return null;
  }

  const choices = sortScripts(app.scripts).map(formatScriptChoice);
  choices.push({ name: MESSAGES.back, value: null });

  return select({
    message: MESSAGES.scriptPrompt(app.folderName),
    pageSize: Math.min(choices.length, 12),
    choices,
  });
}

async function chooseApp(apps) {
  return select({
    message: MESSAGES.packagePrompt,
    pageSize: Math.min(apps.length + 1, 10),
    choices: [
      ...apps.map((app) => ({
        name: getAppLabel(app),
        value: app,
      })),
      { name: MESSAGES.cancel, value: null },
    ],
  });
}

async function main() {
  const apps = await loadApps();

  if (apps.length === 0) {
    throw new Error(MESSAGES.noApps);
  }

  const [requestedAppName, requestedScriptName] = process.argv.slice(2);
  const requestedApp = resolveRequestedApp(apps, requestedAppName);

  if (requestedAppName && !requestedApp) {
    throw new Error(`未找到应用包: ${requestedAppName}`);
  }

  if (requestedApp && requestedScriptName) {
    const script = requestedApp.scripts.find((item) => item.name === requestedScriptName);

    if (!script) {
      throw new Error(`应用包 ${requestedApp.folderName} 中不存在脚本: ${requestedScriptName}`);
    }

    const extraEnv = await chooseDataMode(requestedApp, script.name);
    await runScript(requestedApp, script.name, extraEnv);
    return;
  }

  let selectedApp = requestedApp ?? null;

  while (true) {
    if (!selectedApp) {
      const app = await chooseApp(apps);
      if (!app) {
        console.log('\n已取消。');
        process.exit(0);
      }
      selectedApp = app;
    }

    const selectedScript = await chooseScript(selectedApp);

    if (!selectedScript) {
      selectedApp = null;
      continue;
    }

    let extraEnv = await chooseDataMode(selectedApp, selectedScript.name);
    if (extraEnv === BACK) {
      // 返回重新选择脚本
      continue;
    }
    let isRealApi = extraEnv !== null && Object.keys(extraEnv).length > 0;

    while (true) {
      const dataMode = isRealApi ? '联调接口' : '模拟数据';
      const action = await select({
        message: MESSAGES.runConfirm(selectedApp.folderName, selectedScript.name, dataMode),
        choices: [
          { name: `✅ 确认启动（${dataMode}）`, value: 'run' },
          { name: '🔄 切换数据模式', value: 'data' },
          { name: '📜 重新选择脚本', value: 'script' },
          { name: MESSAGES.cancel, value: 'cancel' },
        ],
      });

      if (action === 'run') {
        await runScript(selectedApp, selectedScript.name, extraEnv);
        return;
      }

      if (action === 'data') {
        extraEnv = await chooseDataMode(selectedApp, selectedScript.name);
        if (extraEnv === BACK) {
          // 返回确认菜单
          continue;
        }
        isRealApi = extraEnv !== null && Object.keys(extraEnv).length > 0;
        continue;
      }

      if (action === 'script') {
        selectedApp = null;
        break;
      }

      // cancel
      console.log('\n已取消。');
      process.exit(0);
    }
  }
}

main().catch((error) => {
  if (error?.name === 'ExitPromptError') {
    console.log('\n已取消。');
    process.exit(0);
  }

  console.error(`\n[run-start] ${error.message}`);
  process.exit(1);
});
