# neko-typing — プロジェクト引き継ぎメモ

子供向けローマ字タイピングゲーム。ねこを集めて「おうち」で眺めて楽しむ、ねこあつめ風のゲーミフィケーション付き。

## スタック・公開先

- **Vite 5 + React** (単一ページ、ルーターなし)
- **GitHub Pages** にデプロイ（`.github/workflows/` に Actions ワークフロー）
- **本番URL**: https://attraction-llc.github.io/neko-typing/
- **リポジトリ**: https://github.com/attraction-llc/neko-typing
- **Vite base**: `/neko-typing/` (vite.config.js で設定)
  - 公開ファイル (public/) を参照する際は必ず `${import.meta.env.BASE_URL}...` を使う。ハードコードした `/cats/xxx.png` は prod で 404 になる。

## 主要ファイル

| パス | 役割 |
|---|---|
| `src/App.jsx` | 単一ファイルでアプリ全体。`CATS`(100), `WORDS`(Lv1-4), `HOUSES`, `CatFace`, `MiniCat`, `HouseView`, `GachaModal`, メインコンポーネント `NekoTyping` |
| `public/cats/001-100.png` | 猫画像（rembgで背景透過済み）。App.jsx が `img` で参照 |
| `public/cats/originals/` | 透過前の元画像バックアップ（100枚） |
| `remove_bg.py` | rembg で 001-100.png の白背景を透過化。originals/ にバックアップしてから上書き |
| `generate-cats.mjs` | Gemini API で猫画像を生成するスクリプト（`.env` の `GEMINI_API_KEY` を使用） |
| `prompts.json` | generate-cats.mjs 用の画像生成プロンプト |
| `vite.config.js` | base: `/neko-typing/` |
| `neko-typing.jsx` | 初期プロトタイプの名残と思われる（App.jsx が本体） |

## 開発・ビルド

```bash
npm run dev        # http://localhost:5173/neko-typing/
npm run build      # → dist/
```

## ゲーム仕様ダイジェスト

- **猫データ**: `CATS` 配列 100 体。`{ id, name, r, c, d, ec, p, img, ...t/s (optional) }`。レア度 `r` は ★〜★★★★★。`img` は `.map()` で `BASE_URL + cats/NNN.png` を自動注入。
- **レベル**: Lv1 (1文字) / Lv2 (2〜3文字) / Lv3 (単語) / Lv4 (長い単語)。
- **XP/ガチャ**: 正解で `level*5` XP、5コンボで +5。50XP で 1 ガチャ。確率: ★★★★★ 2% / ★★★★ 6% / ★★★ 14% / ★★ 28% / ★ 50%。
- **永続化**: localStorage、キー接頭辞 `nekoTyping_v1_`、対象: `level, xp, totalXp, collection, correct, miss`。
- **ホットキー**: Space で単語スキップ（コンボリセット）、Esc でタイトルへ。
- **画面**: title / game / zukan / house。`{screen==="house"&&<HouseView.../>}` 方式。

## おうち（HouseView）の挙動

2026-04 に全面リニューアル:
- **アクション 8 種**: idle / sleep / play / walk / groom / chase / sit / stretch。各猫 5〜15 秒で切替、初期 `nextChangeAt` をランダムにスタガー。
- **移動**: walk は水平のみ (vx ±0.8)、chase は斜め移動 (|v|≈2.6)。壁で反射、`facing` でスプライト左右反転。
- **境界**: `X_MIN=18, X_MAX=282, FLOOR_TOP=138, FLOOR_BOT=188` (SVG viewBox 300x200)。
- **感情アイコン**: 0.4%/tick でランダム絵文字を頭上に 1.5 秒ポップ (💕😴✨🐟❓🎵)。
- **クリック**: 吹き出しで鳴き声（にゃー！/にゃ〜ん/みゃお/ごろごろ/ぷるる）+ 名前・レア度、0.5 秒ジャンプ。3 回以上の連打でハート 5 個飛び散り。
- **ツールチップ**: `<title>` で猫名+レア度（ブラウザネイティブ、ホバー）。
- **時刻連動の窓景色**: `getTimeMode()`、6-17 時=day(太陽+雲), 17-19=sunset, それ以外=night(月+星)。窓の gradient と外側グラデも切替、60 秒ごとに再判定。
- **パフォーマンス**: `useRef` で猫状態をミュータブル管理、`forceRender` で再レンダ誘発。100 匹 @ 10fps でも軽量。

## Python スクリプト実行時の注意（Windows）

Windows 標準コンソールは **cp932 (Shift-JIS)** のため、絵文字を含む `print()` が `UnicodeEncodeError` で落ちる。`remove_bg.py` は先頭で `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` している。新しい Python スクリプトを書くときも同様に対処。

rembg は初回実行で u2net モデル (~176MB) を `~/.u2net/` に自動DL。CPU 版で 100 枚 ≈ 数分。

## セキュリティ

- `.env` は `.gitignore` 済み。`GEMINI_API_KEY` を含むのでコミット厳禁。
- 過去に公開された可能性があるなら Gemini のキーをローテーションしておくこと。

## 最近の主要コミット

- `1fb8c4a` feat: SVG 猫を 100 PNG に差し替え、おうちをリッチアニメ化
- `46fbc78` feat: no-click typing, space/esc hotkeys, localStorage persistence
- `3c1b24f` ci: auto-enable Pages in configure-pages action
- `6a3f3ea` initial: neko-typing Vite + React app with GitHub Pages workflow

## 次にやりそうなこと（メモ）

- 未獲得猫のシルエット表示（ずかん）
- BGM / SE
- 実機での触り心地チェック（タップ判定、壁衝突の見た目）
- `public/cats/originals/` を別リポ or LFS に退避してリポサイズ削減
- `neko-typing.jsx` は App.jsx と重複していないか要確認（不要なら削除）
