-- CallScenario: 組織ごとのAI電話シナリオ設定
CREATE TABLE IF NOT EXISTS "CallScenario" (
  "id" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "objective" TEXT NOT NULL,
  "openingTalk" TEXT NOT NULL,
  "requiredQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "optionalQuestions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "ngResponses" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "schedulingPolicy" TEXT NOT NULL,
  "handoffConditions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "completionCriteria" TEXT NOT NULL,
  "ragSources" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CallScenario_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CallScenario_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CallScenario_orgId_key_key" ON "CallScenario"("orgId", "key");
CREATE INDEX IF NOT EXISTS "CallScenario_orgId_enabled_idx" ON "CallScenario"("orgId", "enabled");
