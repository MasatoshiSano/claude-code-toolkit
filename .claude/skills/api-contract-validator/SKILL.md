---
name: api-contract-validator
description:
  Validate API contracts between frontend and backend with OpenAPI/Swagger
version: 1.0.0
author: Claude Code Toolkit
license: MIT
tags:
  - api
  - openapi
  - swagger
  - contract
  - typescript
  - validation
requires:
  - node>=16
  - openapi-generator-cli
---

# API Contract Validator Agent Skill

## Purpose

このスキルは、フロントエンドとバックエンド間のAPIコントラクトを検証し、型安全性を保証します。OpenAPI/Swagger仕様の自動生成、破壊的変更の検出、型安全なクライアントコード生成を行います。

## When to Use

- 新しいAPI開発時
- API仕様の変更前
- フロントエンドとバックエンドの統合前
- CI/CDパイプラインでの自動検証
- プルリクエストレビュー時

## Architecture

```
scripts/
├── generate-openapi.js        # OpenAPI仕様生成
├── validate-contract.js       # コントラクト検証
├── breaking-change-detector.js # 破壊的変更検出
├── generate-client.js         # クライアントコード生成
└── mock-server-generator.js   # モックサーバー生成

templates/
├── openapi-template.yaml      # OpenAPIテンプレート
├── api-client-template.ts     # TypeScriptクライアント
└── api-types-template.ts      # 型定義テンプレート

validators/
├── request-validator.js       # リクエスト検証
├── response-validator.js      # レスポンス検証
└── schema-validator.js        # スキーマ検証
```

## Instructions

### Phase 1: OpenAPI Specification Generation

#### 1.1 バックエンドコードからの自動生成

**Express + TypeScript:**

```typescript
// src/api/users.ts
import { z } from 'zod';

// Zodスキーマで型定義
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.date()
});

export type User = z.infer<typeof UserSchema>;

// APIエンドポイント
app.get('/api/users/:id', async (req, res) => {
  // 自動的にOpenAPI仕様生成
});
```

**生成されるOpenAPI仕様:**

```yaml
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /api/users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
components:
  schemas:
    User:
      type: object
      required:
        - id
        - name
        - email
        - role
        - createdAt
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
          minLength: 1
          maxLength: 100
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, user, guest]
        createdAt:
          type: string
          format: date-time
```

#### 1.2 既存APIからの逆生成

```bash
# 実行中のAPIサーバーから仕様を抽出
agent api-contract-validator generate \
  --from=server \
  --url=http://localhost:3000 \
  --output=openapi.yaml

# 出力:
# ✓ Discovered 24 endpoints
# ✓ Generated OpenAPI 3.0 specification
# ✓ Saved to openapi.yaml
#
# Endpoints:
# - GET /api/users
# - GET /api/users/{id}
# - POST /api/users
# - PUT /api/users/{id}
# - DELETE /api/users/{id}
# ... (19 more)
```

### Phase 2: Contract Validation

#### 2.1 リクエスト/レスポンス検証

```javascript
// validators/request-validator.js
async function validateRequest(spec, endpoint, method, request) {
  const operation = spec.paths[endpoint][method];
  const errors = [];

  // パラメータ検証
  if (operation.parameters) {
    for (const param of operation.parameters) {
      const value = getParamValue(request, param);
      if (param.required && !value) {
        errors.push({
          type: 'missing_parameter',
          parameter: param.name,
          location: param.in
        });
      }
      if (value && !validateType(value, param.schema)) {
        errors.push({
          type: 'invalid_parameter_type',
          parameter: param.name,
          expected: param.schema.type,
          actual: typeof value
        });
      }
    }
  }

  // リクエストボディ検証
  if (operation.requestBody) {
    const schema = operation.requestBody.content['application/json'].schema;
    const bodyErrors = validateSchema(request.body, schema);
    errors.push(...bodyErrors);
  }

  return { valid: errors.length === 0, errors };
}
```

**実行例:**

```bash
# エンドポイントをテスト
agent api-contract-validator test \
  --spec=openapi.yaml \
  --endpoint=/api/users \
  --method=POST \
  --data='{"name":"John","email":"invalid"}'

# 出力:
# ❌ Validation Failed
#
# Errors:
# 1. Invalid email format
#    - Field: email
#    - Expected: valid email address
#    - Actual: "invalid"
#
# 2. Missing required field
#    - Field: role
#    - Required: true
```

