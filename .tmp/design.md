# 詳細設計書 - WSL Docker Compose + Playwright MCP 開発環境構築

> **作成日**: 2026-01-11
> **更新日**: 2026-01-14
> **関連文書**: requirements.md

## 1. アーキテクチャ概要

### 1.1 システム構成図

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Windows 10/11                                │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                      VS Code (Windows)                         │  │
│  │  ┌─────────────────┐  ┌─────────────────────────────────────┐ │  │
│  │  │  Claude Code    │  │  Remote - WSL Extension             │ │  │
│  │  │  Extension      │  │                                     │ │  │
│  │  └────────┬────────┘  └──────────────────┬──────────────────┘ │  │
│  └───────────┼──────────────────────────────┼────────────────────┘  │
│              │ MCP Protocol                 │ WSL Connection        │
│              │ (stdio)                      │                       │
│  ┌───────────┼──────────────────────────────┼────────────────────┐  │
│  │           │         WSL2 (Ubuntu 24.04 LTS)                   │  │
│  │           ▼                              ▼                     │  │
│  │  ┌─────────────────┐           ┌─────────────────────────┐   │  │
│  │  │ Playwright MCP  │           │   Project Directory     │   │  │
│  │  │ Server          │           │   ~/projects/           │   │  │
│  │  │ (@playwright/mcp)│          │                         │   │  │
│  │  └────────┬────────┘           └─────────────────────────┘   │  │
│  │           │ --executable-path                                 │  │
│  │           ▼                                                    │  │
│  │  ┌─────────────────┐           ┌─────────────────────────┐   │  │
│  │  │   Chromium      │           │   Docker Engine         │   │  │
│  │  │ ~/.cache/ms-    │           │   (systemd managed)     │   │  │
│  │  │ playwright/     │           └──────────┬──────────────┘   │  │
│  │  └─────────────────┘                      │                    │  │
│  │                                           ▼                    │  │
│  │                                ┌─────────────────────────┐    │  │
│  │                                │   Docker Containers     │    │  │
│  │                                │  ┌─────┐ ┌─────┐ ┌────┐│    │  │
│  │                                │  │ App │ │ DB  │ │ ...││    │  │
│  │                                │  └─────┘ └─────┘ └────┘│    │  │
│  │                                └─────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 技術スタック

| カテゴリ | 技術 | バージョン | 備考 |
|----------|------|------------|------|
| OS (Host) | Windows 10/11 | Build 19041+ | |
| 仮想化 | WSL2 | 2.5.9.0 | |
| Linux | Ubuntu | 24.04 LTS | |
| コンテナ | Docker Engine | 最新安定版 | Docker Desktop不使用 |
| コンテナ管理 | Docker Compose | v2.x | docker-compose-plugin |
| ランタイム | Node.js | 22.x LTS | |
| パッケージ管理 | npm | Node.js同梱版 | |
| ブラウザ自動化 | Playwright | 1.57.0 | |
| MCP Server | @playwright/mcp | 最新版 | --executable-path必須 |
| エディタ | VS Code | 最新安定版 | Remote-WSL拡張 |
| AI Assistant | Claude Code | 最新版 | CLI版をWSL内にインストール |

## 2. コンポーネント設計

### 2.1 コンポーネント一覧

| コンポーネント | 責務 | 依存関係 |
|----------------|------|----------|
| WSL2 | Linux実行環境の提供 | Windows Hyper-V |
| Ubuntu 24.04 | Linux OS環境 | WSL2 |
| Docker Engine | コンテナ実行環境 | Ubuntu, systemd |
| Docker Compose | マルチコンテナ管理 | Docker Engine |
| Node.js | JavaScript実行環境 | Ubuntu |
| Claude Code CLI | MCPサーバー管理 | Node.js |
| Playwright MCP | ブラウザ操作API提供 | Node.js, Chromium |
| Chromium | ブラウザエンジン | ~/.cache/ms-playwright/ |
| VS Code Remote | WSL内ファイル編集 | VS Code, WSL2 |

### 2.2 各コンポーネントの詳細

#### WSL2 + Ubuntu 24.04

- **目的**: Windows上でLinux環境を提供
- **設定ファイル**:
  - `/etc/wsl.conf` - WSL動作設定
  - `%USERPROFILE%\.wslconfig` - リソース制限（オプション）
- **重要な設定**:
  ```ini
  # /etc/wsl.conf
  [boot]
  systemd=true

  [interop]
  appendWindowsPath=false
  ```
- **注意**: wsl.confの書式エラーがあるとWSLが起動しない。問題発生時は`wsl --unregister`で再インストール

