-- CreateEnum
CREATE TYPE "KeywordType" AS ENUM ('PROBLEM', 'COMPETITOR', 'SOLUTION', 'GENERAL');

-- CreateEnum
CREATE TYPE "IntentType" AS ENUM ('ACTIVE_PURCHASE', 'ALTERNATIVE_SEEKING', 'RECOMMENDATION_REQUEST', 'PROBLEM_AWARE', 'SOLUTION_RESEARCH', 'COMPETITOR_DISSATISFACTION', 'COMPARISON', 'PASSIVE_DISCUSSION', 'LOW_VALUE', 'IRRELEVANT');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('EMAIL', 'SLACK', 'TELEGRAM');

-- CreateEnum
CREATE TYPE "ProjectLeadStatus" AS ENUM ('NEW', 'VIEWED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationFrequency" AS ENUM ('REALTIME', 'DAILY');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('SUBREDDIT');

-- CreateEnum
CREATE TYPE "IngestionRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "minimumIntentScore" INTEGER NOT NULL DEFAULT 70,
    "notificationFrequency" "NotificationFrequency" NOT NULL DEFAULT 'REALTIME',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Keyword" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "type" "KeywordType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Keyword_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoredSource" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "sourceType" "SourceType" NOT NULL DEFAULT 'SUBREDDIT',
    "sourceIdentifier" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoredSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedditPost" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "authorIdentifier" TEXT NOT NULL,
    "subreddit" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contentHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedditPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectLead" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "redditPostId" TEXT NOT NULL,
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProjectLeadStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "ProjectLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "projectLeadId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "relevanceScore" INTEGER NOT NULL,
    "intentScore" INTEGER NOT NULL,
    "intentType" "IntentType" NOT NULL,
    "problemSummary" TEXT,
    "matchedKeywords" TEXT[],
    "matchedCompetitors" TEXT[],
    "reasoningSummary" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "projectLeadId" TEXT NOT NULL,
    "channel" "AlertChannel" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "IngestionRunStatus" NOT NULL DEFAULT 'RUNNING',
    "postsDiscovered" INTEGER NOT NULL DEFAULT 0,
    "postsFiltered" INTEGER NOT NULL DEFAULT 0,
    "postsClassified" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" TEXT,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Keyword_projectId_idx" ON "Keyword"("projectId");

-- CreateIndex
CREATE INDEX "MonitoredSource_projectId_idx" ON "MonitoredSource"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "RedditPost_externalId_key" ON "RedditPost"("externalId");

-- CreateIndex
CREATE INDEX "RedditPost_publishedAt_idx" ON "RedditPost"("publishedAt");

-- CreateIndex
CREATE INDEX "RedditPost_contentHash_idx" ON "RedditPost"("contentHash");

-- CreateIndex
CREATE INDEX "ProjectLead_projectId_idx" ON "ProjectLead"("projectId");

-- CreateIndex
CREATE INDEX "ProjectLead_redditPostId_idx" ON "ProjectLead"("redditPostId");

-- CreateIndex
CREATE INDEX "ProjectLead_status_idx" ON "ProjectLead"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectLead_projectId_redditPostId_key" ON "ProjectLead"("projectId", "redditPostId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_projectLeadId_key" ON "Analysis"("projectLeadId");

-- CreateIndex
CREATE INDEX "Analysis_intentScore_idx" ON "Analysis"("intentScore");

-- CreateIndex
CREATE INDEX "Analysis_intentType_idx" ON "Analysis"("intentType");

-- CreateIndex
CREATE INDEX "Alert_status_idx" ON "Alert"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_projectLeadId_channel_key" ON "Alert"("projectLeadId", "channel");

-- CreateIndex
CREATE INDEX "IngestionRun_projectId_idx" ON "IngestionRun"("projectId");

-- CreateIndex
CREATE INDEX "IngestionRun_startedAt_idx" ON "IngestionRun"("startedAt");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Keyword" ADD CONSTRAINT "Keyword_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonitoredSource" ADD CONSTRAINT "MonitoredSource_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectLead" ADD CONSTRAINT "ProjectLead_redditPostId_fkey" FOREIGN KEY ("redditPostId") REFERENCES "RedditPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "ProjectLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_projectLeadId_fkey" FOREIGN KEY ("projectLeadId") REFERENCES "ProjectLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
