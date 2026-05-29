#!/usr/bin/env bash
# Dropbox配下でNext.js devを安定稼働させるための起動ラッパー。
# .next と /tmp 側 node_modules のシンボリックリンクを毎回再構築してから dev を起動する。

set -euo pipefail

WEB_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BGM_DIR="$(cd "$WEB_DIR/../.." && pwd)"
TMP_NEXT="/tmp/bgm-web-next"

# 1) /tmp/bgm-web-next を用意 (一度作ったら以後は再利用してビルドキャッシュを温存)
mkdir -p "$TMP_NEXT"

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

exec corepack pnpm exec next dev --port 3002
