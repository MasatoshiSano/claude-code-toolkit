# WSL Docker + Playwright MCP 開発環境構築ガイド

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Windows上で **WSL2 + Ubuntu 24.04 LTS + Docker Engine（Docker Desktop不使用） + Playwright MCP + Claude Code CLI** を統合した、Webアプリ開発環境を構築するための実装完了・動作検証済み手順書です。

## 構成図

```
Windows 10/11
  └─ VS Code (Remote-WSL)
        └─ WSL2 (Ubuntu 24.04 LTS, systemd有効)
              ├─ Docker Engine + Docker Compose
              ├─ Node.js 22 LTS
              ├─ Claude Code CLI
              └─ Playwright MCP Server
                    └─ Chromium（--executable-path で明示指定）
```

## 主な特徴

- 🐳 **Docker Desktop不要**: WSL2内にDocker Engineを直接インストール（systemd管理）
- 🎭 **Playwright MCP統合**: Claude Codeから直接ブラウザ操作（スクショ・スクレイピング）
- ✅ **実体験ベースのハマりポイント記載**:
  - `--executable-path` 必須（デフォルトでは `/opt/google/chrome/chrome` を探してエラー）
  - `claude mcp add -s user` でユーザーレベル設定（プロジェクト依存させない）
  - `wsl.conf` 書式エラーで起動不能になったら `wsl --unregister` で再インストール
- 📋 **仕様駆動開発スタイル**: 要件 → 設計 → タスクの3点セット
- 🧪 **検証済み**: Claude Code → Playwright MCP 経由で `localhost:8080` の nginx ページのスクリーンショット取得まで成功

## ドキュメント

| ファイル | 内容 | 行数 |
|---|---|---|
| [`docs/wsl-setup/requirements.md`](docs/wsl-setup/requirements.md) | 要件定義（決定事項・成功基準・実装時の重要な知見） | 190 |
| [`docs/wsl-setup/design.md`](docs/wsl-setup/design.md) | 詳細設計（システム構成図・技術スタック・エラーハンドリング） | 438 |
| [`docs/wsl-setup/tasks.md`](docs/wsl-setup/tasks.md) | タスクリスト（4フェーズ14タスクの実行可能な手順書） | 323 |

## クイックリファレンス

### 1. WSL2 + Ubuntu 24.04 セットアップ

```powershell
# Windows側（管理者PowerShell）
wsl --install -d Ubuntu-24.04
```

WSL内で `/etc/wsl.conf` を作成して systemd を有効化:

```bash
sudo bash -c 'cat > /etc/wsl.conf << EOF
[boot]
systemd=true

[interop]
appendWindowsPath=false
EOF'
```

Windows側で `wsl --shutdown` 後、再接続。

### 2. Docker Engine インストール（公式リポジトリから）

```bash
sudo apt update && \
sudo apt install -y ca-certificates curl gnupg && \
sudo install -m 0755 -d /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg && \
sudo chmod a+r /etc/apt/keyrings/docker.gpg && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
sudo apt update && \
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && \
sudo usermod -aG docker $USER && \
sudo systemctl enable --now docker
```

WSLを再起動（`exit` → `wsl --shutdown` → 再接続）後、`docker run hello-world` を確認。

### 3. Node.js + Claude Code CLI + Playwright

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g @anthropic-ai/claude-code
sudo npx playwright install-deps chromium
npx playwright install chromium
```

### 4. Playwright MCP 設定（最重要）

```bash
claude mcp remove -s user playwright 2>/dev/null
claude mcp add -s user playwright -- npx @playwright/mcp@latest \
  --executable-path $(find ~/.cache/ms-playwright -name "chrome" | head -1) \
  --headless

claude mcp list
# → playwright: ... - ✓ Connected と表示されればOK
```

### 5. 動作確認

```bash
mkdir -p ~/projects/sample-app && cd ~/projects/sample-app
cat > docker-compose.yml << 'EOF'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
EOF

docker compose up -d
claude
# Claude Code内で: Open a browser and navigate to http://localhost:8080, then take a screenshot
```

## トラブルシューティング

| 問題 | 原因 | 解決方法 |
|---|---|---|
| `wsl: Expected '=' in /etc/wsl.conf` | wsl.confの書式エラー | `wsl --unregister Ubuntu-24.04` で再インストール |
| `docker run` で `permission denied` | dockerグループ未参加 | WSL再起動（`exit` → `wsl --shutdown` → 再接続） |
| `npm install -g` で `EACCES` | 権限不足 | `sudo npm install -g ...` |
| `Chromium distribution 'chrome' is not found` | デフォルトパスを探している | `--executable-path` でchromiumパスを明示 |
| `MCP server ... Failed to connect` | 設定が反映されていない | `claude mcp remove` → 再設定 |
| MCP設定が見つからない | 別ディレクトリで設定された | `-s user` でユーザーレベル設定 |
| Chrome起動時にエラー | WSLでGUIなし | `--headless` オプション追加 |

詳細は [`docs/wsl-setup/tasks.md`](docs/wsl-setup/tasks.md) を参照してください。

## 動作確認済み環境

- WSL: 2.5.9.0
- Ubuntu: 24.04 LTS
- Docker Engine: 最新安定版（systemd管理）
- Node.js: 22.x LTS
- Playwright: 1.57.0
- Chromium実体パス例: `~/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`

## ライセンス

[MIT License](https://opensource.org/licenses/MIT)