#### 2.2 実装とコントラクトの整合性検証

```bash
# 実装がコントラクトに準拠しているか検証
agent api-contract-validator validate \
  --spec=openapi.yaml \
  --impl=./src/api

# 出力:
# Validating 24 endpoints...
#
# ✓ GET /api/users (200, 404)
# ✓ GET /api/users/{id} (200, 404)
# ❌ POST /api/users
#    Issue: Response missing 'createdAt' field (required in spec)
#    File: src/api/users.ts:45
#
# ❌ PUT /api/users/{id}
#    Issue: Accepts extra field 'metadata' (not in spec)
#    File: src/api/users.ts:67
#
# Summary:
# - Passed: 22/24
# - Failed: 2/24
# - Warnings: 3
```

### Phase 3: Breaking Change Detection

#### 3.1 バージョン間の差分検出

```bash
# 仕様の差分を確認
agent api-contract-validator diff \
  --old=openapi-v1.yaml \
  --new=openapi-v2.yaml

# 出力:
# 🚨 Breaking Changes Detected (5)
#
# 1. REMOVED ENDPOINT
#    DELETE /api/users/{id}
#    Impact: HIGH
#    Reason: Existing clients depend on this endpoint
#
# 2. FIELD TYPE CHANGED
#    POST /api/orders
#    Field: amount
#    Change: string → number
#    Impact: HIGH
#    Reason: Incompatible type change
#
# 3. REQUIRED FIELD ADDED
#    POST /api/users
#    Field: phoneNumber
#    Impact: MEDIUM
#    Reason: Existing clients will fail validation
#
# 4. FIELD REMOVED
#    GET /api/users/{id}
#    Field: status (required)
#    Impact: HIGH
#    Reason: Clients expect this field
#
# 5. ENUM VALUE REMOVED
#    GET /api/orders
#    Field: status
#    Removed: 'pending'
#    Impact: MEDIUM
#    Reason: Existing data may have this value
#
# ✅ Backward Compatible Changes (8)
#
# 1. OPTIONAL FIELD ADDED
#    GET /api/users/{id}
#    Field: avatar (optional)
#    Impact: NONE
#
# 2. NEW ENDPOINT ADDED
#    GET /api/products
#    Impact: NONE
#
# ... (6 more)
#
# Recommendation: ❌ DO NOT DEPLOY
# Breaking changes require new API version (v3)
```

#### 3.2 マイグレーション計画

```markdown
# API Migration Plan: v1 → v2

## Breaking Changes

### 1. Remove DELETE /api/users/{id}

**Impact**: HIGH **Affected Clients**: Web App, Mobile App

**Migration Steps**:

1. Mark endpoint as deprecated in v1
2. Add warning in v1 responses
3. Provide alternative: POST /api/users/{id}/deactivate
4. Monitor usage for 30 days
5. Remove in v2 after usage drops to 0

**Timeline**: 6 weeks

### 2. Change 'amount' type: string → number

**Impact**: HIGH **Affected Clients**: All

**Migration Steps**:

1. Support both types in v1.5 (transition version)
2. Update client code to use number
3. Deploy updated clients
4. Enforce number-only in v2

**Timeline**: 4 weeks
```

### Phase 4: Type-Safe Client Generation

#### 4.1 TypeScript クライアント生成

```bash
# TypeScriptクライアントを生成
agent api-contract-validator generate-client \
  --spec=openapi.yaml \
  --lang=typescript \
  --output=./src/api/client

# 出力:
# ✓ Generated TypeScript client
#   - Types: src/api/client/types.ts
#   - API Client: src/api/client/api.ts
#   - Models: src/api/client/models/
#
# Usage:
# import { ApiClient, User } from './api/client';
# const client = new ApiClient({ baseUrl: 'https://api.example.com' });
# const user = await client.users.getById('123');
```

**生成されたクライアントコード:**

```typescript
// src/api/client/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// src/api/client/api.ts
export class ApiClient {
  constructor(private config: ApiConfig) {}

  users = {
    getById: async (id: string): Promise<User> => {
      const response = await this.request<User>('GET', `/api/users/${id}`);
      return response;
    },

    create: async (data: CreateUserRequest): Promise<User> => {
      const response = await this.request<User>('POST', '/api/users', data);
      return response;
    }

    // ... other methods
  };

  private async request<T>(
    method: string,
    path: string,
    data?: unknown
  ): Promise<T> {
    // 型安全なHTTPリクエスト実装
    // - 自動シリアライゼーション/デシリアライゼーション
    // - エラーハンドリング
    // - リトライロジック
  }
}
```

