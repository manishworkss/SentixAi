import { db } from '../../utils/db';
import { logger } from '../../utils/logger';
import { TransformersProvider } from './TransformersProvider';

export class SentimentService {
  private provider = TransformersProvider.getInstance();
  private readonly providerName = 'local-distilbert';

  private isProcessing = false;

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
   * @returns true if started, false if already running
   */
  public startBackgroundProcessing(batchSize: number = 50): boolean {
    if (this.isProcessing) {
      logger.info('Sentiment processing is already running. Ignoring start request.');
      return false;
    }

    this.isProcessing = true;
    logger.info('Starting background sentiment analysis...');
    
    // Run asynchronously
    setImmediate(async () => {
      try {
        let isRunning = true;
        while (isRunning) {
          const result = await this.processPendingReviews(batchSize);
          
          if (result.processed === 0) {
            logger.info('Background sentiment analysis completed. No more pending reviews.');
            isRunning = false;
            break;
          }
          
          // Yield the event loop to allow other HTTP requests to be handled
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error: any) {
        logger.error({ error: error.message }, 'Fatal error in background sentiment processing loop. Halting.');
      } finally {
        this.isProcessing = false;
        logger.info('Background sentiment processing lock released.');
      }
    });

    return true;
  }

  /**
   * Fetches the current sentiment analysis statistics.
   */
  public async getStats() {
    const totalReviews = await db.review.count();
    
    const analyzedReviews = await db.sentimentAnalysis.count({
      where: { modelProvider: this.providerName }
    });

    const positiveCount = await db.sentimentAnalysis.count({
      where: { modelProvider: this.providerName, sentiment: 'POSITIVE' }
    });

    const negativeCount = await db.sentimentAnalysis.count({
      where: { modelProvider: this.providerName, sentiment: 'NEGATIVE' }
    });

    const scoreStats = await db.sentimentAnalysis.aggregate({
      where: { modelProvider: this.providerName },
      _avg: { score: true }
    });

    const pendingReviews = totalReviews - analyzedReviews;
    const progressPercentage = totalReviews === 0 ? 0 : Math.round((analyzedReviews / totalReviews) * 100);

    return {
      totalReviews,
      analyzedReviews,
      pendingReviews,
      positiveCount,
      negativeCount,
      averageSentimentScore: scoreStats._avg.score || 0,
      progressPercentage,
      isComplete: pendingReviews === 0 && totalReviews > 0,
      isProcessing: this.isProcessing
    };
  }
}
