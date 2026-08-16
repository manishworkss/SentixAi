import { db } from '../../utils/db';
import { logger } from '../../utils/logger';
import { TransformersProvider } from './TransformersProvider';

export class SentimentService {
  private provider = TransformersProvider.getInstance();
  private readonly providerName = 'local-distilbert';

  /**
   * Processes a limited batch of reviews that have not yet been analyzed by the current provider.
   * @param limit The maximum number of reviews to fetch and analyze in this pass.
   */
  public async processPendingReviews(limit: number = 50): Promise<{ processed: number, success: number, error: number }> {
    logger.info(`Fetching up to ${limit} pending reviews for sentiment analysis...`);
    
    // 1. Unprocessed Review Discovery
    const pendingReviews = await db.review.findMany({
      where: {
        sentiments: {
          none: {
            modelProvider: this.providerName
          }
        }
      },
      select: {
        id: true,
        reviewText: true
      },
      take: limit
    });

    if (pendingReviews.length === 0) {
      logger.info('No pending reviews found for sentiment analysis.');
      return { processed: 0, success: 0, error: 0 };
    }

    logger.info(`Analyzing ${pendingReviews.length} reviews...`);

    let successCount = 0;
    let errorCount = 0;

    // 2. Batch Processing Algorithm
    const texts = pendingReviews.map(r => r.reviewText);
    
    try {
      const results = await this.provider.analyzeBatch(texts);
      
      // 3. Database Insertion Prep
      const insertData = results.map((result, index) => ({
        reviewId: pendingReviews[index].id,
        sentiment: result.label,
        score: result.score,
        confidence: result.confidence,
        modelProvider: result.provider,
        analyzedAt: new Date()
      }));

      // Bulk Insert
      await db.sentimentAnalysis.createMany({
        data: insertData,
        skipDuplicates: true
      });
      
      successCount = insertData.length;
      logger.info(`Successfully processed and saved ${successCount} sentiment analyses.`);

    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to process sentiment batch');
      errorCount = pendingReviews.length;
    }

    return {
      processed: pendingReviews.length,
      success: successCount,
      error: errorCount
    };
  }

  /**
   * Starts a continuous background loop to process all pending reviews.
   * Runs non-blockingly.
   */
  public async startBackgroundProcessing(batchSize: number = 50) {
    logger.info('Starting background sentiment analysis...');
    
    // Run asynchronously
    setImmediate(async () => {
      let isRunning = true;
      while (isRunning) {
        try {
          const result = await this.processPendingReviews(batchSize);
          
          if (result.processed === 0) {
            logger.info('Background sentiment analysis completed. No more pending reviews.');
            isRunning = false;
            break;
          }
          
          // Yield the event loop to allow other HTTP requests to be handled
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error: any) {
          logger.error({ error: error.message }, 'Fatal error in background sentiment processing loop. Halting.');
          isRunning = false;
        }
      }
    });
  }
}
