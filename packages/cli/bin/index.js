#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

function printOnsenBanner() {
  const banner = `
                  ##                   
          ##     ###      ##           
          ###    ###      ###           
        ###     ####    ###            
        ####    ####    ####           
        ###(    ####    ####          
          ###/    ####    ####         
    ,#    ####    /###     ###   #     
  ###      ###     ###     ###    ###  
###       ###     ####    ,##       ###
####       ##      ##,     ##        ###
  ####              #                ####
  #####*                         /##### 
    ##########/           (##########   
        #########################`;
  console.log(banner);
  console.log("♨️  Welcome to yukemuri.js setup!");
}

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const ask = (query) =>
    new Promise((resolve) => rl.question(query, (answer) => resolve(answer.trim())));

  const askInput = async (message, def) => {
    const res = await ask(`${message}${def ? ` (default: ${def})` : ""}: `);
    return res || def;
  };

  const askList = async (message, choices, defIndex = 0) => {
    console.log(message);
    choices.forEach((c, i) => console.log(`  ${i + 1}. ${c}${i === defIndex ? " (default)" : ""}`));
    while (true) {
      const res = await ask(`番号を入力してください [${defIndex + 1}]: `);
      if (!res) return choices[defIndex];
      const n = parseInt(res, 10);
      if (n >= 1 && n <= choices.length) return choices[n - 1];
      console.log("有効な番号を入力してください。");
    }
  };

  const askConfirm = async (msg, def = true) => {
    const hint = def ? "Y/n" : "y/N";
    while (true) {
      const res = (await ask(`${msg} (${hint}): `)).toLowerCase();
      if (!res) return def;
      if (/^y|yes$/.test(res)) return true;
      if (/^n|no$/.test(res)) return false;
      console.log("y / n で回答してください。");
    }
  };

  return { askInput, askList, askConfirm, close: () => rl.close() };
}

async function waitForFile(file, timeout = 10000) {
  const start = Date.now();
  while (!fs.existsSync(file)) {
    if (Date.now() - start > timeout) throw new Error(`Timeout waiting for ${file}`);
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function main() {
  printOnsenBanner();

  const prompt = createPrompt();
  const projectName = await prompt.askInput("プロジェクト名は？", "my-yukemuri-app");
  const framework = await prompt.askList("どのフレームワークを使いますか？", ["React", "Svelte"]);
  const lang = await prompt.askList("言語は？", ["TypeScript", "JavaScript"]);
  const includeApi = await prompt.askConfirm("API クライアント (@yukemuri/api) を追加しますか？", true);
  const includeAuth = includeApi
    ? await prompt.askConfirm("認証モジュール (@yukemuri/auth) を追加しますか？", true)
    : false;
  prompt.close();

  // --- プロジェクト作成 ---
  fs.mkdirSync(projectName, { recursive: true });
  process.chdir(projectName);

  console.log(`🚀 ${framework} プロジェクトを初期化中...`);
  const viteTemplate = framework === "React" ? "react" : "svelte";
  const langFlag = lang === "TypeScript" ? "-ts" : "";
  execSync(`yarn create vite . --template ${viteTemplate}${langFlag}`, { stdio: "inherit" });

  await waitForFile("package.json");

  if (includeApi) {
    console.log("🔧 API/Auth モジュールをセットアップ中...");
    const pkgs = ["@yukemuri/api"];
    if (includeAuth) pkgs.push("@yukemuri/auth");

    execSync(`yarnpkg add ${pkgs.join(" ")}`, { stdio: "inherit", cwd: process.cwd() });

    fs.mkdirSync("src/lib", { recursive: true });

    fs.writeFileSync(
      "src/lib/api.ts",
      `import { api } from "@yukemuri/api";\nexport default api;\n`
    );

    if (includeAuth) {
      fs.writeFileSync(
        "src/lib/auth.ts",
        `import { AuthManager } from "@yukemuri/auth";\nexport default AuthManager;\n`
      );
    }

    fs.writeFileSync(".env", "VITE_API_URL=http://localhost:3000\n");
  }

  console.log(`
✅ yukemuri.js プロジェクトが完成しました！

👉 cd ${projectName}
👉 yarn install
👉 yarn dev
`);
}

main().catch((err) => console.error("❌ エラー:", err));