---
allowed-tools: Read, Write, Bash(command:*)
description: Validate API contracts between frontend and backend with OpenAPI/Swagger
---

## Context

- Target: $ARGUMENTS (例: "API仕様生成" または "コントラクト検証")
- Skill location: `.claude/skills/api-contract-validator/`

## Trigger Conditions (自動起動の条件)

このスキルは、以下のユーザーリクエストで自動的に起動されます：

- "API仕様を生成して"
- "OpenAPIドキュメントを作成"
- "フロント/バックの型を統一"
- "API破壊的変更をチェック"
- "型安全なAPIクライアント生成"
- "Swaggerドキュメント作成"
- "APIコントラクトを検証"

## Your task

### 1. ユーザーの意図を理解

以下のどの操作か判断：
- **OpenAPI生成**: APIルートからOpenAPI仕様を自動生成
- **コントラクト検証**: 破壊的変更の検出
- **クライアント生成**: TypeScript/Python/Goクライアント生成

### 2. OpenAPI生成の場合

```bash
cd .claude/skills/api-contract-validator
node scripts/generate-openapi.js
```

### 3. 破壊的変更検証の場合

```bash
cd .claude/skills/api-contract-validator
node scripts/validate-contract.js
```

### 4. クライアントコード生成の場合

```bash
cd .claude/skills/api-contract-validator
node scripts/generate-client.js --lang=typescript
```

### 5. 結果報告

**OpenAPI生成:**
- OpenAPI 3.0仕様ファイルのパス
- エンドポイント数
- Swagger UIのURL

**破壊的変更検証:**
- 互換性チェック結果
- 破壊的変更リスト（もしあれば）
- 推奨される移行手順

**クライアント生成:**
- 生成されたファイルのパス
- 使用方法の例

## Example Usage

**ユーザー:** "フロントエンドとバックエンドのAPI型を統一したい"

**Claude（このスキルを自動実行）:**
1. APIルートを自動スキャン
2. OpenAPI仕様を生成
3. TypeScriptクライアントコード生成
4. "型安全なAPIクライアントを生成しました: src/api/client.ts"

## Notes

- OpenAPI 3.0準拠
- 対応言語: TypeScript、Python、Go
- CI/CDに統合して破壊的変更を自動検出可能
