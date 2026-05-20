-- Google Drive を Google Workspace 連携の正式サービスとして扱うための差分。
-- 冪等: 何度実行しても不足カラムだけ追加されます。

ALTER TABLE "UserGoogleAccount"
  ADD COLUMN IF NOT EXISTS "lastDriveSyncAt" TIMESTAMP(3);

ALTER TABLE "UserGoogleAccount"
  ADD COLUMN IF NOT EXISTS "driveEnabled" BOOLEAN NOT NULL DEFAULT TRUE;