#### Docker Engine

- **目的**: コンテナ実行環境の提供
- **インストール方法**: 公式リポジトリから直接インストール（Docker Desktop不使用）
- **サービス管理**: systemdによる自動起動
- **ユーザー権限**: dockerグループへの追加で非root実行
- **インストールコマンド**:
  ```bash
  # 一括インストールスクリプト
  sudo apt update && \
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

#### Claude Code CLI

- **目的**: MCPサーバーの管理とClaude Code機能の提供
- **インストール**: `sudo npm install -g @anthropic-ai/claude-code`
- **注意**: sudoなしではEACCESエラーが発生

#### Playwright MCP Server

- **目的**: Claude CodeからPlaywrightを操作するためのMCPインターフェース提供
- **重要**: デフォルトでは`/opt/google/chrome/chrome`を探すため、`--executable-path`で明示指定が必要
- **Chromiumパス**: `~/.cache/ms-playwright/chromium-XXXX/chrome-linux64/chrome`
- **設定方法**:
  ```bash
  # パスを確認
  find ~/.cache/ms-playwright -name "chrome"

  # MCP設定（ユーザーレベル）
  claude mcp add -s user playwright -- npx @playwright/mcp@latest \
    --executable-path /home/USER/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome \
    --headless
  ```
- **通信方式**: stdio（標準入出力）
- **主要機能**:
  - ブラウザナビゲーション
  - 要素操作（クリック、入力）
  - スクリーンショット取得
  - PDF生成
  - ネットワーク監視

## 3. ディレクトリ構成

### 3.1 WSL内ディレクトリ構成

```
~/
├── .cache/
│   └── ms-playwright/               # Playwrightブラウザ
│       ├── chromium-1200/
│       │   └── chrome-linux64/
│       │       └── chrome           # Chromium実行ファイル
│       ├── chromium_headless_shell-1200/
│       └── ffmpeg-1011/
│
├── .claude.json                      # Claude Code MCP設定（ユーザーレベル）
│
└── projects/                         # プロジェクトルート
    └── sample-app/                   # サンプルプロジェクト
        ├── docker-compose.yml
        └── .claude.json              # プロジェクトレベルMCP設定（オプション）
```

### 3.2 Windows側ディレクトリ

```
%USERPROFILE%\
├── .wslconfig                   # WSLリソース設定（オプション）
└── AppData\
    └── Roaming\
        └── Code\                # VS Code設定
            └── User\
                └── settings.json
```

## 4. 設定ファイル詳細

### 4.1 WSL設定 (`/etc/wsl.conf`)

```ini
[boot]
systemd=true

[interop]
appendWindowsPath=false
```

**重要**:
- 余分な空行や不正な文字があるとWSLが起動しない
- 問題発生時は`wsl --unregister Ubuntu-24.04`で再インストール

### 4.2 Claude Code MCP設定 (`~/.claude.json`)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--executable-path",
        "/home/USER/.cache/ms-playwright/chromium-XXXX/chrome-linux64/chrome",
        "--headless"
      ]
    }
  }
}
```
※ `USER`と`chromium-XXXX`は環境に応じて変更

**設定コマンド（推奨）**:
```bash
# 既存設定を削除
claude mcp remove -s user playwright 2>/dev/null

# ユーザーレベルで設定（パスを動的に取得）
claude mcp add -s user playwright -- npx @playwright/mcp@latest \
  --executable-path $(find ~/.cache/ms-playwright -name "chrome" | head -1) \
  --headless

# 確認（✓ Connected と表示されればOK）
claude mcp list
```

**注意点**:
- `-s user`を指定しないとプロジェクトディレクトリに設定が保存される
- `--executable-path`がないとデフォルトで`/opt/google/chrome/chrome`を探してエラーになる
- `--headless`はWSL環境では推奨

### 4.3 サンプル Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
```

## 5. セットアップフロー

### 5.1 フロー図（実際の手順反映）

```
[Windows準備]
     │
     ▼
┌─────────────────┐
│ 1. WSL2確認     │ ← wsl --version
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Ubuntu       │ ← wsl --install -d Ubuntu-24.04
│    インストール │   ユーザー名/パスワード設定
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. wsl.conf作成 │ ← sudo bash -c 'cat > /etc/wsl.conf << EOF
│    systemd有効化│   [boot]
│                 │   systemd=true
│                 │   EOF'
└────────┬────────┘
         │ wsl --shutdown → 再起動
         ▼
