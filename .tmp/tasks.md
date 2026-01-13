# タスクリスト - WSL Docker Compose + Playwright MCP 開発環境構築

> **作成日**: 2026-01-11
> **更新日**: 2026-01-14
> **ステータス**: 全タスク完了 ✓
> **関連文書**: requirements.md, design.md

## 概要

- **総タスク数**: 14タスク（4フェーズ）
- **優先度**: 高（開発環境構築のため、他の作業のブロッカー）
- **実装状況**: 全Phase完了 ✓（Playwright MCPブラウザ操作テスト成功）

## 依存関係図

```
Phase 1: Windows/WSL準備
  Task 1.1 → Task 1.2 → Task 1.3
                          ↓
Phase 2: 環境構築        ↓
  Task 2.1 ←─────────────┘
    ↓
  Task 2.2 → Task 2.3 → Task 2.4 → Task 2.5
                                     ↓
Phase 3: MCP/Docker統合              ↓
  Task 3.1 ←─────────────────────────┘
    ↓
  Task 3.2 → Task 3.3
                ↓
Phase 4: 検証・完了
  Task 4.1 → Task 4.2
```

---

## Phase 1: Windows/WSL準備

### Task 1.1: Windows環境の事前確認 ✓

- [x] Windowsバージョン確認（Build 19041以降）
- [x] WSL2がインストール済みか確認 (`wsl --version`)
- [x] 管理者権限の確認
- **完了条件**: WSL2が利用可能な状態
- **依存**: なし
- **実際の結果**: WSL 2.5.9.0 確認済み

### Task 1.2: Ubuntu 24.04 LTS のインストール ✓

- [x] `wsl --install -d Ubuntu-24.04` を実行
- [x] 初回起動でユーザー名とパスワードを設定
- [x] `lsb_release -a` でUbuntuバージョン確認
- **完了条件**: Ubuntu 24.04がWSL2上で動作し、ログイン可能
- **依存**: Task 1.1
- **注意**: 対話的操作が必要（ユーザー名/パスワード設定）

### Task 1.3: WSL systemd有効化 ✓

- [x] `/etc/wsl.conf` ファイルを作成
  ```bash
  sudo bash -c 'cat > /etc/wsl.conf << EOF
  [boot]
  systemd=true

  [interop]
  appendWindowsPath=false
  EOF'
  ```
- [x] Windows側で `wsl --shutdown` を実行
- [x] WSLを再起動
- [x] `systemctl is-system-running` で動作確認
- **完了条件**: `running` または `degraded` と表示される
- **依存**: Task 1.2
- **トラブルシューティング**:
  - wsl.confの書式エラーが発生した場合は`wsl --unregister Ubuntu-24.04`で再インストール

---

## Phase 2: 環境構築（Docker/Node.js/Playwright）

### Task 2.1: Docker Engine インストール ✓

- [x] 一括インストールスクリプトを実行
  ```bash
  sudo apt update && \
  sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true && \
  sudo apt install -y ca-certificates curl gnupg && \
  sudo install -m 0755 -d /etc/apt/keyrings && \
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
  sudo chmod a+r /etc/apt/keyrings/docker.gpg && \
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
  sudo apt update && \
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && \
  sudo usermod -aG docker $USER && \
  sudo systemctl enable docker && \
  sudo systemctl start docker
  ```
- [x] WSLを再起動（`exit` → `wsl --shutdown` → 再接続）
- [x] 非rootでDocker実行確認: `docker run hello-world`
- **完了条件**: `sudo` なしで `docker run hello-world` 成功
- **依存**: Task 1.3

### Task 2.2: Node.js (LTS) インストール ✓

