#!/usr/bin/env node

import { confirm, select } from "@inquirer/prompts";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const APPS_DIR = path.join(ROOT_DIR, "apps");
const collator = new Intl.Collator("zh-CN", { numeric: true, sensitivity: "base" });

const MESSAGES = {
  noApps: "未在 apps 目录下找到可运行的应用包。",
  noScripts: "这个应用包里没有可运行的 scripts，请重新选择。",
  packagePrompt: "请选择要运行的应用包",
  scriptPrompt: (appName) => `请选择 ${appName} 的脚本命令`,
  runConfirm: (appName, scriptName) => `确认执行 ${appName} -> ${scriptName} 吗？`,
};

async function readJson(jsonPath) {
  const content = await fs.readFile(jsonPath, "utf8");
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
        const packageJsonPath = path.join(directory, "package.json");

        try {
          const packageJson = await readJson(packageJsonPath);
          return {
            description: packageJson.description ?? "",
            directory,
            folderName: entry.name,
            packageName: packageJson.name ?? entry.name,
            scripts: normalizeScripts(packageJson.scripts),
          };
        } catch (error) {
          if (error.code === "ENOENT") {
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

  return parts.join(" ");
}

function rankScript(scriptName) {
  if (scriptName === "start") {
    return 0;
  }

  if (scriptName.startsWith("dev")) {
    return 1;
  }

  if (scriptName.startsWith("build")) {
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

function resolvePackageManager() {
  const userAgent = process.env.npm_config_user_agent ?? "";
  const preferred = [];

  if (userAgent.startsWith("pnpm/")) {
    preferred.push("pnpm");
  }

  if (userAgent.startsWith("npm/")) {
    preferred.push("npm");
  }

  preferred.push("pnpm", "npm");

  for (const manager of [...new Set(preferred)]) {
    const probe = spawnSync(manager, ["--version"], { stdio: "ignore" });

    if (probe.status === 0) {
      return manager;
    }
  }

  throw new Error("未找到可用的包管理器，请先安装 pnpm 或 npm。");
}

function buildRunArgs(scriptName) {
  return ["run", scriptName];
}

async function runScript(app, scriptName) {
  const packageManager = resolvePackageManager();
  const args = buildRunArgs(scriptName);

  console.log(`\n> ${packageManager} ${args.join(" ")}\n`);

  await new Promise((resolve, reject) => {
    const child = spawn(packageManager, args, {
      cwd: app.directory,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
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
    pageSize: Math.min(apps.length, 10),
    choices: apps.map((app) => ({
      name: getAppLabel(app),
      value: app,
    })),
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

    await runScript(requestedApp, script.name);
    return;
  }

  let selectedApp = requestedApp ?? null;

  while (true) {
    selectedApp ??= await chooseApp(apps);

    const selectedScript = await chooseScript(selectedApp);

    if (!selectedScript) {
      selectedApp = null;
      continue;
    }

    const shouldRun = await confirm({
      default: true,
      message: MESSAGES.runConfirm(selectedApp.folderName, selectedScript.name),
    });

    if (!shouldRun) {
      continue;
    }

    await runScript(selectedApp, selectedScript.name);
    return;
  }
}

main().catch((error) => {
  if (error?.name === "ExitPromptError") {
    console.log("\n已取消。");
    process.exit(0);
  }

  console.error(`\n[run-start] ${error.message}`);
  process.exit(1);
});
