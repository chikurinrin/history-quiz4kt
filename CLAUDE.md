# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

JavaScript と HTML で構成する複数ファイル構成のWebツール群。バックエンドなし、ブラウザで直接開くスタティックなWebアプリ。

## ディレクトリ構成（想定）

```
CLD学習/
├── CLAUDE.md
├── index.html          # トップページ / ツール一覧
├── tools/              # 各ツールのディレクトリ
│   └── <tool-name>/
│       ├── index.html
│       ├── style.css
│       └── script.js
└── shared/             # 共通リソース
    ├── style.css
    └── utils.js
```

## 開発・確認方法

ビルドツール不要。HTMLファイルをブラウザで直接開くか、ローカルサーバーを使う。

**ローカルサーバー起動（推奨）:**
```powershell
# Python がある場合
python -m http.server 8080

# Node.js がある場合
npx serve .
```

ブラウザで `http://localhost:8080` を開いて確認する。

## コーディング方針

- バニラJS優先。ライブラリが必要な場合はCDN経由で読み込む（`package.json` / `node_modules` は使わない）
- ES Modules（`type="module"`）を使ってよい。ただしローカルファイル直接開き（`file://`）では動かないため、ローカルサーバー経由で確認すること
- CSSはツールごとに個別ファイル。共通スタイルは `shared/style.css` にまとめる
- 外部APIを呼ぶ場合はCORSに注意し、ブラウザ側から直接叩けるエンドポイントかを確認する