- [x] NodeSourceリポジトリ追加とインストール
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt install -y nodejs
  ```
- [x] バージョン確認: `node --version` && `npm --version`
- **完了条件**: Node.js 22.x と npm がインストール済み
- **依存**: Task 1.3

### Task 2.3: Claude Code CLI インストール ✓

- [x] Claude Code CLIをグローバルインストール
  ```bash
  sudo npm install -g @anthropic-ai/claude-code
  ```
- [x] インストール確認: `claude --version`
- **完了条件**: `claude` コマンドが使用可能
- **依存**: Task 2.2
- **注意**: `sudo`が必要（EACCES エラー回避）

### Task 2.4: Playwright ブラウザインストール ✓

- [x] Playwright依存パッケージインストール
  ```bash
  sudo npx playwright install-deps chromium
  ```
- [x] Chromiumブラウザインストール
  ```bash
  npx playwright install chromium
  ```
- [x] インストール確認: `npx playwright --version`
- [x] Chromiumパス確認
  ```bash
  find ~/.cache/ms-playwright -name "chrome"
  # 例: /home/sano/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome
  ```
- **完了条件**: Playwrightとchromiumがインストール済み、パスを確認
- **依存**: Task 2.2
- **実際のパス**: `/home/sano/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`

### Task 2.5: プロジェクトディレクトリ作成 ✓

- [x] プロジェクトルート作成
  ```bash
  mkdir -p ~/projects/sample-app
  cd ~/projects/sample-app
  ```
- **完了条件**: `~/projects/sample-app` ディレクトリが存在
- **依存**: Task 1.3

---

## Phase 3: MCP/Docker統合

### Task 3.1: Playwright MCP 設定 ✓

- [x] MCPサーバー登録（**重要: --executable-pathを指定**）
  ```bash
  claude mcp add -s user playwright -- npx @playwright/mcp@latest \
    --executable-path /home/sano/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome \
    --headless
  ```
- [x] MCP設定確認
  ```bash
  claude mcp list
  # → playwright: ... - ✓ Connected
  ```
- **完了条件**: `claude mcp list` で `✓ Connected` と表示される
- **依存**: Task 2.3, Task 2.4
- **重要な知見**:
  - `--executable-path`がないとデフォルトで`/opt/google/chrome/chrome`を探してエラー
  - `-s user`でユーザーレベル設定（プロジェクトに依存しない）
  - `--headless`はWSL環境では推奨

### Task 3.2: Docker Compose サンプル作成 ✓

- [x] サンプルプロジェクトに移動
  ```bash
  cd ~/projects/sample-app
  ```
- [x] docker-compose.yml 作成
  ```bash
  cat > docker-compose.yml << 'EOF'
  version: '3.8'
  services:
    web:
      image: nginx:alpine
      ports:
        - "8080:80"
  EOF
  ```
- [x] コンテナ起動テスト
  ```bash
  docker compose up -d
  curl http://localhost:8080
  ```
- **完了条件**: nginxのHTMLが表示される
- **依存**: Task 2.1, Task 2.5

### Task 3.3: VS Code Remote-WSL 設定

- [ ] VS Code（Windows側）を起動
- [ ] 拡張機能「Remote - WSL」をインストール
- [ ] コマンドパレットで「WSL: Connect to WSL」を実行
- [ ] WSL内のプロジェクトフォルダを開く (`~/projects/sample-app`)
- **完了条件**: VS CodeからWSL内ファイルを編集可能
- **依存**: Task 2.5

---

## Phase 4: 検証・完了

### Task 4.1: 環境確認 ✓

- [x] 全環境の確認コマンド実行
  ```bash
  echo "=== 環境確認 ===" && \
  echo "WSL: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)" && \
  echo "Docker: $(docker --version)" && \
  echo "Docker Compose: $(docker compose version)" && \
  echo "Node.js: $(node --version)" && \
  echo "npm: $(npm --version)" && \
  echo "Playwright: $(npx playwright --version)" && \
  echo "Chromium: $(find ~/.cache/ms-playwright -name 'chrome' 2>/dev/null)" && \
  echo "=== MCP設定 ===" && \
  claude mcp list
  ```
- **完了条件**: 全てのコンポーネントが正常表示
- **依存**: Task 3.1, Task 3.2

### Task 4.2: Playwright MCP 統合テスト ✓

- [x] Claude Codeを起動
  ```bash
  cd ~/projects/sample-app
  docker compose up -d  # nginxが動いている状態で
  claude
  ```
- [x] テスト指示を実行
  ```
  Open a browser and navigate to http://localhost:8080, then take a screenshot
  ```
- [x] ブラウザ操作が成功することを確認（nginxページのスクリーンショット取得成功）
- **完了条件**: Claude CodeからPlaywright MCPでブラウザ操作が可能 ✓
- **依存**: Task 4.1
- **トラブルシューティング**:
  - `Chromium distribution 'chrome' is not found`エラー → `--executable-path`を確認
  - `Failed to connect`エラー → `claude mcp remove playwright`後に再設定

---

## 実装順序（推奨）

```
1. Task 1.1 → 1.2 → 1.3 (Windows/WSL準備: 順次実行)
2. Task 2.1 (Docker: WSL再起動が必要)
3. Task 2.2 → 2.3 (Node.js/Claude Code CLI)
4. Task 2.4 → 2.5 (Playwright/ディレクトリ)
5. Task 3.1 (MCP設定: 最重要、--executable-path必須)
6. Task 3.2 (Docker Composeサンプル)
7. Task 3.3 (VS Code設定)
8. Task 4.1 → 4.2 (検証)
```

## トラブルシューティング（実経験ベース）

| 問題 | 原因 | 解決方法 |
|------|------|----------|
| `wsl: Expected '=' in /etc/wsl.conf` | wsl.confの書式エラー | `wsl --unregister Ubuntu-24.04`で再インストール |
| `docker run`で`permission denied` | dockerグループ未参加 | WSL再起動（exit → wsl --shutdown → 再接続） |
| `npm install -g`で`EACCES` | 権限不足 | `sudo npm install -g ...` |
| `Chromium distribution 'chrome' is not found` | デフォルトパスを探している | `--executable-path`でchromiumパスを明示 |
| `MCP server ... Failed to connect` | 設定が反映されていない | `claude mcp remove` → 再設定 |
| MCP設定が見つからない | 別ディレクトリで設定された | `-s user`でユーザーレベル設定 |
| Chrome起動時にエラー | WSLでGUIなし | `--headless`オプション追加 |

## クイックリファレンス

### Chromiumパス確認
```bash
find ~/.cache/ms-playwright -name "chrome"
```

### MCP設定（推奨コマンド）
```bash
# 既存設定を削除して再設定
claude mcp remove -s user playwright 2>/dev/null
claude mcp add -s user playwright -- npx @playwright/mcp@latest \
  --executable-path $(find ~/.cache/ms-playwright -name "chrome" | head -1) \
  --headless

# 確認（✓ Connected と表示されればOK）
claude mcp list
```

### 最終テスト手順
```bash
cd ~/projects/sample-app
docker compose up -d
claude
# Claude Code内で: Open a browser and navigate to http://localhost:8080, then take a screenshot
```

### 全環境確認
```bash
echo "Docker: $(docker --version)" && \
echo "Node.js: $(node --version)" && \
echo "Playwright: $(npx playwright --version)" && \
claude mcp list
```

---

## 実装開始ガイド

1. このタスクリストに従って順次実装を進めてください
2. 各タスクの開始時にTodoWriteでin_progressに更新
3. 完了時はcompletedに更新
4. **特にTask 3.1（MCP設定）は`--executable-path`を必ず指定**
5. 問題発生時はトラブルシューティング表を参照
