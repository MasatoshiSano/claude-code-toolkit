# 🧹 Clean - コードフォーマット・整理・lint修正

## 概要
プロジェクト全体のコードを自動的にクリーンアップします。フォーマット、import整理、lintエラーの修正を行います。

## 実行内容

1. **コードフォーマット**
   - Prettier/ESLint での自動フォーマット
   - インデント、改行、スペースの統一
   - 言語別フォーマッターの実行

2. **Import整理**
   - 未使用importの削除
   - import文の並び替え
   - 重複importの統合

3. **Lintエラー修正**
   - 自動修正可能なlintエラーを修正
   - コード品質ルールの適用
   - 不要なコメント・空行の削除

4. **ファイル整理**
   - 空ファイルの削除
   - 一時ファイルのクリーンアップ
   - 不要なログファイル削除

## 対応言語・ツール
- JavaScript/TypeScript (ESLint, Prettier)
- Python (Black, isort, flake8)
- Go (gofmt, goimports)
- Rust (rustfmt)
- CSS/SCSS (Prettier)

## 使用方法
```
/clean
```

プロジェクト全体を自動的にクリーンアップし、統一されたコードスタイルを適用します。