/*
  Warnings:

  - You are about to drop the column `processedReviews` on the `ingestionjob` table. All the data in the column will be lost.
  - You are about to drop the column `skippedReviews` on the `ingestionjob` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ingestionjob` DROP COLUMN `processedReviews`,
    DROP COLUMN `skippedReviews`,
    ADD COLUMN `duplicateReviews` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `invalidReviews` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `moviesCreated` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `processedRecords` INTEGER NOT NULL DEFAULT 0;
