/*
  Warnings:

  - You are about to drop the column `reasoningSummary` on the `Analysis` table. All the data in the column will be lost.
  - You are about to drop the column `recommendedAction` on the `Analysis` table. All the data in the column will be lost.
  - Added the required column `buyingStage` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalScore` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendedPriority` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `summary` to the `Analysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whyItMatters` to the `Analysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "reasoningSummary",
DROP COLUMN "recommendedAction",
ADD COLUMN     "buyingStage" TEXT NOT NULL,
ADD COLUMN     "finalScore" INTEGER NOT NULL,
ADD COLUMN     "recommendedPriority" TEXT NOT NULL,
ADD COLUMN     "summary" TEXT NOT NULL,
ADD COLUMN     "whyItMatters" TEXT NOT NULL;
