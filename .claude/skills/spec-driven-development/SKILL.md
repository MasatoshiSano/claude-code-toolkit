---
name: spec-driven-development
description: Complete specification-driven development workflow (Requirements → Design → Tasks)
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - specification
  - requirements
  - design
  - planning
  - workflow
requires:
  - node>=16
---

# Spec-Driven Development Agent Skill

## Purpose

このスキルは、要件定義→詳細設計→タスク分解の3段階のワークフローを統合し、
構造化された仕様駆動開発を実現します。

## When to Use

- 新しい機能の実装を開始する時
- プロジェクトの初期セットアップ時
- 複数のコンポーネントに影響する変更を計画する時
- 既存の仕様ドキュメントに新機能を追加する時

## Architecture

```
.tmp/
├── requirements.md    # Stage 1: 要件定義書
├── design.md         # Stage 2: 詳細設計書
└── tasks.md          # Stage 3: タスクリスト

scripts/
├── generate-requirements.js  # 要件定義生成
├── generate-design.js        # 設計書生成
├── generate-tasks.js         # タスク分解
└── merge-documents.js        # 既存ドキュメントとマージ
```

## Instructions

### Stage 1: Requirements Analysis

#### 1.1 環境準備
- `.tmp/` ディレクトリを作成（存在しない場合）
- 既存の`requirements.md`の有無を確認

#### 1.2 要件抽出
ユーザーの要求（`$ARGUMENTS`）から以下を抽出：
- **コア課題**: 解決すべき本質的な問題
- **暗黙的要件**: 明示されていないが必要な要件
- **エッジケース**: 境界条件や例外ケース
- **成功基準**: 完了の明確な定義

#### 1.3 ドキュメント生成

**新規作成の場合:**
`templates/requirements-template.md`を使用して以下を含む要件定義書を生成：

1. **目的**: プロジェクト全体の目的
2. **機能要件**:
   - 必須機能（チェックリスト形式）
   - オプション機能
3. **非機能要件**:
   - パフォーマンス
   - セキュリティ
   - 保守性
   - 互換性
4. **制約事項**:
   - 技術的制約
   - ビジネス制約
5. **成功基準**:
   - 完了の定義
   - 受け入れテスト
6. **想定されるリスク**
7. **今後の検討事項**
8. **改訂履歴**

**更新の場合:**
`scripts/merge-documents.js`を使用：
- 既存の`requirements.md`を読み込み
- 新機能を「2.1 必須機能」に追加（日付付き）
- 目的セクションを必要に応じて更新
- 非機能要件をマージ
- 成功基準を更新
- 改訂履歴に追記

#### 1.4 ユーザー承認
要件定義書を提示し、以下を確認：
- 要件の理解が正しいか
- 不足している要件はないか
- 次のステージ（設計）への進行許可

### Stage 2: Design Specification

#### 2.1 前提条件確認
- `.tmp/requirements.md`の存在を確認
- 要件定義書を読み込み、理解

#### 2.2 既存設計確認
- `.tmp/design.md`の有無を確認
- 既存の場合、アーキテクチャへの影響を分析

#### 2.3 設計書生成

**新規作成の場合:**
`templates/design-template.md`を使用して以下を含む設計書を生成：

1. **アーキテクチャ概要**:
   - システム構成図（ASCII/Mermaid）
   - 技術スタック
2. **コンポーネント設計**:
   - コンポーネント一覧（表形式）
   - 各コンポーネントの詳細設計
3. **データフロー**:
   - データフロー図
   - データ変換ロジック
4. **APIインターフェース**:
   - 内部API定義
   - 外部API定義
5. **エラーハンドリング**:
   - エラー分類
   - エラー通知戦略
6. **セキュリティ設計**:
   - 認証・認可
   - データ保護
7. **テスト戦略**:
   - 単体テスト
   - 統合テスト
8. **パフォーマンス最適化**
9. **デプロイメント**
10. **実装上の注意事項**
11. **改訂履歴**

**更新の場合:**
`scripts/merge-documents.js`を使用：
- システム構成図を更新（新コンポーネント反映）
- コンポーネント一覧に新規追加（日付付き）
- 各コンポーネントの詳細設計を追記
- データフローを更新（影響がある場合）
- 依存関係を検証・更新
- 既存コンポーネントへの影響を明記
- 改訂履歴に追記

#### 2.4 ユーザー承認
設計書を提示し、以下を確認：
- 技術的なフィードバック
- アーキテクチャの承認
- 次のステージ（タスク分解）への進行許可

### Stage 3: Task Breakdown

#### 3.1 前提条件確認
- `.tmp/requirements.md`と`.tmp/design.md`の存在を確認
- 両方を読み込み、理解

#### 3.2 タスク抽出
設計書から実装タスクを抽出：
- Phase 1: 準備・調査
- Phase 2: 実装
- Phase 3: 検証・テスト
- Phase 4: 仕上げ

