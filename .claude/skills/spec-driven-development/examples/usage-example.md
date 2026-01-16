# Spec-Driven Development Usage Examples

## Example 1: Creating New Feature Specification

### Input
```
Task: "Implement user authentication with email/password"
```

### Execution Flow

**Stage 1: Requirements**
```bash
Agent analyzes the task and generates:
.tmp/requirements.md with:
- Purpose: Secure user authentication system
- Required features: Email/password login, password reset, session management
- Non-functional: Security (bcrypt hashing), Performance (<200ms login)
- Success criteria: Users can login, passwords are hashed, sessions expire
```

**Stage 2: Design**
```bash
Agent reads requirements.md and generates:
.tmp/design.md with:
- Components: AuthController, UserModel, SessionManager
- API interfaces: POST /api/auth/login, POST /api/auth/logout
- Security: bcrypt for hashing, JWT for sessions
- Error handling: Invalid credentials, expired tokens
```

**Stage 3: Tasks**
```bash
Agent reads design.md and generates:
.tmp/tasks.md with:
- Phase 1: Setup (Install bcrypt, Setup JWT)
- Phase 2: Implementation (Create UserModel, AuthController, SessionManager)
- Phase 3: Testing (Unit tests, Integration tests)
- Phase 4: Documentation (API docs, Usage guide)
Total: 15 tasks, estimated 20 hours
```

## Example 2: Adding Feature to Existing Project

### Context
Existing documents:
- requirements.md: User profile management
- design.md: ProfileController, ProfileView components
- tasks.md: Profile CRUD operations (completed)

### Input
```
Task: "Add avatar upload functionality to user profile"
```

### Execution Flow

**Stage 1: Requirements Update**
```bash
Agent reads existing requirements.md and updates:
- Adds "アバターアップロード機能" to section 2.1 with date
- Updates non-functional requirements (file size limits, image formats)
- Adds success criteria (avatars display correctly, within size limit)
- Appends to 改訂履歴
```

**Stage 2: Design Update**
```bash
Agent reads existing design.md and updates:
- Adds ImageUploadComponent to component list
- Details integration with existing ProfileController
- Updates data flow to include image upload pipeline
- Adds API: POST /api/profile/avatar
- Appends to 改訂履歴
```

**Stage 3: Tasks Addition**
```bash
Agent reads existing tasks.md and adds:
- New section under "🚧 進行中の機能"
- "アバターアップロード機能 - 2025-01-16"
- Phase 1: Setup (multer, image processing library)
- Phase 2: Implementation (upload endpoint, image validation)
- Phase 3: Testing (upload tests, validation tests)
- Phase 4: UI integration
Total: 8 tasks, estimated 10 hours
```

## Example 3: Handling Unclear Requirements

### Input
```
Task: "Make the app faster"
```

### Agent Response
```
❌ Requirements too vague. Asking clarifying questions:

Q1: Which part of the app needs to be faster?
- [ ] Page load time
- [ ] API response time
- [ ] Database queries
- [ ] Frontend rendering

Q2: What is the current performance?
User: "API responses take 2-3 seconds"

Q3: What is the target performance?
User: "Under 500ms"

Q4: Which specific endpoints are slow?
User: "/api/users/list and /api/products/search"

✅ Now generating requirements with:
- Specific endpoints identified
- Current: 2-3s, Target: <500ms
- Focus: API optimization, not UI
```

## Example 4: Error Handling

### Scenario: Missing Prerequisites

```bash
User runs: "Generate design for authentication"

Agent checks:
❌ .tmp/requirements.md does not exist

Agent response:
"Cannot generate design without requirements.
Please run Stage 1 first: Generate requirements document"

User runs: "Generate requirements for authentication"
✅ Generates requirements.md

User runs: "Generate design"
✅ Reads requirements.md and generates design.md
```

## Best Practices Demonstrated

### 1. Always Get User Approval Between Stages
```
Stage 1 Complete → Show requirements → Wait for approval
Stage 2 Complete → Show design → Wait for approval
Stage 3 Complete → Show tasks → Ready to implement
```

### 2. Incremental Updates Preserve History
```
❌ Bad: Overwrite existing requirements.md
✅ Good: Merge new feature, add to 改訂履歴 with date
```

### 3. Tasks are Commit-Sized
```
❌ Bad: "Implement authentication" (8 hours, unclear)
✅ Good: "Setup bcrypt library" (30 mins, clear completion)
```

### 4. Clear Dependencies
```
Task 2.1: Create User Model
Task 2.2: Create Auth Controller (depends on 2.1)
Task 2.3: Create Session Manager (depends on 2.1)

→ 2.1 must complete first, then 2.2 and 2.3 can run in parallel
```
