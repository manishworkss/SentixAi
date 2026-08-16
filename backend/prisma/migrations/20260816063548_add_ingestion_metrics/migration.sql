-- AlterTable
ALTER TABLE `ingestionjob` ADD COLUMN `insertedReviews` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `skippedReviews` INTEGER NOT NULL DEFAULT 0;