各タスクには以下を含む：
- 具体的な作業項目（チェックリスト）
- 完了条件（明確で測定可能）
- 依存関係
- 推定時間（1-4時間のコミットサイズ）

#### 3.3 タスクリスト生成

**新規作成の場合:**
`templates/tasks-template.md`を使用：

```markdown
# タスクリスト

## 🚧 進行中の機能

### [機能名] - YYYY-MM-DD

#### 概要
- 総タスク数: [数]
- 推定作業時間: [時間/日数]
- 優先度: [高/中/低]

#### タスク一覧
[Phaseごとにタスクを整理]

#### 実装順序
[依存関係を考慮した実行順序]

#### リスクと対策
[特定されたリスク]

## ✅ 完了した機能
(完了した機能はここに移動)
```

**更新の場合:**
- 既存の`tasks.md`を読み込み
- 「🚧 進行中の機能」セクションに新機能を追加
- 既存の進行中機能はそのまま保持
- 完了した機能セクションは変更しない

#### 3.4 ユーザー承認
タスクリストを提示し、以下を確認：
- 実装順序の説明
- クリティカルパスの強調
- 実装開始の承認

### Stage 4: Completion Report

全ステージ完了後、以下をサマリー：
- 生成されたドキュメント一覧
- 各ドキュメントの配置場所
- 次のアクション（実装開始）の案内

## Examples

### ✅ Good Example 1: New Feature

```bash
# ユーザー認証機能の仕様作成
Input: "Implement user authentication with email/password and OAuth2"

Output:
- .tmp/requirements.md: 認証要件（必須機能、セキュリティ要件、成功基準）
- .tmp/design.md: 認証アーキテクチャ（コンポーネント、API、セキュリティ設計）
- .tmp/tasks.md: 実装タスク（Phase 1-4、20タスク、推定30時間）
```

### ✅ Good Example 2: Incremental Addition

```bash
# 既存プロジェクトに新機能追加
Existing: requirements.md, design.md, tasks.md (User profile feature)
Input: "Add avatar upload functionality"

Output:
- requirements.md: 「アバターアップロード機能」を2.1に追加、改訂履歴更新
- design.md: ImageUploadComponentを追加、既存UserProfileComponentとの連携を明記
- tasks.md: 「アバターアップロード」を進行中の機能に追加
```

### ❌ Bad Example 1: Skipping Stages

```bash
# 要件定義をスキップして設計から開始
Input: "Design a caching system"

Problem: 要件が明確でないため、過剰設計や不足設計のリスク
Solution: 必ずStage 1から開始し、キャッシュの目的・要件を明確化
```

### ❌ Bad Example 2: Overly Generic Tasks

```bash
# タスクが曖昧
Task: "Implement authentication"

Problem: 大きすぎて完了条件が不明確、推定時間が不正確
Solution: 細分化（例: "Setup Passport.js", "Create login endpoint", "Add JWT generation"）
```

## Error Handling

### Level 1: Recoverable Errors

- **要件が不明確**: ユーザーに質問して明確化
- **既存ドキュメントの不整合**: 矛盾を指摘し、修正方針を提案

### Level 2: User Intervention Required

- **requirements.mdがないのにdesignを実行**: Stage 1の実行を促す
- **design.mdがないのにtasksを実行**: Stage 2の実行を促す
- **ユーザー承認なし**: 各ステージで明示的な承認を要求

### Level 3: Critical Errors

- **.tmpディレクトリの書き込み権限なし**: エラーメッセージを表示、権限確認を要求
- **ドキュメントが破損**: バックアップからの復元を提案

## Performance Notes

- **大規模プロジェクト**: 段階的な実行を推奨（一度に全機能ではなく、機能ごと）
- **既存ドキュメント大**: マージ時は差分のみを処理、全体を再生成しない
- **並列実行**: requirements/design/tasksは依存関係があるため、必ず順次実行

## Dependencies

- Node.js >= 16 (スクリプト実行用)
- Write権限（.tmpディレクトリへの書き込み）

## Best Practices

1. **各ステージでユーザー承認を得る**: 自動で次に進まない
2. **改訂履歴を必ず記録**: ドキュメントの変更を追跡可能に
3. **既存ドキュメントを尊重**: 上書きではなく、マージで更新
4. **タスクはコミットサイズ**: 1-4時間で完了可能な粒度
5. **依存関係を明確に**: タスク実行順序を論理的に

## Related Skills

- `/commit`: タスク完了後のコミット作成
- `/create-pr`: 実装完了後のプルリクエスト作成
- `/check`: 実装中のコード品質チェック

## Notes

- このスキルは計画フェーズに特化。実装自体は別途行う
- `.tmp/`ディレクトリは一時的な作業場所。最終的にはドキュメント化推奨
- 複雑な機能は段階的に仕様化（一度に全てを定義しない）
