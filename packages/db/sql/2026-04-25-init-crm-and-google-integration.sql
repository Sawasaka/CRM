-- ============================================================================
-- BGM CRM スキーマ初期化 SQL（冪等版・既存テーブル補完対応）
--
-- このSQLは Supabase の SQL Editor で 何度実行しても安全 です。
-- 既存テーブルがある場合は ALTER TABLE ADD COLUMN IF NOT EXISTS で
-- 不足カラムだけを追加します。旧 ABM テーブル（小文字 snake_case）には
-- 一切触りません。
-- ============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
DO $$ BEGIN CREATE TYPE "Plan" AS ENUM ('FREE', 'STARTER', 'GROWTH', 'ENTERPRISE') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'REP') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "EmployeeRange" AS ENUM ('E1_10', 'E11_50', 'E51_200', 'E201_1000', 'E1000_PLUS') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "RevenueRange" AS ENUM ('R_UNDER_10M', 'R10M_100M', 'R100M_1B', 'R1B_PLUS') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "LeadRank" AS ENUM ('S', 'A', 'B', 'C', 'D') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "LeadSource" AS ENUM ('HP_INQUIRY', 'PRICING_INQUIRY', 'DOCUMENT_REQUEST', 'SEMINAR_OWN', 'SEMINAR_CO', 'REFERRAL', 'EVENT', 'PAID_SEARCH', 'PAID_SOCIAL', 'ORGANIC', 'PARTNER', 'CSV_IMPORT') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "ApproachStatus" AS ENUM ('NOT_STARTED', 'NO_ANSWER', 'ABSENT', 'CONNECTED', 'DO_NOT_CALL', 'APPOINTMENT_SET', 'NEXT_ACTION') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "SequenceStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'GRADUATED', 'DOWNGRADED') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "CallResult" AS ENUM ('CONNECTED_INTERESTED', 'CONNECTED_FOLLOWUP_REQUESTED', 'CONNECTED_NO_INTEREST', 'MEETING_BOOKED', 'NO_ANSWER', 'CALLBACK_REQUESTED', 'DEPARTMENT_CONNECTED_ABSENT', 'WRONG_CONTACT', 'INVALID_NUMBER', 'DO_NOT_CALL') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "DealStage" AS ENUM ('NEW_LEAD', 'QUALIFIED', 'FIRST_MEETING', 'SOLUTION_FIT', 'PROPOSAL', 'NEGOTIATION', 'VERBAL_COMMIT', 'CLOSED_WON', 'CLOSED_LOST') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "ActivityType" AS ENUM ('CALL', 'EMAIL_SENT', 'EMAIL_RECEIVED', 'MEETING', 'NOTE', 'STAGE_CHANGED', 'TASK_COMPLETED', 'SEQUENCE_STARTED', 'SEQUENCE_COMPLETED', 'SCORE_CHANGED') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "TaskType" AS ENUM ('CALL', 'EMAIL', 'DOCUMENT', 'MEETING_PREP', 'PROPOSAL', 'OTHER') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "TaskSource" AS ENUM ('SEQUENCE_AUTO', 'MODAL_MANUAL', 'MEETING_NOTES', 'MANUAL') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "TranscriptType" AS ENUM ('CALL', 'MEETING') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "TranscriptSource" AS ENUM ('MANUAL', 'GOOGLE_MEET', 'ZOOM', 'OTHER') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "EnrichmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "OfficeType" AS ENUM ('HEADQUARTERS', 'BRANCH', 'SALES_OFFICE', 'FACTORY', 'LAB', 'OTHER') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "DepartmentType" AS ENUM ('SALES', 'MARKETING', 'ENGINEERING', 'IT', 'HR', 'FINANCE', 'LEGAL', 'OPERATIONS', 'MANAGEMENT', 'RD', 'CS', 'OTHER') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "IntentSignalType" AS ENUM ('JOB_POSTING', 'PRESS_RELEASE', 'NEWS', 'FUNDING', 'PRODUCT_LAUNCH', 'EVENT', 'OTHER') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "IntentLevel" AS ENUM ('HOT', 'MIDDLE', 'LOW', 'NONE') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "EmailDirection" AS ENUM ('SENT', 'RECEIVED') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'HELD', 'COMPLETED', 'CANCELED') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateEnum
DO $$ BEGIN CREATE TYPE "MeetingType" AS ENUM ('FIRST', 'FOLLOW_UP', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'OTHER') ; EXCEPTION WHEN duplicate_object THEN null; END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'REP',
    "avatarUrl" TEXT,
    "googleUserId" TEXT,
    "slackUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "phone" TEXT,
    "industry" TEXT,
    "employeeRange" "EmployeeRange",
    "revenueRange" "RevenueRange",
    "prefecture" TEXT,
    "corporateNumber" TEXT,
    "masterCompanyId" TEXT,
    "leadSource" "LeadSource",
    "leadScore" INTEGER NOT NULL DEFAULT 0,
    "leadRank" "LeadRank" NOT NULL DEFAULT 'D',
    "ownerId" TEXT NOT NULL,
    "lastScoreCalcAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "title" TEXT,
    "department" TEXT,
    "isDecisionMaker" BOOLEAN NOT NULL DEFAULT false,
    "isOwnerId" TEXT,
    "approachStatus" "ApproachStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "callAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastCallAt" TIMESTAMP(3),
    "lastCallResult" "CallResult",
    "emailSentCount" INTEGER NOT NULL DEFAULT 0,
    "lastEmailAt" TIMESTAMP(3),
    "lastEmailOpenAt" TIMESTAMP(3),
    "nextActionAt" TIMESTAMP(3),
    "currentSeqId" TEXT,
    "sequenceStatus" "SequenceStatus",
    "bestCallTimeSlot" TEXT,
    "doNotContact" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Deal" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "contactId" TEXT,
    "ownerId" TEXT NOT NULL,
    "stage" "DealStage" NOT NULL DEFAULT 'NEW_LEAD',
    "amount" INTEGER,
    "expectedCloseAt" TIMESTAMP(3),
    "probability" INTEGER,
    "painPoints" TEXT,
    "budget" TEXT,
    "desiredService" TEXT,
    "timeline" TEXT,
    "decisionMaker" TEXT,
    "competitors" TEXT,
    "blockers" TEXT,
    "currentSolution" TEXT,
    "nextActionUs" TEXT,
    "nextActionCust" TEXT,
    "fieldMeta" JSONB,
    "lostReason" TEXT,
    "lostReasonAiSug" TEXT,
    "stalledAt" TIMESTAMP(3),
    "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT,
    "contactId" TEXT,
    "companyId" TEXT,
    "userId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "resultCode" "CallResult",
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT,
    "contactId" TEXT,
    "companyId" TEXT,
    "ownerId" TEXT NOT NULL,
    "type" "TaskType" NOT NULL,
    "title" TEXT NOT NULL,
    "memo" TEXT,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "resultCode" "CallResult",
    "source" "TaskSource" NOT NULL,
    "reminderSettings" JSONB,
    "sequenceId" TEXT,
    "sequenceStepIdx" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ScoreEvent" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "signal" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Sequence" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" "LeadRank" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SequenceStep" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "type" "TaskType" NOT NULL,
    "dayOffset" INTEGER NOT NULL,
    "subject" TEXT,
    "bodyTmpl" TEXT,

    CONSTRAINT "SequenceStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Transcript" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "dealId" TEXT,
    "companyId" TEXT,
    "contactId" TEXT,
    "type" "TranscriptType" NOT NULL,
    "fullText" TEXT NOT NULL,
    "audioUrl" TEXT,
    "durationSec" INTEGER,
    "extractedFields" JSONB,
    "confidence" JSONB,
    "stageAdvanced" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meetingEventId" TEXT,
    "conferenceRecordId" TEXT,
    "googleDocId" TEXT,
    "googleDocUrl" TEXT,
    "source" "TranscriptSource" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "StageHistory" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "fromStage" "DealStage",
    "toStage" "DealStage" NOT NULL,
    "changedBy" TEXT NOT NULL,
    "reason" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ResearchBrief" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessSummary" TEXT,
    "industry" TEXT,
    "employeeCount" TEXT,
    "foundedYear" TEXT,
    "fundingStatus" TEXT,
    "ceoName" TEXT,
    "ceoBackground" TEXT,
    "challenges" JSONB,
    "salesOrgHypothesis" TEXT,
    "toolsUsed" JSONB,
    "recommendedApproach" TEXT,
    "questionsToAsk" JSONB,
    "rawData" JSONB,
    "confidence" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchBrief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KnowledgeDoc" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeDoc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "KnowledgeChunk" (
    "id" TEXT NOT NULL,
    "docId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "chunkIndex" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "RagQuery" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sources" JSONB,
    "confidence" DOUBLE PRECISION,
    "feedback" INTEGER,
    "slackTs" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RagQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyMaster" (
    "id" TEXT NOT NULL,
    "corporateNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKana" TEXT,
    "websiteUrl" TEXT,
    "prefecture" TEXT NOT NULL,
    "city" TEXT,
    "address" TEXT,
    "corporateType" TEXT NOT NULL,
    "industryId" TEXT,
    "serviceSummary" TEXT,
    "companyFeatures" TEXT,
    "employeeCount" TEXT,
    "revenue" TEXT,
    "representative" TEXT,
    "representativePhone" TEXT,
    "representativeEmail" TEXT,
    "enrichmentStatus" "EnrichmentStatus" NOT NULL DEFAULT 'PENDING',
    "sourceId" TEXT,
    "lastCrawledAt" TIMESTAMP(3),
    "lastEnrichedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Industry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Industry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ServiceTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyServiceTag" (
    "companyMasterId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyServiceTag_pkey" PRIMARY KEY ("companyMasterId","tagId")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Office" (
    "id" TEXT NOT NULL,
    "companyMasterId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "officeType" "OfficeType" NOT NULL DEFAULT 'BRANCH',
    "prefecture" TEXT,
    "city" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "websiteUrl" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Department" (
    "id" TEXT NOT NULL,
    "companyMasterId" TEXT NOT NULL,
    "officeId" TEXT,
    "parentDepartmentId" TEXT,
    "name" TEXT NOT NULL,
    "departmentType" "DepartmentType",
    "headcount" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactPersonName" TEXT,
    "contactPersonTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "IntentSignal" (
    "id" TEXT NOT NULL,
    "companyMasterId" TEXT NOT NULL,
    "departmentType" "DepartmentType",
    "departmentId" TEXT,
    "signalType" "IntentSignalType" NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntentSignal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CompanyIntent" (
    "id" TEXT NOT NULL,
    "companyMasterId" TEXT NOT NULL,
    "departmentType" "DepartmentType" NOT NULL,
    "departmentId" TEXT,
    "intentLevel" "IntentLevel" NOT NULL DEFAULT 'NONE',
    "signalCount" INTEGER NOT NULL DEFAULT 0,
    "latestSignalAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UserGoogleAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "gmailHistoryId" TEXT,
    "calendarSyncToken" TEXT,
    "lastGmailSyncAt" TIMESTAMP(3),
    "lastDriveSyncAt" TIMESTAMP(3),
    "lastCalendarSyncAt" TIMESTAMP(3),
    "lastMeetSyncAt" TIMESTAMP(3),
    "driveEnabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoogleAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "EmailMessage" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT NOT NULL,
    "subject" TEXT,
    "snippet" TEXT,
    "bodyText" TEXT,
    "bodyHtml" TEXT,
    "fromAddress" TEXT NOT NULL,
    "fromName" TEXT,
    "toAddresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "ccAddresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sentAt" TIMESTAMP(3) NOT NULL,
    "direction" "EmailDirection" NOT NULL,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactId" TEXT,
    "companyId" TEXT,
    "dealId" TEXT,
    "matchedBy" TEXT,
    "rawHeaders" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "MeetingEvent" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL DEFAULT 'primary',
    "calendarEventId" TEXT NOT NULL,
    "iCalUID" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "meetUrl" TEXT,
    "meetCode" TEXT,
    "conferenceId" TEXT,
    "attendeeEmails" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "organizerEmail" TEXT,
    "primaryContactId" TEXT,
    "contactIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "companyId" TEXT,
    "dealId" TEXT,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "occurrenceIndex" INTEGER,
    "meetingType" "MeetingType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MeetingEvent_pkey" PRIMARY KEY ("id")
);