#### 4.2 他言語サポート

```bash
# Python クライアント生成
agent api-contract-validator generate-client \
  --spec=openapi.yaml \
  --lang=python \
  --output=./api_client

# Go クライアント生成
agent api-contract-validator generate-client \
  --spec=openapi.yaml \
  --lang=go \
  --output=./api_client
```

### Phase 5: Mock Server Generation

#### 5.1 開発用モックサーバー

```bash
# モックサーバーを起動
agent api-contract-validator mock-server \
  --spec=openapi.yaml \
  --port=3001

# 出力:
# ✓ Mock server started
# URL: http://localhost:3001
#
# Available endpoints:
# - GET /api/users
# - GET /api/users/{id}
# - POST /api/users
# - PUT /api/users/{id}
# - DELETE /api/users/{id}
#
# All endpoints return realistic mock data based on OpenAPI schema
```

**モックレスポンス例:**

```json
// GET /api/users/123
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "createdAt": "2025-01-16T10:30:00Z"
}
```

### Phase 6: CI/CD Integration

#### 6.1 GitHub Actions

```yaml
# .github/workflows/api-contract.yml
name: API Contract Validation

on:
  pull_request:
    paths:
      - 'src/api/**'
      - 'openapi.yaml'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Generate OpenAPI spec from code
        run: |
          npm run generate:openapi

      - name: Detect breaking changes
        run: |
          git fetch origin main
          git show origin/main:openapi.yaml > openapi-main.yaml
          npm run api:breaking-changes -- \
            --old=openapi-main.yaml \
            --new=openapi.yaml \
            --fail-on-breaking

      - name: Validate implementation
        run: |
          npm run api:validate

      - name: Generate client
        run: |
          npm run api:generate-client

      - name: Comment PR with results
        uses: actions/github-script@v6
        with:
          script: |
            const results = require('./api-validation-results.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: formatResults(results)
            });
```

## Error Handling

### Level 1: Recoverable Errors

- **仕様ファイルが見つからない**: デフォルトテンプレートから生成
- **一部のエンドポイントが実装されていない**: 警告のみ

### Level 2: User Intervention Required

- **破壊的変更検出**: デプロイをブロック、マイグレーション計画を要求
- **型の不一致**: 修正方法を提示

### Level 3: Critical Errors

- **必須フィールドが欠落**: エラーを返し、修正を強制
- **無効なOpenAPI仕様**: 仕様の修正を要求

## Performance Notes

- **スキーマキャッシング**: 頻繁に使用するスキーマをキャッシュ
- **並列検証**: 複数エンドポイントを並列で検証
- **差分検出の最適化**: 変更されたエンドポイントのみチェック

## Dependencies

- Node.js >= 16
- openapi-generator-cli
- ajv (JSON Schema validation)

## Best Practices

1. **OpenAPI-first開発**: APIを実装する前に仕様を定義
2. **自動生成**: 手書きではなく、コードから仕様を生成
3. **バージョン管理**: API仕様もGitで管理
4. **CI/CD統合**: 破壊的変更を自動検出
5. **ドキュメント生成**: Swagger UIで常に最新のドキュメントを提供

## Related Skills

- `e2e-test-generator`: APIコントラクトからE2Eテストを生成
- `code-quality-suite`: APIコードの品質チェック

## Examples

### ✅ Good Example: No Breaking Changes

```bash
Input: agent api-contract-validator diff --old=v1.yaml --new=v2.yaml

Output:
✓ No breaking changes detected

Backward compatible changes (3):
1. Added optional field: User.avatar
2. New endpoint: GET /api/products
3. Added response code: 201 for POST /api/users

Recommendation: ✅ Safe to deploy
```

### ❌ Bad Example: Breaking Change

```bash
Input: agent api-contract-validator diff --old=v1.yaml --new=v2.yaml

Output:
❌ Breaking changes detected

1. REMOVED: DELETE /api/users/{id}
   Impact: HIGH
   Affected: 2 client applications

Recommendation: ❌ DO NOT DEPLOY
Create API v3 or provide migration path
```

## Notes

- OpenAPI仕様は常にコードと同期させる
- 破壊的変更は新しいAPIバージョンで行う
- モックサーバーでフロントエンド開発を加速
