# 要件定義書 - WSL Docker Compose + Playwright MCP 開発環境構築

> **作成日**: 2026-01-11
> **更新日**: 2026-01-14
> **ステータス**: 実装完了・検証済み ✓

### 決定事項

| 項目 | 選択 |
|------|------|
| Linuxディストリビューション | **Ubuntu 24.04 LTS** |
| Docker方式 | **WSL内にDocker Engine直接インストール**（Docker Desktop不使用） |
| Playwright連携 | **Playwright MCP Server (Microsoft公式)** `@playwright/mcp` |
| Playwrightブラウザ | **Chromium**（`--executable-path`で明示指定が必要） |
| 開発対象 | **Webアプリ（フロントエンド + バックエンド）** |

## 1. 目的

Windows PC上にWSL（Windows Subsystem for Linux）を使用して、以下の開発環境を構築する：

- **Docker Compose環境**: コンテナベースのアプリケーション開発・実行基盤
- **Playwright MCP連携**: ブラウザ自動化テスト・スクレイピングをClaude Codeから実行可能にする
- **VS Code + Claude Code統合**: AI支援によるアプリ開発ワークフローの実現
- **Webアプリ開発**: フロントエンド + バックエンドの開発環境

### 背景

- ローカル開発環境をコンテナ化することで、環境の再現性と移植性を確保
- PlaywrightのMCP（Model Context Protocol）サーバーを活用し、Claude Codeからブラウザ操作を可能にする
- VS Code上でClaude Codeを使用した効率的な開発体験を実現

## 2. 機能要件

### 2.1 必須機能

#### WSL環境構築
- [x] WSL2のインストールと有効化
- [x] Ubuntu 24.04 LTS ディストリビューションのセットアップ
- [x] WSLのsystemd有効化（Docker用）
- [x] 基本開発ツール（git, curl, wget等）のインストール

#### Docker環境構築
- [x] Docker Engineのインストール（WSL2内、Docker Desktop不使用）
- [x] Docker Composeのインストール（v2系）
- [x] Dockerデーモンの自動起動設定
- [x] 非rootユーザーでのDocker実行権限設定
- [x] Docker動作確認（hello-world等）

#### Playwright MCP環境構築
- [x] Node.js/npmのインストール（LTS版）
- [x] Claude Code CLIのインストール（`npm install -g @anthropic-ai/claude-code`）
- [x] Playwright MCP Server (Microsoft公式) の設定 (`@playwright/mcp`)
- [x] Playwrightブラウザ（Chromium）のインストール
- [x] Claude Code用MCP設定の構成（`--executable-path`オプション必須）

#### VS Code連携
- [x] VS Code Remote - WSL拡張機能の設定
- [x] Claude Code拡張機能との連携確認
- [x] WSL内のプロジェクトフォルダへのアクセス設定

### 2.2 オプション機能

- [ ] Playwright Test Runnerの設定
- [ ] カスタムDocker Compose開発テンプレート（Webアプリ用）
- [ ] 追加のMCPサーバー（filesystem, fetch等）の設定
- [ ] WSLリソース制限設定（.wslconfig）
- [ ] SSH鍵の設定とGitHub連携

## 3. 非機能要件

### 3.1 パフォーマンス

- Dockerコンテナの起動時間: 30秒以内
- Playwright MCPサーバーの応答時間: 5秒以内
- WSL2のメモリ使用量: 適切に制限可能であること
- ファイルI/O: WSL2ネイティブファイルシステム使用による高速化

### 3.2 セキュリティ

- Docker rootless実行または適切なユーザー権限管理
- MCPサーバーのローカル限定接続
- 機密情報（APIキー等）の安全な管理方法の確立

### 3.3 保守性

- 設定手順の文書化（再構築可能なレベル）
- Docker Composeファイルの明確なコメント記述
- バージョン情報の明記

### 3.4 互換性

- Windows 10（ビルド19041以降）またはWindows 11
- WSL2（WSL1は非対応）
- VS Code最新安定版
- Claude Code拡張機能との互換性

## 4. 制約事項

### 4.1 技術的制約

- **OS**: Windows 10/11 のみ
- **仮想化**: Hyper-Vまたは仮想マシンプラットフォームの有効化が必要
- **WSLバージョン**: WSL2必須
- **ファイルシステム**: WSL2ファイルシステム使用推奨（/mnt/c経由は低速）
- **Playwright MCP**: `--executable-path`でChromiumパスを明示指定が必要

### 4.2 環境制約

- 管理者権限でのWindowsセットアップが必要
- インターネット接続必須
- ディスク空き容量: 最低20GB以上推奨
- メモリ: 8GB以上推奨（16GB以上が望ましい）

## 5. 成功基準

### 5.1 完了の定義

- [x] WSL2でUbuntu 24.04 LTSが正常に動作する
- [x] `docker compose version`でバージョンが表示される
- [x] `docker compose up`でサンプルコンテナが起動する
- [x] Playwright MCPサーバーが起動し、Claude Codeから認識される
- [x] VS CodeからWSL内のファイルを編集できる
- [x] Claude CodeからPlaywright MCPを使ってブラウザ操作ができる ✓

### 5.2 受け入れテスト

1. **Docker動作テスト**: `docker run hello-world`が成功する ✓
2. **Playwright MCP動作テスト**: Claude Codeからブラウザ操作が実行できる ✓（nginxページのスクリーンショット取得成功）
3. **開発ワークフローテスト**: VS CodeでWSL内プロジェクトを開ける ✓

## 6. 想定されるリスクと実際に発生した問題

| リスク/問題 | 影響度 | 対策 |
|-------------|--------|------|
| WSL2インストール失敗 | 高 | BIOS仮想化設定の確認、Windows Updateの適用 |
| Dockerデーモン起動失敗 | 高 | systemd有効化、iptables設定確認 |
| wsl.conf書式エラー | 高 | WSL再インストールで解決 |
| Playwright MCPがchromeを探す | 高 | `--executable-path`でchromiumパスを明示指定 |
| npm グローバルインストール権限エラー | 中 | `sudo npm install -g`で解決 |
| MCP設定がプロジェクト単位で保存される | 中 | `-s user`でユーザーレベル設定 |

## 7. 実装時の重要な知見

### 7.1 Playwright MCP設定の正しい方法

```bash
# Chromiumのパスを確認
find ~/.cache/ms-playwright -name "chrome"
# 例: /home/sano/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome

# MCP設定（動的にパスを取得して設定）
claude mcp remove -s user playwright 2>/dev/null
claude mcp add -s user playwright -- npx @playwright/mcp@latest \
  --executable-path $(find ~/.cache/ms-playwright -name "chrome" | head -1) \
  --headless

# 設定確認
claude mcp list
# → playwright: ... - ✓ Connected と表示されればOK
```

### 7.2 直接設定ファイルを編集する場合

```json
// ~/.claude.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--executable-path",
        "/home/sano/.cache/ms-playwright/chromium-1200/chrome-linux64/chrome",
        "--headless"
      ]
    }
  }
}
```

## 付録: 用語定義

| 用語 | 説明 |
|------|------|
| WSL | Windows Subsystem for Linux |
| WSL2 | WSL version 2 - 完全なLinuxカーネルを使用 |
| Docker Compose | 複数コンテナを定義・管理するツール |
| Playwright | ブラウザ自動化ライブラリ（Microsoft製） |
| MCP | Model Context Protocol - AIモデルと外部ツールを連携 |
| executable-path | Playwrightが使用するブラウザの実行ファイルパス |