-- ============================================================================
-- ALTER TABLE: 既存テーブルに不足しているカラムを補完
-- ============================================================================

-- AlterTable: Organization に新カラムを補完
DO $$ BEGIN ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Organization.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Organization.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "slug" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Organization.slug already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "plan" "Plan" NOT NULL DEFAULT 'FREE' ; EXCEPTION WHEN others THEN raise notice 'col Organization.plan already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Organization.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Organization.updatedAt already ok'; END $$;

-- AlterTable: User に新カラムを補完
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col User.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col User.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col User.email already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col User.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'REP' ; EXCEPTION WHEN others THEN raise notice 'col User.role already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col User.avatarUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "googleUserId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col User.googleUserId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "slackUserId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col User.slackUserId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col User.createdAt already ok'; END $$;

-- AlterTable: Company に新カラムを補完
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Company.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Company.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Company.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "domain" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Company.domain already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "phone" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Company.phone already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "industry" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Company.industry already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "employeeRange" "EmployeeRange" ; EXCEPTION WHEN others THEN raise notice 'col Company.employeeRange already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "revenueRange" "RevenueRange" ; EXCEPTION WHEN others THEN raise notice 'col Company.revenueRange already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "prefecture" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Company.prefecture already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "corporateNumber" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Company.corporateNumber already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "masterCompanyId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Company.masterCompanyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "leadSource" "LeadSource" ; EXCEPTION WHEN others THEN raise notice 'col Company.leadSource already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "leadScore" INTEGER NOT NULL DEFAULT 0 ; EXCEPTION WHEN others THEN raise notice 'col Company.leadScore already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "leadRank" "LeadRank" NOT NULL DEFAULT 'D' ; EXCEPTION WHEN others THEN raise notice 'col Company.leadRank already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "ownerId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Company.ownerId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "lastScoreCalcAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Company.lastScoreCalcAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Company.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Company.updatedAt already ok'; END $$;

