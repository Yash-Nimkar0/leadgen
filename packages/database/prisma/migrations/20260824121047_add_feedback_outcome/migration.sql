-- CreateEnum
CREATE TYPE "LeadFeedback" AS ENUM ('NONE', 'GOOD', 'BAD', 'NOT_RELEVANT');

-- CreateEnum
CREATE TYPE "LeadOutcome" AS ENUM ('NONE', 'CONTACTED', 'CONVERTED');

-- AlterTable
ALTER TABLE "ProjectLead" ADD COLUMN     "feedback" "LeadFeedback" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "outcome" "LeadOutcome" NOT NULL DEFAULT 'NONE';

-- CreateIndex
CREATE INDEX "ProjectLead_feedback_idx" ON "ProjectLead"("feedback");

-- CreateIndex
CREATE INDEX "ProjectLead_outcome_idx" ON "ProjectLead"("outcome");
