import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../utils/db';
import { logger } from '../utils/logger';
import { SentimentService } from '../services/ai/SentimentService';

const router = Router();
const sentimentService = new SentimentService();

// Step 5: Start Background Processing
router.post('/analyze', requireAuth, async (req, res) => {
  try {
    // Start background processing loop (non-blocking)
    sentimentService.startBackgroundProcessing(50);

    res.json({
      success: true,
      message: 'Background sentiment analysis started successfully.'
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to start sentiment analysis');
    res.status(500).json({ success: false, message: 'Failed to start sentiment analysis' });
  }
});

// Step 5: Progress Statistics Endpoint
router.get('/stats', requireAuth, async (req, res) => {
  try {
    // Fetch total reviews and analyzed reviews to calculate progress
    const totalReviews = await db.review.count();
    const analyzedReviews = await db.sentimentAnalysis.count({
      where: { modelProvider: 'local-distilbert' }
    });

    const pendingReviews = totalReviews - analyzedReviews;
    const progressPercentage = totalReviews === 0 ? 0 : Math.round((analyzedReviews / totalReviews) * 100);

    res.json({
      success: true,
      data: {
        totalReviews,
        analyzedReviews,
        pendingReviews,
        progressPercentage,
        isComplete: pendingReviews === 0
      }
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch sentiment stats');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