-- AlterTable: Contact に新カラムを補完
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Contact.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Contact.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "companyId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Contact.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Contact.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "email" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.email already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "phone" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.phone already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "title" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.title already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "department" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.department already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "isDecisionMaker" BOOLEAN NOT NULL DEFAULT false ; EXCEPTION WHEN others THEN raise notice 'col Contact.isDecisionMaker already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "isOwnerId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.isOwnerId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "approachStatus" "ApproachStatus" NOT NULL DEFAULT 'NOT_STARTED' ; EXCEPTION WHEN others THEN raise notice 'col Contact.approachStatus already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "callAttempts" INTEGER NOT NULL DEFAULT 0 ; EXCEPTION WHEN others THEN raise notice 'col Contact.callAttempts already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "lastCallAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Contact.lastCallAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "lastCallResult" "CallResult" ; EXCEPTION WHEN others THEN raise notice 'col Contact.lastCallResult already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "emailSentCount" INTEGER NOT NULL DEFAULT 0 ; EXCEPTION WHEN others THEN raise notice 'col Contact.emailSentCount already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "lastEmailAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Contact.lastEmailAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "lastEmailOpenAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Contact.lastEmailOpenAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "nextActionAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Contact.nextActionAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "currentSeqId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.currentSeqId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "sequenceStatus" "SequenceStatus" ; EXCEPTION WHEN others THEN raise notice 'col Contact.sequenceStatus already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "bestCallTimeSlot" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Contact.bestCallTimeSlot already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "doNotContact" BOOLEAN NOT NULL DEFAULT false ; EXCEPTION WHEN others THEN raise notice 'col Contact.doNotContact already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Contact.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Contact" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Contact.updatedAt already ok'; END $$;

