// ===================================================================
// 🐱 ねこ100枚 自動生成スクリプト
// Gemini 2.5 Flash Image (Nano Banana) を使用
// ===================================================================
//
// 【セットアップ】
// 1. このファイルと prompts.json を同じフォルダに置く
// 2. npm install @google/genai dotenv
// 3. 同じフォルダに .env を作り、以下を記載:
//      GEMINI_API_KEY=your-api-key-here
//    ↑ https://aistudio.google.com/ で取得
// 4. 実行: node generate-cats.mjs
//
// 【特徴】
// - 既にあるファイルはスキップ（途中再開OK）
// - 3回までリトライ
// - レート制限対応（3秒間隔）
// - 失敗はfailed.txtに記録
// ===================================================================

import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import "dotenv/config";

// ===== 設定 =====
const OUTPUT_DIR = "./public/cats"; // 出力先
const PROMPTS_FILE = "./prompts.json";
const FAILED_LOG = "./failed.txt";
const DELAY_MS = 3000; // リクエスト間隔
const MAX_RETRIES = 3;
const MODEL = "gemini-2.5-flash-image"; // Nano Banana
const COST_PER_IMAGE = 0.039; // USD

// ===== 準備 =====
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ .envにGEMINI_API_KEYを設定してください");
  console.error("   取得: https://aistudio.google.com/");
  process.exit(1);
}

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`📁 作成: ${OUTPUT_DIR}`);
}

if (!fs.existsSync(PROMPTS_FILE)) {
  console.error(`❌ ${PROMPTS_FILE} が見つかりません`);
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const prompts = JSON.parse(fs.readFileSync(PROMPTS_FILE, "utf-8"));

// ===== ユーティリティ =====
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOneImage(prompt) {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const parts = response?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }
  throw new Error("画像データがレスポンスに含まれていません（安全性フィルター等）");
}

async function generateWithRetry(item) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const buf = await generateOneImage(item.prompt);
      return buf;
    } catch (err) {
      const msg = err?.message ?? String(err);
      console.log(`   ⚠️  試行${attempt}/${MAX_RETRIES} 失敗: ${msg.slice(0, 80)}`);
      if (attempt < MAX_RETRIES) await sleep(5000);
      else throw err;
    }
  }
}

// ===== メイン処理 =====
async function main() {
  console.log("🐱 ねこ100枚 自動生成スクリプト");
  console.log("=".repeat(60));
  console.log(`📝 モデル: ${MODEL}`);
  console.log(`📂 出力先: ${OUTPUT_DIR}`);
  console.log(`💰 コスト: $${COST_PER_IMAGE}/枚`);
  console.log("=".repeat(60));

  let success = 0;
  let skipped = 0;
  let failed = 0;
  const failedList = [];

  for (const item of prompts) {
    const filepath = path.join(OUTPUT_DIR, item.filename);
    const tag = `[${String(item.id).padStart(3, "0")}/100]`;

    // 既存ファイルはスキップ
    if (fs.existsSync(filepath)) {
      console.log(`${tag} ${item.filename} ⏭️  スキップ（既存）`);
      skipped++;
      continue;
    }

    console.log(`${tag} ${item.filename} 🎨 生成中...`);
    const start = Date.now();

    try {
      const buf = await generateWithRetry(item);
      fs.writeFileSync(filepath, buf);
      const elapsed = Date.now() - start;
      console.log(`${tag} ${item.filename} ✅ 保存完了 (${elapsed}ms)`);
      success++;
    } catch (err) {
      console.log(`${tag} ${item.filename} ❌ 失敗: ${err.message}`);
      failed++;
      failedList.push(`${item.filename}\t${err.message}\t${item.prompt}`);
    }

    // レート制限対策
    if (item.id < prompts.length) {
      await sleep(DELAY_MS);
    }
  }

  // ===== サマリー =====
  console.log("\n" + "=".repeat(60));
  console.log("📊 生成結果");
  console.log("=".repeat(60));
  console.log(`✅ 成功:   ${success}枚`);
  console.log(`⏭️  スキップ: ${skipped}枚`);
  console.log(`❌ 失敗:   ${failed}枚`);
  console.log(`💰 コスト概算: $${(success * COST_PER_IMAGE).toFixed(2)} (約¥${Math.round(success * COST_PER_IMAGE * 150)})`);

  if (failedList.length > 0) {
    fs.writeFileSync(FAILED_LOG, failedList.join("\n"), "utf-8");
    console.log(`\n⚠️  失敗リストを ${FAILED_LOG} に書き出しました`);
    console.log("   再実行すれば失敗分だけ再度生成されます");
  } else if (success > 0) {
    console.log("\n🎉 全ての画像が正常に生成されました！");
  }
}

main().catch((err) => {
  console.error("\n💥 致命的なエラー:", err);
  process.exit(1);
});
