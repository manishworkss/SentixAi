-- AlterTable
ALTER TABLE `ingestionjob` MODIFY `movieId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `movie` MODIFY `imdbId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Movie_title_idx` ON `Movie`(`title`);