-- AlterTable: Deal に新カラムを補完
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Deal.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Deal.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Deal.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "companyId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Deal.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "contactId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.contactId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "ownerId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Deal.ownerId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "stage" "DealStage" NOT NULL DEFAULT 'NEW_LEAD' ; EXCEPTION WHEN others THEN raise notice 'col Deal.stage already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "amount" INTEGER ; EXCEPTION WHEN others THEN raise notice 'col Deal.amount already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "expectedCloseAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Deal.expectedCloseAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "probability" INTEGER ; EXCEPTION WHEN others THEN raise notice 'col Deal.probability already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "painPoints" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.painPoints already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "budget" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.budget already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "desiredService" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.desiredService already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "timeline" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.timeline already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "decisionMaker" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.decisionMaker already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "competitors" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.competitors already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "blockers" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.blockers already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "currentSolution" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.currentSolution already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "nextActionUs" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.nextActionUs already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "nextActionCust" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.nextActionCust already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "fieldMeta" JSONB ; EXCEPTION WHEN others THEN raise notice 'col Deal.fieldMeta already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "lostReason" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.lostReason already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "lostReasonAiSug" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Deal.lostReasonAiSug already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "stalledAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Deal.stalledAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "stageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Deal.stageChangedAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Deal.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Deal" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Deal.updatedAt already ok'; END $$;

-- AlterTable: Activity に新カラムを補完
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Activity.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Activity.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "dealId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Activity.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "contactId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Activity.contactId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "companyId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Activity.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Activity.userId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "type" "ActivityType" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Activity.type already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Activity.title already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "content" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Activity.content already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "resultCode" "CallResult" ; EXCEPTION WHEN others THEN raise notice 'col Activity.resultCode already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "metadata" JSONB ; EXCEPTION WHEN others THEN raise notice 'col Activity.metadata already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Activity.occurredAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Activity" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Activity.createdAt already ok'; END $$;

-- AlterTable: Task に新カラムを補完
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dealId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Task.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "contactId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Task.contactId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "companyId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Task.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "ownerId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.ownerId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "type" "TaskType" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.type already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.title already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "memo" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Task.memo already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "dueAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.dueAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col Task.completedAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "resultCode" "CallResult" ; EXCEPTION WHEN others THEN raise notice 'col Task.resultCode already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "source" "TaskSource" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Task.source already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "reminderSettings" JSONB ; EXCEPTION WHEN others THEN raise notice 'col Task.reminderSettings already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "sequenceId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Task.sequenceId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "sequenceStepIdx" INTEGER ; EXCEPTION WHEN others THEN raise notice 'col Task.sequenceStepIdx already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Task.createdAt already ok'; END $$;

-- AlterTable: ScoreEvent に新カラムを補完
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ScoreEvent.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD COLUMN IF NOT EXISTS "companyId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ScoreEvent.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD COLUMN IF NOT EXISTS "signal" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ScoreEvent.signal already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD COLUMN IF NOT EXISTS "points" INTEGER NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ScoreEvent.points already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD COLUMN IF NOT EXISTS "metadata" JSONB ; EXCEPTION WHEN others THEN raise notice 'col ScoreEvent.metadata already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD COLUMN IF NOT EXISTS "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col ScoreEvent.occurredAt already ok'; END $$;

-- AlterTable: Sequence に新カラムを補完
DO $$ BEGIN ALTER TABLE "Sequence" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Sequence.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Sequence" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Sequence.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Sequence" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Sequence.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Sequence" ADD COLUMN IF NOT EXISTS "rank" "LeadRank" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Sequence.rank already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Sequence" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Sequence.createdAt already ok'; END $$;

-- AlterTable: SequenceStep に新カラムを補完
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "sequenceId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.sequenceId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "stepOrder" INTEGER NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.stepOrder already ok'; END $$;
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "type" "TaskType" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.type already ok'; END $$;
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "dayOffset" INTEGER NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.dayOffset already ok'; END $$;
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "subject" TEXT ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.subject already ok'; END $$;
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD COLUMN IF NOT EXISTS "bodyTmpl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col SequenceStep.bodyTmpl already ok'; END $$;

