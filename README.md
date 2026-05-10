# Claude Code Toolkit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Claude Code 用の **スキル** と **環境構築ガイド** をまとめたツールキット。

## 収録物

| 種類 | 名前 | 概要 |
|---|---|---|
| 🛠 スキル | [`skills/html2pptx-design`](skills/html2pptx-design/) | HTML+CSS で 1 回設計するだけで「画像版（ピクセルパーフェクト）」と「テキスト編集可能版」の PowerPoint を同時生成 |
| 📚 ガイド | [`docs/wsl-setup`](docs/wsl-setup/) | WSL2 + Docker Engine + Playwright MCP + Claude Code CLI の開発環境構築手順（実装完了・動作検証済み） |

---

# スキル

## html2pptx-design — HTML → PPTX デザインスライド作成

HTMLとCSSでスライドを 1 回設計すると、Playwright 経由で **2 種類の PPTX を同時に生成** する Claude Code スキル。

- **画像版** `<output>.pptx` — 各スライドを 1920×1080 でスクリーンショットしてフルスライド埋め込み。ピクセルパーフェクトだがテキスト編集不可。
- **テキスト編集可能版** `<output>-editable.pptx` — DOM を走査し `getComputedStyle` から位置・色・フォントを取得して、本物のテキストボックス＋角丸長方形/楕円として再構成。PowerPoint 上で文字を直接編集できる。

### インストール

```bash
# ユーザーレベル（全プロジェクトで使う）
mkdir -p ~/.claude/skills
cp -r skills/html2pptx-design ~/.claude/skills/

# またはプロジェクトローカル
mkdir -p .claude/skills
cp -r skills/html2pptx-design .claude/skills/
```

依存: `pip install playwright python-pptx && python -m playwright install chromium`

### 使い方

Claude Code に「デザインの良いスライドを作って」「編集できるプレゼンを作って」等と頼むとスキルが起動する。手動で実行する場合:

```bash
python ~/.claude/skills/html2pptx-design/scripts/render_slides.py ./slides.html ./deck.pptx
# -> ./deck.pptx           (画像版)
# -> ./deck-editable.pptx  (テキスト編集可能版)

# 片方だけ:
python ... ./slides.html ./deck.pptx --no-editable     # 画像版のみ
python ... ./slides.html ./deck.pptx --only-editable   # 編集可能版のみ
```

詳細は [`skills/html2pptx-design/SKILL.md`](skills/html2pptx-design/SKILL.md) と [`references/css-patterns.md`](skills/html2pptx-design/references/css-patterns.md) を参照。

---

# ガイド

## WSL Docker + Playwright MCP 開発環境構築ガイド

Windows上で **WSL2 + Ubuntu 24.04 LTS + Docker Engine（Docker Desktop不使用） + Playwright MCP + Claude Code CLI** を統合した、Webアプリ開発環境を構築するための実装完了・動作検証済み手順書。

### 構成図

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

### 主な特徴

- 🐳 **Docker Desktop不要**: WSL2内にDocker Engineを直接インストール（systemd管理）
- 🎭 **Playwright MCP統合**: Claude Codeから直接ブラウザ操作（スクショ・スクレイピング）
- ✅ **実体験ベースのハマりポイント記載**:
  - `--executable-path` 必須（デフォルトでは `/opt/google/chrome/chrome` を探してエラー）
  - `claude mcp add -s user` でユーザーレベル設定（プロジェクト依存させない）
  - `wsl.conf` 書式エラーで起動不能になったら `wsl --unregister` で再インストール
- 📋 **仕様駆動開発スタイル**: 要件 → 設計 → タスクの3点セット
- 🧪 **検証済み**: Claude Code → Playwright MCP 経由で `localhost:8080` の nginx ページのスクリーンショット取得まで成功

### ドキュメント

| ファイル | 内容 | 行数 |
|---|---|---|
| [`docs/wsl-setup/requirements.md`](docs/wsl-setup/requirements.md) | 要件定義（決定事項・成功基準・実装時の重要な知見） | 190 |
| [`docs/wsl-setup/design.md`](docs/wsl-setup/design.md) | 詳細設計（システム構成図・技術スタック・エラーハンドリング） | 438 |
| [`docs/wsl-setup/tasks.md`](docs/wsl-setup/tasks.md) | タスクリスト（4フェーズ14タスクの実行可能な手順書） | 323 |

### クイックリファレンス

#### 1. WSL2 + Ubuntu 24.04 セットアップ

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

#### 2. Docker Engine インストール（公式リポジトリから）

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

#### 3. Node.js + Claude Code CLI + Playwright

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g @anthropic-ai/claude-code
sudo npx playwright install-deps chromium
npx playwright install chromium
```

#### 4. Playwright MCP 設定（最重要）

```bash
claude mcp remove -s user playwright 2>/dev/null
claude mcp add -s user playwright -- npx @playwright/mcp@latest \
  --executable-path $(find ~/.cache/ms-playwright -name "chrome" | head -1) \
  --headless

claude mcp list
# → playwright: ... - ✓ Connected と表示されればOK
```

#### 5. 動作確認

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

### トラブルシューティング

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

### 動作確認済み環境

- WSL: 2.5.9.0
- Ubuntu: 24.04 LTS
- Docker Engine: 最新安定版（systemd管理）
- Node.js: 22.x LTS
- Playwright: 1.57.0
- Chromium実体パス例: `~/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome`

---

## ライセンス

[MIT License](https://opensource.org/licenses/MIT)
