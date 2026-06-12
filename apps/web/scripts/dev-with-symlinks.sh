#!/usr/bin/env bash
# Dropbox配下でNext.js devを安定稼働させるための起動ラッパー。
# Dropboxを停止して.nextへの介入を止めたうえで、シンボリックリンクを再構築してdev起動する。
# 終了時(Ctrl+C含む)にDropboxを自動で再起動する。

set -euo pipefail

WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BGM_DIR="$(cd "$WEB_DIR/../.." && pwd)"
TMP_NEXT="/tmp/bgm-web-next"

# 0) Dropboxを停止(同期介入を完全に止めるため)
if pgrep -x Dropbox >/dev/null 2>&1; then
  echo "[dev-with-symlinks] Dropboxを停止します(開発終了時に自動再起動)"
  osascript -e 'tell application "Dropbox" to quit' 2>/dev/null || killall Dropbox 2>/dev/null || true
  # 停止完了を待つ
  for _ in $(seq 1 10); do
    pgrep -x Dropbox >/dev/null 2>&1 || break
    sleep 1
  done
fi

# 終了時にDropboxを再起動
restart_dropbox() {
  echo ""
  echo "[dev-with-symlinks] Dropboxを再起動します"
  open -ga Dropbox 2>/dev/null || true
}
trap restart_dropbox EXIT

# 1) /tmp/bgm-web-next を用意 (一度作ったら以後は再利用してビルドキャッシュを温存)
mkdir -p "$TMP_NEXT"
# Next.jsが pages router 用の lstat を打つことがあり、無いとENOENTで500になる
mkdir -p "$TMP_NEXT/server/pages"

# 2) /tmp/bgm-web-next/node_modules -> bgm/node_modules のシンボリックリンクを保証
if [ ! -L "$TMP_NEXT/node_modules" ]; then
  rm -rf "$TMP_NEXT/node_modules"
  ln -s "$BGM_DIR/node_modules" "$TMP_NEXT/node_modules"
fi

# 3) bgm/apps/web/.next を /tmp/bgm-web-next へのシンボリックリンクに再構築
#    (Dropbox がリンクを実ディレクトリ化することがあるため毎回チェック)
if [ ! -L "$WEB_DIR/.next" ]; then
  rm -rf "$WEB_DIR/.next"
  ln -s "$TMP_NEXT" "$WEB_DIR/.next"
fi

echo "[dev-with-symlinks] .next -> $(readlink "$WEB_DIR/.next")"
echo "[dev-with-symlinks] $TMP_NEXT/node_modules -> $(readlink "$TMP_NEXT/node_modules")"

exec corepack pnpm exec next dev --port 3002 --turbopack