-- AlterTable: Transcript に新カラムを補完
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Transcript.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Transcript.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "dealId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "companyId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "contactId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.contactId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "type" "TranscriptType" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Transcript.type already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "fullText" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Transcript.fullText already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "audioUrl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.audioUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "durationSec" INTEGER ; EXCEPTION WHEN others THEN raise notice 'col Transcript.durationSec already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "extractedFields" JSONB ; EXCEPTION WHEN others THEN raise notice 'col Transcript.extractedFields already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "confidence" JSONB ; EXCEPTION WHEN others THEN raise notice 'col Transcript.confidence already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "stageAdvanced" BOOLEAN NOT NULL DEFAULT false ; EXCEPTION WHEN others THEN raise notice 'col Transcript.stageAdvanced already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Transcript.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "meetingEventId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.meetingEventId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "conferenceRecordId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.conferenceRecordId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "googleDocId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.googleDocId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "googleDocUrl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Transcript.googleDocUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Transcript" ADD COLUMN IF NOT EXISTS "source" "TranscriptSource" NOT NULL DEFAULT 'MANUAL' ; EXCEPTION WHEN others THEN raise notice 'col Transcript.source already ok'; END $$;

-- AlterTable: StageHistory に新カラムを補完
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "dealId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "fromStage" "DealStage" ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.fromStage already ok'; END $$;
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "toStage" "DealStage" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.toStage already ok'; END $$;
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "changedBy" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.changedBy already ok'; END $$;
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "reason" TEXT ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.reason already ok'; END $$;
DO $$ BEGIN ALTER TABLE "StageHistory" ADD COLUMN IF NOT EXISTS "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col StageHistory.changedAt already ok'; END $$;

-- AlterTable: ResearchBrief に新カラムを補完
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "dealId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "companyName" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.companyName already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "businessSummary" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.businessSummary already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "industry" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.industry already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "employeeCount" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.employeeCount already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "foundedYear" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.foundedYear already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "fundingStatus" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.fundingStatus already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "ceoName" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.ceoName already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "ceoBackground" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.ceoBackground already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "challenges" JSONB ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.challenges already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "salesOrgHypothesis" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.salesOrgHypothesis already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "toolsUsed" JSONB ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.toolsUsed already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "recommendedApproach" TEXT ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.recommendedApproach already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "questionsToAsk" JSONB ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.questionsToAsk already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "rawData" JSONB ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.rawData already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "confidence" JSONB ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.confidence already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD COLUMN IF NOT EXISTS "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col ResearchBrief.generatedAt already ok'; END $$;

-- AlterTable: KnowledgeDoc に新カラムを補完
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "sourceType" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.sourceType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "sourceId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.sourceId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "fileName" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.fileName already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "fileUrl" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.fileUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "mimeType" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.mimeType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "lastModified" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.lastModified already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD COLUMN IF NOT EXISTS "indexedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeDoc.indexedAt already ok'; END $$;

-- AlterTable: KnowledgeChunk に新カラムを補完
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "docId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.docId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.content already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "embedding" vector(1536) ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.embedding already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "metadata" JSONB ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.metadata already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "chunkIndex" INTEGER NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.chunkIndex already ok'; END $$;
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col KnowledgeChunk.createdAt already ok'; END $$;

-- AlterTable: RagQuery に新カラムを補完
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "userId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.userId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "query" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.query already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "answer" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.answer already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "sources" JSONB ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.sources already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "confidence" DOUBLE PRECISION ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.confidence already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "feedback" INTEGER ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.feedback already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "slackTs" TEXT ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.slackTs already ok'; END $$;
DO $$ BEGIN ALTER TABLE "RagQuery" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col RagQuery.createdAt already ok'; END $$;

-- AlterTable: CompanyMaster に新カラムを補完
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "corporateNumber" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.corporateNumber already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "nameKana" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.nameKana already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.websiteUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "prefecture" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.prefecture already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "city" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.city already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "address" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.address already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "corporateType" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.corporateType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "industryId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.industryId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "serviceSummary" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.serviceSummary already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "companyFeatures" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.companyFeatures already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "employeeCount" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.employeeCount already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "revenue" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.revenue already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "representative" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.representative already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "representativePhone" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.representativePhone already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "representativeEmail" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.representativeEmail already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "enrichmentStatus" "EnrichmentStatus" NOT NULL DEFAULT 'PENDING' ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.enrichmentStatus already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "sourceId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.sourceId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "lastCrawledAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.lastCrawledAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "lastEnrichedAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.lastEnrichedAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyMaster.updatedAt already ok'; END $$;

-- AlterTable: Industry に新カラムを補完
DO $$ BEGIN ALTER TABLE "Industry" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Industry.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Industry" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Industry.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Industry" ADD COLUMN IF NOT EXISTS "category" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Industry.category already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Industry" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Industry.createdAt already ok'; END $$;

-- AlterTable: ServiceTag に新カラムを補完
DO $$ BEGIN ALTER TABLE "ServiceTag" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ServiceTag.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ServiceTag" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col ServiceTag.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "ServiceTag" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col ServiceTag.createdAt already ok'; END $$;

-- AlterTable: CompanyServiceTag に新カラムを補完
DO $$ BEGIN ALTER TABLE "CompanyServiceTag" ADD COLUMN IF NOT EXISTS "companyMasterId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyServiceTag.companyMasterId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyServiceTag" ADD COLUMN IF NOT EXISTS "tagId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyServiceTag.tagId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyServiceTag" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col CompanyServiceTag.createdAt already ok'; END $$;

