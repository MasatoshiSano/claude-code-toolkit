# OWASP Top 10 2021 Checklist

## A01:2021 - Broken Access Control

### チェック項目

- [ ] 認証なしでアクセス可能なAPIエンドポイントはないか
- [ ] ユーザーIDをURLパラメータで直接使用していないか（IDOR）
- [ ] 権限チェックがバイパス可能でないか
- [ ] CORSが適切に設定されているか
- [ ] ファイルアップロードに制限があるか

### 検出方法

```bash
# 認証なしアクセス可能なルートを検索
grep -r "router.get\|router.post" --include="*.js" | grep -v "auth\|middleware"
```

---

## A02:2021 - Cryptographic Failures

### チェック項目

- [ ] パスワードはハッシュ化されているか（bcrypt、scrypt、Argon2）
- [ ] HTTPSが強制されているか
- [ ] 機密データは暗号化されているか（at-rest、in-transit）
- [ ] 弱い暗号化アルゴリズム（MD5、SHA1）を使用していないか
- [ ] 暗号化キーは安全に管理されているか

### 検出方法

```bash
# 弱い暗号化の検出
grep -r "md5\|sha1" --include="*.js" --include="*.py"

# 平文パスワード保存の検出
grep -r "password.*=" --include="*.js" | grep -v "hash\|bcrypt"
```

---

## A03:2021 - Injection

### チェック項目

- [ ] SQLクエリはprepared statementsを使用しているか
- [ ] ユーザー入力は適切にバリデーションされているか
- [ ] 出力時に適切にエスケープされているか（XSS対策）
- [ ] NoSQLインジェクションのリスクはないか
- [ ] コマンドインジェクションのリスクはないか

### 検出方法

```javascript
// 危険なSQLクエリパターン
const dangerous = /query\s*\(\s*['"`].*\+.*['"`]\s*\)/;

// 安全なパターン（prepared statements）
const safe = /query\s*\(\s*['"`].*\?.*['"`]\s*,\s*\[/;
```

---

## A04:2021 - Insecure Design

### チェック項目

- [ ] レート制限が実装されているか
- [ ] 適切なエラーハンドリングがあるか
- [ ] セキュリティコントロールが設計に組み込まれているか
- [ ] 脅威モデリングが実施されているか

---

## A05:2021 - Security Misconfiguration

### チェック項目

- [ ] デフォルト認証情報が変更されているか
- [ ] 不要な機能・ポートが無効化されているか
- [ ] エラーメッセージに機密情報が含まれていないか
- [ ] セキュリティヘッダーが設定されているか
  - `Strict-Transport-Security`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Content-Security-Policy`
- [ ] 本番環境でデバッグモードが無効か

### 検出方法

```bash
# デバッグモードの検出
grep -r "DEBUG.*=.*true\|NODE_ENV.*=.*development" --include=".env*"
```

---

## A06:2021 - Vulnerable and Outdated Components

### チェック項目

- [ ] 依存関係に既知の脆弱性はないか
- [ ] すべてのパッケージが最新の安定版か
- [ ] サポート終了したライブラリを使用していないか
- [ ] 未使用の依存関係は削除されているか

### 検出方法

```bash
# npm audit
npm audit --audit-level=high

# outdated packages
npm outdated

# Python
pip-audit
```

---

## A07:2021 - Identification and Authentication Failures

### チェック項目

- [ ] パスワードポリシーは十分か（最小8文字、複雑性要件）
- [ ] ブルートフォース対策があるか
- [ ] セッションタイムアウトが設定されているか
- [ ] 多要素認証（MFA）が実装されているか
- [ ] セッションIDは予測不可能か

---

## A08:2021 - Software and Data Integrity Failures

### チェック項目

- [ ] CI/CDパイプラインは保護されているか
- [ ] パッケージの整合性が検証されているか（checksum）
- [ ] 自動更新は署名検証されているか
- [ ] Dockerイメージは信頼できるソースか

---

## A09:2021 - Security Logging and Monitoring Failures

### チェック項目

- [ ] 重要なイベントがログに記録されているか
  - ログイン成功/失敗
  - アクセス制御の失敗
  - データ変更
- [ ] 機密情報（パスワード、トークン）がログに出力されていないか
- [ ] ログは改ざん防止されているか
- [ ] アラート機能は実装されているか

### 検出方法

```bash
# ログに機密情報が含まれていないか
grep -r "console.log.*password\|logger.*token" --include="*.js"
```

---

## A10:2021 - Server-Side Request Forgery (SSRF)

### チェック項目

- [ ] ユーザー提供のURLを検証しているか
- [ ] 内部ネットワークへのアクセスが制限されているか
- [ ] ホワイトリスト方式でURLを制限しているか
- [ ] リダイレクトは安全に処理されているか

### 検出方法

```javascript
// 危険なパターン
const dangerous = /fetch\(.*req\..*\)|axios\.get\(.*req\./;

// 検証なしのリダイレクト
const unsafeRedirect = /redirect\(.*req\./;
```

---

## スコアリング

各項目を以下の基準で評価：

- ✅ Pass (1点): 対策済み
- ⚠️ Partial (0.5点): 部分的に対策
- ❌ Fail (0点): 未対策

**総合評価:**

- 90-100点: Excellent
- 80-89点: Good
- 70-79点: Fair
- 60-69点: Poor
- <60点: Critical