┌─────────────────┐
│ 4. Docker       │ ← 一括インストールスクリプト実行
│    インストール │   exit → wsl --shutdown → 再接続
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 5. Node.js      │ ← curl -fsSL ... | sudo -E bash -
│    インストール │   sudo apt install -y nodejs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 6. Claude Code  │ ← sudo npm install -g @anthropic-ai/claude-code
│    CLI          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 7. Playwright   │ ← sudo npx playwright install-deps chromium
│    インストール │   npx playwright install chromium
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 8. MCP設定      │ ← find ~/.cache/ms-playwright -name "chrome"
│    (重要!)      │   claude mcp add -s user playwright -- npx ...
│                 │     --executable-path /path/to/chrome --headless
└────────┬────────┘
         │
         ▼
    [完了・検証]
```

## 6. ネットワーク設計

### 6.1 ネットワーク構成

```
Windows Host
    │
    ├── localhost:3000 ←→ WSL2:3000 (フロントエンド)
    ├── localhost:8080 ←→ WSL2:8080 (バックエンド/nginx)
    └── localhost:5432 ←→ WSL2:5432 (DB)

WSL2内部
    │
    └── Docker Network (bridge)
        ├── frontend → backend:8080
        └── backend → db:5432
```

### 6.2 ポートフォワーディング

WSL2はデフォルトでlocalhostへのポートフォワーディングをサポート。
Windowsブラウザから `localhost:8080` でWSL内のサービスにアクセス可能。

## 7. エラーハンドリング

### 7.1 よくあるエラーと対策（実経験ベース）

| エラー | 原因 | 対策 |
|--------|------|------|
| `wsl: Expected '=' in /etc/wsl.conf:2` | wsl.confの書式エラー | `wsl --unregister`で再インストール |
| `Cannot connect to Docker daemon` | Dockerサービス未起動 | `sudo systemctl start docker` |
| `permission denied` (Docker) | ユーザーがdockerグループ外 | `sudo usermod -aG docker $USER` + WSL再起動 |
| `EACCES: permission denied` (npm) | グローバルインストール権限なし | `sudo npm install -g ...` |
| `Chromium distribution 'chrome' is not found` | MCPがデフォルトパスを探す | `--executable-path`で明示指定 |
| `MCP server ... Failed to connect` | 設定が古いまま | `claude mcp remove` → 再設定 |
| `No MCP server found` | 別ディレクトリで設定された | 正しいディレクトリで再設定、または`-s user` |

### 7.2 ログ確認方法

```bash
# Docker ログ
sudo journalctl -u docker

# WSL ログ (Windows側)
wsl --status

# Playwright MCP デバッグ
DEBUG=pw:* npx @playwright/mcp@latest

# MCP設定確認
cat ~/.claude.json
claude mcp list
```

## 8. セキュリティ設計

### 8.1 Docker セキュリティ

- **非rootユーザー実行**: dockerグループへのユーザー追加
- **イメージ管理**: 公式/信頼できるイメージのみ使用
- **ネットワーク分離**: Docker内部ネットワークで分離

### 8.2 MCP セキュリティ

- **ローカル限定**: stdio通信でネットワーク露出なし
- **プロセス分離**: MCPサーバーは必要時のみ起動
- **ヘッドレスモード**: `--headless`でブラウザUIなし

### 8.3 機密情報管理

```bash
# .env ファイルで環境変数管理
# .gitignore に .env を追加

# Docker Compose での使用
services:
  app:
    env_file:
      - .env
```

## 9. テスト・検証手順

### 9.1 環境確認コマンド

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

### 9.2 Docker 検証

```bash
docker run hello-world
docker compose up -d
curl http://localhost:8080
docker compose down
```

### 9.3 Playwright MCP 検証

```bash
claude mcp list
# → playwright: ... - ✓ Connected

claude
# Claude Code内で:
# "Open a browser and navigate to http://localhost:8080, then take a screenshot"
```

## 10. 実装上の注意事項

1. **WSL再起動**: wsl.conf変更後は `wsl --shutdown` で再起動が必要
2. **dockerグループ**: ユーザー追加後はWSL再起動が必要（exit → wsl --shutdown → 再接続）
3. **ファイルパス**: WSL内では `/home/user/projects` を使用（`/mnt/c/` は低速）
4. **Playwright初回起動**: 初回はブラウザダウンロードで時間がかかる
5. **VS Code拡張**: Remote-WSL拡張はWindowsのVS Codeにインストール
6. **MCP設定スコープ**: `claude mcp add -s user` でユーザーレベル設定推奨
7. **Chromiumパス**: `chrome-linux64`（環境により`chrome-linux`の場合もある）
8. **npm権限**: グローバルインストールには`sudo`が必要