-- AlterTable: Office に新カラムを補完
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Office.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "companyMasterId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Office.companyMasterId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Office.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "officeType" "OfficeType" NOT NULL DEFAULT 'BRANCH' ; EXCEPTION WHEN others THEN raise notice 'col Office.officeType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "prefecture" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Office.prefecture already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "city" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Office.city already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "address" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Office.address already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "phone" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Office.phone already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Office.websiteUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "isPrimary" BOOLEAN NOT NULL DEFAULT false ; EXCEPTION WHEN others THEN raise notice 'col Office.isPrimary already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Office.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Office" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Office.updatedAt already ok'; END $$;

-- AlterTable: Department に新カラムを補完
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Department.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "companyMasterId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Department.companyMasterId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "officeId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.officeId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "parentDepartmentId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.parentDepartmentId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Department.name already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "departmentType" "DepartmentType" ; EXCEPTION WHEN others THEN raise notice 'col Department.departmentType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "headcount" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.headcount already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "description" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.description already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "phone" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.phone already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "email" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.email already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "contactPersonName" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.contactPersonName already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "contactPersonTitle" TEXT ; EXCEPTION WHEN others THEN raise notice 'col Department.contactPersonTitle already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col Department.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col Department.updatedAt already ok'; END $$;

-- AlterTable: IntentSignal に新カラムを補完
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "companyMasterId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.companyMasterId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "departmentType" "DepartmentType" ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.departmentType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "departmentId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.departmentId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "signalType" "IntentSignalType" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.signalType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.source already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "sourceUrl" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.sourceUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.title already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "description" TEXT ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.description already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.publishedAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "rawData" JSONB ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.rawData already ok'; END $$;
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col IntentSignal.createdAt already ok'; END $$;

-- AlterTable: CompanyIntent に新カラムを補完
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "companyMasterId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.companyMasterId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "departmentType" "DepartmentType" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.departmentType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "departmentId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.departmentId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "intentLevel" "IntentLevel" NOT NULL DEFAULT 'NONE' ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.intentLevel already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "signalCount" INTEGER NOT NULL DEFAULT 0 ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.signalCount already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "latestSignalAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.latestSignalAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col CompanyIntent.updatedAt already ok'; END $$;

-- AlterTable: UserGoogleAccount に新カラムを補完
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.userId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "googleSub" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.googleSub already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.email already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "accessToken" TEXT ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.accessToken already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.refreshToken already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.expiresAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "scope" TEXT ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.scope already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "gmailHistoryId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.gmailHistoryId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "calendarSyncToken" TEXT ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.calendarSyncToken already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "lastGmailSyncAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.lastGmailSyncAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "lastDriveSyncAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.lastDriveSyncAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "lastCalendarSyncAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.lastCalendarSyncAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "lastMeetSyncAt" TIMESTAMP(3) ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.lastMeetSyncAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "driveEnabled" BOOLEAN NOT NULL DEFAULT TRUE ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.driveEnabled already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col UserGoogleAccount.updatedAt already ok'; END $$;

-- AlterTable: EmailMessage に新カラムを補完
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.userId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "gmailMessageId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.gmailMessageId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "gmailThreadId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.gmailThreadId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "subject" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.subject already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "snippet" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.snippet already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "bodyText" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.bodyText already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "bodyHtml" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.bodyHtml already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "fromAddress" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.fromAddress already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "fromName" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.fromName already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "toAddresses" TEXT[] DEFAULT ARRAY[]::TEXT[] ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.toAddresses already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "ccAddresses" TEXT[] DEFAULT ARRAY[]::TEXT[] ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.ccAddresses already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "sentAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.sentAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "direction" "EmailDirection" NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.direction already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "labels" TEXT[] DEFAULT ARRAY[]::TEXT[] ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.labels already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "contactId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.contactId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "companyId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "dealId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "matchedBy" TEXT ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.matchedBy already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "rawHeaders" JSONB ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.rawHeaders already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col EmailMessage.updatedAt already ok'; END $$;

