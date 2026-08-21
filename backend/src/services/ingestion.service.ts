import { db } from '../utils/db';
import { ReviewProvider } from './providers/ReviewProvider';
import { MockReviewProvider } from './providers/MockReviewProvider';
import { logger } from '../utils/logger';

export class IngestionService {
  private provider: ReviewProvider;

  constructor() {
    // We inject the Mock provider here for now. 
    // In the future, this can be swapped with a real IMDb provider.
    this.provider = new MockReviewProvider();
  }

  /**
   * Initializes an Ingestion Job and starts the background processing.
   */
  async startIngestion(movieId: string, imdbId: string) {
    const job = await db.ingestionJob.create({
      data: {
        movieId,
        status: 'PROCESSING',
        startedAt: new Date(),
      }
    });

    // Start processing asynchronously without awaiting it
    this.processJob(job.id, movieId, imdbId).catch(err => {
      logger.error({ err, jobId: job.id }, `Fatal error in ingestion job processing`);
    });

    return job;
  }

  /**
   * Handles the core ingestion logic: Fetching, normalising, validating, and upserting reviews.
   */
  private async processJob(jobId: string, movieId: string, imdbId: string) {
    try {
      const reviews = await this.provider.fetchReviews(imdbId);
      
      let processed = 0;
      let inserted = 0;
      let skipped = 0;

      for (const review of reviews) {
        processed++;
        
        // Step 10: Validation
        if (!review.text || review.text.trim().length === 0 || !review.externalId) {
          skipped++;
          continue;
        }

        try {
          // Step 6: Duplicate Review Protection
          // Upsert based on the composite unique key (source + externalReviewId)
          await db.review.upsert({
            where: {
              source_externalReviewId: {
                source: review.source,
                externalReviewId: review.externalId
              }
            },
            update: {}, // Don't overwrite existing text to save resources, just skip logically
            create: {
              movieId,
              externalReviewId: review.externalId,
              reviewText: review.text,
              rating: review.rating,
              reviewDate: review.reviewDate,
              source: review.source
            }
          });
          inserted++;
        } catch (e: any) {
          // If upsert fails for any other DB reason, count as skipped
          logger.warn({ error: e.message, externalId: review.externalId }, 'Failed to insert review');
          skipped++;
        }
      }

      // Step 7: Update Ingestion Job Status
      await db.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          totalReviews: reviews.length,
          processedRecords: processed,
          insertedReviews: inserted,
          invalidReviews: skipped,
          completedAt: new Date(),
          errorMessage: null
        }
      });
      
      logger.info({ jobId, movieId }, 'Ingestion job completed successfully');

    } catch (error: any) {
      // Step 5: Safely handle fatal ingestion failures
      logger.error({ error: error.message, jobId }, 'Ingestion job failed');
      await db.ingestionJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          errorMessage: error.message || 'Unknown error occurred during ingestion',
          completedAt: new Date()
        }
      });
    }
  }
}
