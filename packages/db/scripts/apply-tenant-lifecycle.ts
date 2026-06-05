import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadRootEnvLocal() {
  const envPath = resolve(process.cwd(), '../../.env.local')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (!match) continue
    const key = match[1]
    let value = match[2].trim()
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
    process.env[key] = value
  }
}

async function main() {
  loadRootEnvLocal()
  const { prisma } = await import('../index')

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "TenantLifecycleStatus" AS ENUM ('ACTIVE', 'FREE', 'DEMO', 'INACTIVE');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Organization"
      ADD COLUMN IF NOT EXISTS "lifecycleStatus" "TenantLifecycleStatus"
      NOT NULL DEFAULT 'ACTIVE'::"TenantLifecycleStatus";
  `)

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Organization"
    ADD COLUMN IF NOT EXISTS "demoExpiresAt" TIMESTAMP(3);
  `)

  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Organization"
    ADD COLUMN IF NOT EXISTS "contractInfo" JSONB;
  `)

  await prisma.$executeRawUnsafe(`
    UPDATE "Organization"
    SET "lifecycleStatus" = 'DEMO'::"TenantLifecycleStatus"
    WHERE "slug" <> 'default'
      AND "plan" = 'FREE'
      AND "lifecycleStatus" = 'ACTIVE';
  `)

  await prisma.$executeRawUnsafe(`
    UPDATE "Organization"
    SET "lifecycleStatus" = 'DEMO'::"TenantLifecycleStatus"
    WHERE "lifecycleStatus" = 'FREE'::"TenantLifecycleStatus";
  `)

  console.log('tenant lifecycle columns ready')

  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