-- AlterTable: MeetingEvent に新カラムを補完
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "id" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.id already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "orgId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.orgId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.userId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "calendarId" TEXT NOT NULL DEFAULT 'primary' ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.calendarId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "calendarEventId" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.calendarEventId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "iCalUID" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.iCalUID already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.title already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "description" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.description already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "startsAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.startsAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "endsAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.endsAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "meetUrl" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.meetUrl already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "meetCode" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.meetCode already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "conferenceId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.conferenceId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "attendeeEmails" TEXT[] DEFAULT ARRAY[]::TEXT[] ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.attendeeEmails already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "organizerEmail" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.organizerEmail already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "primaryContactId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.primaryContactId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "contactIds" TEXT[] DEFAULT ARRAY[]::TEXT[] ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.contactIds already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "companyId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.companyId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "dealId" TEXT ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.dealId already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED' ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.status already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "occurrenceIndex" INTEGER ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.occurrenceIndex already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "meetingType" "MeetingType" ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.meetingType already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.createdAt already ok'; END $$;
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL ; EXCEPTION WHEN others THEN raise notice 'col MeetingEvent.updatedAt already ok'; END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_orgId_idx" ON "User"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_orgId_email_key" ON "User"("orgId", "email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_orgId_leadScore_idx" ON "Company"("orgId", "leadScore" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_orgId_domain_idx" ON "Company"("orgId", "domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_orgId_leadRank_idx" ON "Company"("orgId", "leadRank");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Company_orgId_masterCompanyId_idx" ON "Company"("orgId", "masterCompanyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Contact_orgId_approachStatus_idx" ON "Contact"("orgId", "approachStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Contact_orgId_companyId_idx" ON "Contact"("orgId", "companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Contact_orgId_doNotContact_idx" ON "Contact"("orgId", "doNotContact");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_orgId_stage_idx" ON "Deal"("orgId", "stage");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_orgId_ownerId_idx" ON "Deal"("orgId", "ownerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_orgId_stalledAt_idx" ON "Deal"("orgId", "stalledAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Deal_orgId_updatedAt_idx" ON "Deal"("orgId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Activity_orgId_dealId_idx" ON "Activity"("orgId", "dealId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Activity_orgId_contactId_idx" ON "Activity"("orgId", "contactId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Activity_orgId_occurredAt_idx" ON "Activity"("orgId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Task_ownerId_dueAt_idx" ON "Task"("ownerId", "dueAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Task_ownerId_completedAt_idx" ON "Task"("ownerId", "completedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Task_orgId_dueAt_idx" ON "Task"("orgId", "dueAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ScoreEvent_companyId_occurredAt_idx" ON "ScoreEvent"("companyId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Sequence_orgId_rank_idx" ON "Sequence"("orgId", "rank");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SequenceStep_sequenceId_stepOrder_idx" ON "SequenceStep"("sequenceId", "stepOrder");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Transcript_meetingEventId_key" ON "Transcript"("meetingEventId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Transcript_conferenceRecordId_key" ON "Transcript"("conferenceRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transcript_dealId_createdAt_idx" ON "Transcript"("dealId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Transcript_conferenceRecordId_idx" ON "Transcript"("conferenceRecordId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "StageHistory_dealId_changedAt_idx" ON "StageHistory"("dealId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ResearchBrief_dealId_key" ON "ResearchBrief"("dealId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KnowledgeDoc_orgId_idx" ON "KnowledgeDoc"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeDoc_orgId_sourceId_key" ON "KnowledgeDoc"("orgId", "sourceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KnowledgeChunk_docId_idx" ON "KnowledgeChunk"("docId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RagQuery_orgId_createdAt_idx" ON "RagQuery"("orgId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CompanyMaster_corporateNumber_key" ON "CompanyMaster"("corporateNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyMaster_name_idx" ON "CompanyMaster"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyMaster_prefecture_idx" ON "CompanyMaster"("prefecture");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyMaster_enrichmentStatus_idx" ON "CompanyMaster"("enrichmentStatus");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyMaster_industryId_idx" ON "CompanyMaster"("industryId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyMaster_employeeCount_idx" ON "CompanyMaster"("employeeCount");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyMaster_lastCrawledAt_idx" ON "CompanyMaster"("lastCrawledAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Industry_name_key" ON "Industry"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ServiceTag_name_key" ON "ServiceTag"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyServiceTag_tagId_idx" ON "CompanyServiceTag"("tagId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Office_companyMasterId_idx" ON "Office"("companyMasterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Office_officeType_idx" ON "Office"("officeType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Office_prefecture_idx" ON "Office"("prefecture");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Department_companyMasterId_idx" ON "Department"("companyMasterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Department_officeId_idx" ON "Department"("officeId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Department_departmentType_idx" ON "Department"("departmentType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Department_parentDepartmentId_idx" ON "Department"("parentDepartmentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntentSignal_companyMasterId_publishedAt_idx" ON "IntentSignal"("companyMasterId", "publishedAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntentSignal_companyMasterId_departmentType_idx" ON "IntentSignal"("companyMasterId", "departmentType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntentSignal_departmentId_idx" ON "IntentSignal"("departmentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntentSignal_signalType_idx" ON "IntentSignal"("signalType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IntentSignal_publishedAt_idx" ON "IntentSignal"("publishedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "IntentSignal_companyMasterId_sourceUrl_key" ON "IntentSignal"("companyMasterId", "sourceUrl");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyIntent_intentLevel_idx" ON "CompanyIntent"("intentLevel");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyIntent_companyMasterId_idx" ON "CompanyIntent"("companyMasterId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyIntent_departmentType_idx" ON "CompanyIntent"("departmentType");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CompanyIntent_latestSignalAt_idx" ON "CompanyIntent"("latestSignalAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CompanyIntent_companyMasterId_departmentType_key" ON "CompanyIntent"("companyMasterId", "departmentType");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserGoogleAccount_userId_key" ON "UserGoogleAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "UserGoogleAccount_googleSub_key" ON "UserGoogleAccount"("googleSub");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_orgId_contactId_idx" ON "EmailMessage"("orgId", "contactId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_orgId_companyId_idx" ON "EmailMessage"("orgId", "companyId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_orgId_dealId_idx" ON "EmailMessage"("orgId", "dealId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_gmailThreadId_idx" ON "EmailMessage"("gmailThreadId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EmailMessage_orgId_sentAt_idx" ON "EmailMessage"("orgId", "sentAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "EmailMessage_userId_gmailMessageId_key" ON "EmailMessage"("userId", "gmailMessageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MeetingEvent_orgId_startsAt_idx" ON "MeetingEvent"("orgId", "startsAt" DESC);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MeetingEvent_orgId_dealId_idx" ON "MeetingEvent"("orgId", "dealId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MeetingEvent_orgId_primaryContactId_idx" ON "MeetingEvent"("orgId", "primaryContactId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MeetingEvent_orgId_status_idx" ON "MeetingEvent"("orgId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MeetingEvent_userId_calendarEventId_key" ON "MeetingEvent"("userId", "calendarEventId");

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint User_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Company" ADD CONSTRAINT "Company_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Company_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Company_ownerId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Company" ADD CONSTRAINT "Company_masterCompanyId_fkey" FOREIGN KEY ("masterCompanyId") REFERENCES "CompanyMaster"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Company_masterCompanyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Contact" ADD CONSTRAINT "Contact_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Contact_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Contact_companyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Contact" ADD CONSTRAINT "Contact_currentSeqId_fkey" FOREIGN KEY ("currentSeqId") REFERENCES "Sequence"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Contact_currentSeqId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Deal" ADD CONSTRAINT "Deal_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Deal_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Deal" ADD CONSTRAINT "Deal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Deal_companyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Deal" ADD CONSTRAINT "Deal_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Deal_contactId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Deal" ADD CONSTRAINT "Deal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Deal_ownerId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Activity" ADD CONSTRAINT "Activity_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Activity_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Activity" ADD CONSTRAINT "Activity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Activity_dealId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Activity_contactId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Activity" ADD CONSTRAINT "Activity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Activity_companyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Activity_userId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Task" ADD CONSTRAINT "Task_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Task_dealId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Task" ADD CONSTRAINT "Task_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Task_contactId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Task" ADD CONSTRAINT "Task_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Task_ownerId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint ScoreEvent_companyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Sequence" ADD CONSTRAINT "Sequence_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Sequence_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "SequenceStep" ADD CONSTRAINT "SequenceStep_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "Sequence"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint SequenceStep_sequenceId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Transcript_dealId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_meetingEventId_fkey" FOREIGN KEY ("meetingEventId") REFERENCES "MeetingEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Transcript_meetingEventId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "StageHistory" ADD CONSTRAINT "StageHistory_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint StageHistory_dealId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "ResearchBrief" ADD CONSTRAINT "ResearchBrief_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint ResearchBrief_dealId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "KnowledgeDoc" ADD CONSTRAINT "KnowledgeDoc_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint KnowledgeDoc_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_docId_fkey" FOREIGN KEY ("docId") REFERENCES "KnowledgeDoc"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint KnowledgeChunk_docId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "RagQuery" ADD CONSTRAINT "RagQuery_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint RagQuery_orgId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "CompanyMaster" ADD CONSTRAINT "CompanyMaster_industryId_fkey" FOREIGN KEY ("industryId") REFERENCES "Industry"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint CompanyMaster_industryId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "CompanyServiceTag" ADD CONSTRAINT "CompanyServiceTag_companyMasterId_fkey" FOREIGN KEY ("companyMasterId") REFERENCES "CompanyMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint CompanyServiceTag_companyMasterId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "CompanyServiceTag" ADD CONSTRAINT "CompanyServiceTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ServiceTag"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint CompanyServiceTag_tagId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Office" ADD CONSTRAINT "Office_companyMasterId_fkey" FOREIGN KEY ("companyMasterId") REFERENCES "CompanyMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Office_companyMasterId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Department" ADD CONSTRAINT "Department_companyMasterId_fkey" FOREIGN KEY ("companyMasterId") REFERENCES "CompanyMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Department_companyMasterId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Department" ADD CONSTRAINT "Department_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Department_officeId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "Department" ADD CONSTRAINT "Department_parentDepartmentId_fkey" FOREIGN KEY ("parentDepartmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint Department_parentDepartmentId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD CONSTRAINT "IntentSignal_companyMasterId_fkey" FOREIGN KEY ("companyMasterId") REFERENCES "CompanyMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint IntentSignal_companyMasterId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "IntentSignal" ADD CONSTRAINT "IntentSignal_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint IntentSignal_departmentId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD CONSTRAINT "CompanyIntent_companyMasterId_fkey" FOREIGN KEY ("companyMasterId") REFERENCES "CompanyMaster"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint CompanyIntent_companyMasterId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "CompanyIntent" ADD CONSTRAINT "CompanyIntent_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint CompanyIntent_departmentId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "UserGoogleAccount" ADD CONSTRAINT "UserGoogleAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint UserGoogleAccount_userId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint EmailMessage_userId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint EmailMessage_contactId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint EmailMessage_companyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "EmailMessage" ADD CONSTRAINT "EmailMessage_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint EmailMessage_dealId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD CONSTRAINT "MeetingEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint MeetingEvent_userId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD CONSTRAINT "MeetingEvent_primaryContactId_fkey" FOREIGN KEY ("primaryContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint MeetingEvent_primaryContactId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD CONSTRAINT "MeetingEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint MeetingEvent_companyId_fkey already exists'; END $$;

-- AddForeignKey
DO $$ BEGIN ALTER TABLE "MeetingEvent" ADD CONSTRAINT "MeetingEvent_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE ; EXCEPTION WHEN duplicate_object THEN raise notice 'constraint MeetingEvent_dealId_fkey already exists'; END $$;
