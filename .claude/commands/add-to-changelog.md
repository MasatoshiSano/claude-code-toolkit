# 📝 Add to Changelog - 変更履歴の自動更新

## 概要
プロジェクトの変更内容を分析し、一貫性のあるフォーマットでCHANGELOG.mdを自動更新します。

## 機能

### 1. 変更内容の自動分析
- **Git commit**の解析
- **変更タイプ**の自動分類
- **影響範囲**の特定
- **重要度**の評価

### 2. 分類システム
- **✨ Added**: 新機能
- **🔧 Changed**: 既存機能の変更
- **🗑️ Deprecated**: 非推奨化
- **🔥 Removed**: 削除された機能
- **🐛 Fixed**: バグ修正
- **🔒 Security**: セキュリティ修正

### 3. フォーマット準拠
- **Keep a Changelog**形式
- **Semantic Versioning**対応
- **日付**自動挿入
- **リンク**自動生成

### 4. 内容の自動生成
- **ユーザー視点**の説明
- **Breaking Changes**の強調
- **Migration Guide**（必要時）
- **関連Issue/PR**のリンク

## 生成例

```markdown
# Changelog

## [2.1.0] - 2024-01-15

### ✨ Added
- ユーザー認証機能を追加
- ダッシュボードの新しいチャート表示
- APIレート制限機能

### 🔧 Changed
- データベース接続プールの最適化
- UI/UXの改善（ボタンデザイン変更）

### 🐛 Fixed
- ログイン時の間欠的なエラーを修正
- メモリリークの問題を解決

### 🔒 Security
- SQLインジェクション脆弱性を修正
- JWT トークンの検証強化

## [2.0.0] - 2024-01-01

### 🔥 Breaking Changes
- API v1の廃止
- 設定ファイル形式の変更

### Migration Guide
1. API v2への移行手順...
2. 設定ファイルの更新方法...
```

## 使用方法
```
/add-to-changelog [version] [options]
```

例：
- `/add-to-changelog` - 現在の変更を自動追加
- `/add-to-changelog 2.1.0` - 指定バージョンで追加
- `/add-to-changelog --since last-tag` - 最新タグ以降の変更
- `/add-to-changelog --breaking` - Breaking Changesを強調

## 自動化オプション
- **リリース時**の自動更新
- **PR マージ時**の自動追加
- **タグ作成時**の自動生成
- **定期的**な更新チェック