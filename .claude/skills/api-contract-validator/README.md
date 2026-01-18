# API Contract Validator

Validate API contracts between frontend and backend with OpenAPI/Swagger specifications.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Related Documentation](#related-documentation)

## Overview

**Status**: 🚧 Planned (Phase 2 - Q2 2026)
**Supported Tools**: OpenAPI 3.0, Swagger 2.0, TypeScript, Python, Go

This skill validates API contracts between frontend and backend services, automatically detects breaking changes, and generates type-safe client code across multiple languages.

## ✨ Features

### OpenAPI/Swagger Support

- ✅ Generate OpenAPI 3.0 specifications from code
- ✅ Extract specs from running API servers
- ✅ Support Swagger 2.0 migration
- ✅ Auto-sync with backend implementation

### Contract Validation

- ✅ Request/response schema validation
- ✅ Parameter type checking
- ✅ Endpoint existence verification
- ✅ Real-time validation during development

### Breaking Change Detection

- ✅ Detect removed endpoints
- ✅ Identify field type changes
- ✅ Track required field additions
- ✅ Generate migration plans

### Type-Safe Client Generation

- ✅ TypeScript client with full type safety
- ✅ Python client with dataclasses
- ✅ Go client with structs
- ✅ Automatic request/response serialization

## 📦 Installation

### Option 1: Workspace Installation (Recommended)

```bash
# Install all skills in the monorepo
cd claude-code-toolkit
npm install
```

### Option 2: Standalone Installation

```bash
# Install this skill independently
cd .claude/skills/api-contract-validator
npm install
```

### Prerequisites

- Node.js >= 16
- openapi-generator-cli (for client generation)
- ajv (JSON schema validation)

### Install Required Tools

```bash
# Install OpenAPI Generator CLI globally
npm install -g @openapitools/openapi-generator-cli

# Verify installation
openapi-generator-cli version

# Install validation library
npm install ajv ajv-formats
```

## 🚀 Quick Start

### 1. Generate OpenAPI Specification

```bash
# From Express + Zod backend
node scripts/generate-openapi.js \
  --source ./src/api \
  --output openapi.yaml

# From running server
node scripts/generate-openapi.js \
  --from=server \
  --url http://localhost:3000 \
  --output openapi.yaml
```

### 2. Validate API Contract

```bash
# Validate implementation against spec
node scripts/validate-contract.js \
  --spec openapi.yaml \
  --impl ./src/api

# Test specific endpoint
node scripts/validate-contract.js \
  --spec openapi.yaml \
  --endpoint /api/users \
  --method POST \
  --data '{"name":"John","email":"john@example.com"}'
```

### 3. Generate Type-Safe Client

```bash
# Generate TypeScript client
node scripts/generate-client.js \
  --spec openapi.yaml \
  --lang typescript \
  --output ./src/api/client
```

## 📖 Usage Examples

### Example 1: Backend-to-OpenAPI Generation

Generate OpenAPI specification from Express API with Zod schemas:

```bash
# Generate from code
node scripts/generate-openapi.js \
  --source ./src/api \
  --output openapi.yaml

# Output:
# ✓ Scanning API routes...
# ✓ Found 24 endpoints
# ✓ Extracting Zod schemas...
# ✓ Generated OpenAPI 3.0 specification
# ✓ Saved to openapi.yaml
#
# Endpoints discovered:
# - GET    /api/users
# - GET    /api/users/{id}
# - POST   /api/users
# - PUT    /api/users/{id}
# - DELETE /api/users/{id}
# - GET    /api/products
# - POST   /api/products
# ... (17 more)
```

**Generated OpenAPI Spec:**

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
```

### Example 2: Breaking Change Detection

Detect breaking changes between API versions:

```bash
# Compare two versions
node scripts/breaking-change-detector.js \
  --old openapi-v1.yaml \
  --new openapi-v2.yaml

# Output:
# 🚨 Breaking Changes Detected (5)
#
# 1. REMOVED ENDPOINT
#    DELETE /api/users/{id}
#    Impact: HIGH
#    Affected Clients: Web App, Mobile App
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
#    Field: phoneNumber (required)
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
# See migration-plan.md for details
```

### Example 3: Type-Safe Client Generation

Generate TypeScript client with full type safety:

```bash
# Generate client
node scripts/generate-client.js \
  --spec openapi.yaml \
  --lang typescript \
  --output ./src/api/client

# Output:
# ✓ Generating TypeScript client...
# ✓ Generated types (types.ts)
# ✓ Generated API client (api.ts)
# ✓ Generated models (models/User.ts, models/Order.ts, ...)
# ✓ Client ready to use
#
# Usage example:
# import { ApiClient } from './api/client';
# const client = new ApiClient({ baseUrl: 'https://api.example.com' });
# const user = await client.users.getById('123');
```

**Generated TypeScript Client:**

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
    },

    // Type-safe methods for all endpoints
    update: async (id: string, data: Partial<CreateUserRequest>): Promise<User> => {
      const response = await this.request<User>('PUT', `/api/users/${id}`, data);
      return response;
    }
  };

  private async request<T>(
    method: string,
    path: string,
    data?: unknown
  ): Promise<T> {
    // HTTP request with automatic serialization/deserialization
  }
}
```

### Example 4: Mock Server for Development

Start a mock server based on OpenAPI spec:

```bash
# Start mock server
node scripts/mock-server-generator.js \
  --spec openapi.yaml \
  --port 3001

# Output:
# ✓ Mock server started
# URL: http://localhost:3001
#
# Available endpoints:
# - GET    /api/users          → Returns array of users
# - GET    /api/users/{id}     → Returns single user
# - POST   /api/users          → Creates user
# - PUT    /api/users/{id}     → Updates user
# - DELETE /api/users/{id}     → Deletes user
#
# All endpoints return realistic mock data based on OpenAPI schema
# Press Ctrl+C to stop
```

**Mock Response Example:**

```bash
# GET /api/users/123
curl http://localhost:3001/api/users/123

# Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "user",
  "createdAt": "2025-01-16T10:30:00Z"
}
```

## ⚙️ Configuration

### OpenAPI Generator Config

Edit `templates/openapi-template.yaml`:

```yaml
openapi: 3.0.0
info:
  title: ${PROJECT_NAME}
  version: ${VERSION}
  description: ${DESCRIPTION}
servers:
  - url: https://api.${DOMAIN}
    description: Production
  - url: https://staging.api.${DOMAIN}
    description: Staging
  - url: http://localhost:3000
    description: Development
```

### Contract Validation Rules

Edit `validators/schema-validator.js`:

```javascript
module.exports = {
  strictMode: true, // Fail on unknown fields
  coerceTypes: false, // Don't auto-convert types
  removeAdditional: false, // Keep extra fields
  useDefaults: true, // Apply default values
  allErrors: true, // Report all errors, not just first
  formats: {
    // Custom format validators
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  }
};
```

### Breaking Change Detection Config

Edit `configs/breaking-change-rules.json`:

```json
{
  "rules": [
    {
      "type": "endpoint_removed",
      "severity": "high",
      "blockDeployment": true
    },
    {
      "type": "field_type_changed",
      "severity": "high",
      "blockDeployment": true
    },
    {
      "type": "required_field_added",
      "severity": "medium",
      "blockDeployment": true
    },
    {
      "type": "optional_field_added",
      "severity": "none",
      "blockDeployment": false
    }
  ],
  "ignorePatterns": [
    "/api/internal/*",
    "/api/v1/deprecated/*"
  ]
}
```

## 🔧 Troubleshooting

### Error: OpenAPI Generation Failed

**Cause**: Unable to parse backend code or invalid Zod schemas

**Solution**:

```bash
# Check syntax errors
npm run lint

# Verify Zod schemas are exported
grep -r "export.*Schema" src/api/

# Run with debug output
node scripts/generate-openapi.js \
  --source ./src/api \
  --output openapi.yaml \
  --debug
```

### Error: Contract Validation Failed

**Cause**: API implementation doesn't match OpenAPI spec

**Solution**:

```bash
# Get detailed validation errors
node scripts/validate-contract.js \
  --spec openapi.yaml \
  --impl ./src/api \
  --verbose

# Common issues:
# 1. Missing required field → Add field to implementation
# 2. Wrong type → Fix type in code or update spec
# 3. Extra field → Remove field or add to spec
```

### Error: Breaking Change Detected in CI/CD

**Cause**: API changes violate backward compatibility

**Solution**:

```bash
# Option 1: Revert breaking changes
git revert <commit-hash>

# Option 2: Create new API version
mkdir src/api/v2
cp -r src/api/v1/* src/api/v2/
# Make breaking changes in v2

# Option 3: Ignore specific changes (use with caution)
node scripts/breaking-change-detector.js \
  --old openapi-v1.yaml \
  --new openapi-v2.yaml \
  --ignore endpoint_removed:/api/deprecated/*
```

### Error: Client Generation Failed

**Cause**: Invalid OpenAPI spec or missing dependencies

**Solution**:

```bash
# Validate OpenAPI spec first
npx @openapitools/openapi-generator-cli validate -i openapi.yaml

# Common issues:
# 1. Invalid YAML → Check syntax with yamllint
# 2. Missing $ref → Ensure all references are defined
# 3. Unsupported version → Upgrade to OpenAPI 3.0

# Regenerate with verbose output
node scripts/generate-client.js \
  --spec openapi.yaml \
  --lang typescript \
  --output ./src/api/client \
  --verbose
```

### Error: Mock Server Returns Wrong Data

**Cause**: OpenAPI schema doesn't have enough examples

**Solution**:

Edit OpenAPI spec to add examples:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440000"
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john.doe@example.com"
```

## ✅ Best Practices

### 1. Always Version Your API

```bash
# ❌ Bad: No versioning
/api/users
/api/products

# ✅ Good: Include version in URL
/api/v1/users
/api/v1/products

# When breaking changes are needed:
/api/v2/users  # New version with breaking changes
/api/v1/users  # Old version still available
```

### 2. Use OpenAPI-First Development

```bash
# ❌ Bad: Write code first, generate spec later
1. Write API implementation
2. Generate OpenAPI spec
3. Fix inconsistencies

# ✅ Good: Define spec first, implement later
1. Write OpenAPI spec
2. Generate client code
3. Generate mock server
4. Frontend starts development (using mocks)
5. Backend implements according to spec
6. Integration testing
```

### 3. Validate in CI/CD Pipeline

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

      - name: Generate OpenAPI from code
        run: npm run generate:openapi

      - name: Detect breaking changes
        run: |
          git fetch origin main
          git show origin/main:openapi.yaml > openapi-main.yaml
          npm run api:breaking-changes -- \
            --old=openapi-main.yaml \
            --new=openapi.yaml \
            --fail-on-breaking

      - name: Validate implementation
        run: npm run api:validate
```

### 4. Document All Fields

```yaml
# ❌ Bad: No descriptions
User:
  type: object
  properties:
    id:
      type: string
    status:
      type: string

# ✅ Good: Clear descriptions
User:
  type: object
  description: Represents a registered user
  properties:
    id:
      type: string
      format: uuid
      description: Unique identifier for the user
    status:
      type: string
      enum: [active, inactive, suspended]
      description: |
        Current status of the user account:
        - active: User can log in
        - inactive: User temporarily disabled
        - suspended: User banned for policy violation
```

### 5. Keep Specs in Version Control

```bash
# Commit OpenAPI spec with code changes
git add openapi.yaml src/api/users.ts
git commit -m "feat: Add phone number field to User API

- Added optional phoneNumber field to User schema
- Updated OpenAPI spec (backward compatible)
- Generated new TypeScript client"

# Tag API versions
git tag api-v1.2.0
git push origin api-v1.2.0
```

## 📚 Related Documentation

- [SKILL.md](SKILL.md) - Complete skill specifications
- [examples/basic-usage.md](examples/basic-usage.md) - Basic contract validation examples
- [examples/advanced-usage.md](examples/advanced-usage.md) - Advanced patterns and CI/CD integration
- [OpenAPI Specification](https://swagger.io/specification/)
- [Zod Documentation](https://zod.dev/)
- [openapi-generator-cli](https://github.com/OpenAPITools/openapi-generator-cli)

## 📝 License

MIT

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Need help?** Create an issue or see [Troubleshooting](#troubleshooting) above.
