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
    const started = sentimentService.startBackgroundProcessing(50);

    if (!started) {
      return res.status(409).json({
        success: false,
        message: "Sentiment processing is already running"
      });
    }

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
    const stats = await sentimentService.getStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch sentiment stats');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Step 6: Sentiment Retrieval API - by Movie
router.get('/movies/:movieId', requireAuth, async (req, res) => {
  try {
    const movieId = req.params.movieId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const sentiments = await db.sentimentAnalysis.findMany({
      where: { review: { movieId } },
      include: { review: { select: { reviewText: true, rating: true, externalReviewId: true } } },
      skip,
      take: limit,
      orderBy: { analyzedAt: 'desc' }
    });

    const total = await db.sentimentAnalysis.count({
      where: { review: { movieId } }
    });

    res.json({
      success: true,
      data: sentiments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch movie sentiments');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Step 6: Sentiment Retrieval API - by Review
router.get('/reviews/:reviewId', requireAuth, async (req, res) => {
  try {
    const reviewId = req.params.reviewId as string;
    const sentiments = await db.sentimentAnalysis.findMany({
      where: { reviewId }
    });

    res.json({
      success: true,
      data: sentiments
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch review sentiments');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
