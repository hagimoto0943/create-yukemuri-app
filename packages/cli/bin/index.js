#!/usr/bin/env node
const { execSync } = require("child_process");
const fs = require("fs");
const readline = require("readline");

function printOnsenBanner() {
  const banner = [`
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
        #########################`  ,
  ].join("\n");

  console.log(banner);
  console.log();
}

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("SIGINT", () => {
    rl.close();
    process.exit(1);
  });

  const ask = (query) =>
    new Promise((resolve) => {
      rl.question(query, (answer) => resolve(answer.trim()));
    });

  const askInput = async (message, defaultValue) => {
    const prompt = defaultValue
      ? `${message} (default: ${defaultValue}): `
      : `${message}: `;
    const answer = await ask(prompt);
    return answer === "" ? defaultValue : answer;
  };

  const askList = async (message, choices, defaultIndex = 0) => {
    console.log(message);
    choices.forEach((choice, index) => {
      const marker = index === defaultIndex ? " (default)" : "";
      console.log(`  ${index + 1}. ${choice}${marker}`);
    });

    const prompt = `番号を入力してください [${defaultIndex + 1}]: `;
    while (true) {
      const answer = await ask(prompt);
      if (answer === "") {
        return choices[defaultIndex];
      }

      const index = parseInt(answer, 10);
      if (!Number.isNaN(index) && index >= 1 && index <= choices.length) {
        return choices[index - 1];
      }

      const directMatch = choices.find(
        (choice) => choice.toLowerCase() === answer.toLowerCase()
      );
      if (directMatch) {
        return directMatch;
      }

      console.log("選択肢の番号か名称を入力してください。");
    }
  };

  const askConfirm = async (message, defaultValue = true) => {
    const hint = defaultValue ? "Y/n" : "y/N";
    while (true) {
      const answer = await ask(`${message} (${hint}): `);
      if (answer === "") {
        return defaultValue;
      }

      if (/^(y|yes)$/i.test(answer)) {
        return true;
      }
      if (/^(n|no)$/i.test(answer)) {
        return false;
      }

      console.log("y / n で回答してください。");
    }
  };

  const close = () => rl.close();

  return { askInput, askList, askConfirm, close };
}

async function main() {
  printOnsenBanner();
  console.log("♨️  Welcome to yukemuri.js setup!");

  const prompt = createPrompt();
  const projectName = await prompt.askInput(
    "プロジェクト名は？",
    "my-yukemuri-app"
  );
  const framework = await prompt.askList("どのフレームワークを使いますか？", [
    "React",
    "Svelte",
  ]);
  const lang = await prompt.askList("言語は？", ["TypeScript", "JavaScript"]);
  const includeAPI = await prompt.askConfirm(
    "API / Auth モジュールを含めますか？",
    true
  );
  prompt.close();

  fs.mkdirSync(projectName, { recursive: true });
  process.chdir(projectName);

  console.log(`🚀 ${framework} プロジェクトを初期化中...`);

  const viteTemplate = framework === "React" ? "react" : "svelte";
  const langFlag = lang === "TypeScript" ? "-ts" : "";
  execSync(`yarn create vite . --template ${viteTemplate}${langFlag}`, {
    stdio: "inherit",
  });

  if (includeAPI) {
    console.log("🔧 API/Auth モジュールをセットアップ中...");
    fs.mkdirSync("packages/api", { recursive: true });
    fs.writeFileSync(
      "packages/api/index.ts",
      "export const hello = () => console.log('API ready!');"
    );
  }

  console.log(`
✅ yukemuri.js プロジェクトが完成しました！

👉 cd ${projectName}
👉 yarn install
👉 yarn dev
`);
}

main().catch((err) => {
  console.error("❌ エラー:", err);
});
