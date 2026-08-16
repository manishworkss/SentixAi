import { db } from '../../utils/db';
import { logger } from '../../utils/logger';
import { DatasetReader } from './DatasetReader';
import { ReviewNormalizer, RawIMDbReview } from './ReviewNormalizer';
import { IngestionProcessor } from './IngestionProcessor';
import { getDatasetPath } from '../../utils/datasetConfig';

export class DatasetService {
  /**
   * Triggers the dataset ingestion process.
   * Runs asynchronously in the background.
   */
  static async startIngestion(maxRecords: number = 50000) {
    const datasetPath = getDatasetPath();

    // Create the ingestion job tracking record
    const job = await db.ingestionJob.create({
      data: {
        status: 'PROCESSING',
        startedAt: new Date()
      }
    });

    // Run in background without awaiting
    this.processDataset(datasetPath, job.id, maxRecords).catch(err => {
      logger.error({ error: err.message, jobId: job.id }, 'Fatal ingestion job error');
    });

    return job;
  }

  private static async processDataset(filePath: string, jobId: string, maxRecords: number) {
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalDuplicates = 0;
    let totalInvalid = 0;
    let totalMoviesCreated = 0;
    
    // Step 12: Batch Size - balance memory vs DB transaction speed
    const batchSize = 2000; 

    try {
      await DatasetReader.processInBatches(
        filePath,
        batchSize,
        async (rawRecords: RawIMDbReview[]) => {
          totalProcessed += rawRecords.length;

          // Step 4: Normalize
          const normalized = rawRecords
            .map(r => ReviewNormalizer.normalize(r))
            .filter(r => r !== null) as NonNullable<ReturnType<typeof ReviewNormalizer.normalize>>[];
          
          const invalidInBatch = rawRecords.length - normalized.length;
          totalInvalid += invalidInBatch;

          // Steps 8-10: Bulk Process
          if (normalized.length > 0) {
            const metrics = await IngestionProcessor.processBatch(normalized);
            totalInserted += metrics.inserted;
            totalDuplicates += metrics.duplicates;
            totalMoviesCreated += metrics.moviesCreated;
          }

          // Step 11: Periodically update job status so UI can poll progress
          await db.ingestionJob.update({
            where: { id: jobId },
            data: {
              processedRecords: totalProcessed,
              insertedReviews: totalInserted,
              duplicateReviews: totalDuplicates,
              invalidReviews: totalInvalid,
              moviesCreated: totalMoviesCreated
            }
          });

        },
        maxRecords // Step 13: Staged Import
      );

      // Finished successfully
      await db.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          processedRecords: totalProcessed,
          insertedReviews: totalInserted,
          duplicateReviews: totalDuplicates,
          invalidReviews: totalInvalid,
          moviesCreated: totalMoviesCreated,
          completedAt: new Date(),
          errorMessage: null
        }
      });
      logger.info({ jobId, totalProcessed, totalInserted }, 'Ingestion job completed successfully');

    } catch (error: any) {
      await db.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error occurred during streaming dataset read',
          completedAt: new Date()
        }
      });
    }
  }
}
