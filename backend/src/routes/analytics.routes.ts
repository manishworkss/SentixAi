import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { logger } from '../utils/logger';
import { AnalyticsService } from '../services/AnalyticsService';

const router = Router();
const analyticsService = new AnalyticsService();

// Feature 5: General Analytics Summary
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const data = await analyticsService.getOverview();
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch analytics overview');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Feature 1: Sentiment Over Time
router.get('/sentiment-over-time', requireAuth, async (req, res) => {
  try {
    const groupBy = (req.query.groupBy as string) || 'month';
    const movieId = req.query.movieId as string | undefined;

    if (!['day', 'week', 'month'].includes(groupBy)) {
      return res.status(400).json({ success: false, message: 'Invalid groupBy parameter. Must be day, week, or month.' });
    }

    const data = await analyticsService.getSentimentOverTime(groupBy as 'day' | 'week' | 'month', movieId);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch sentiment over time');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Feature 3: Sentiment Anomaly Detection
router.get('/sentiment-anomalies', requireAuth, async (req, res) => {
  try {
    const groupBy = (req.query.groupBy as string) || 'month';
    const threshold = parseFloat(req.query.threshold as string) || 2.0;

    if (!['day', 'week', 'month'].includes(groupBy)) {
      return res.status(400).json({ success: false, message: 'Invalid groupBy parameter. Must be day, week, or month.' });
    }

    const data = await analyticsService.getSentimentAnomalies(groupBy as 'day' | 'week' | 'month', threshold);
    res.json({ success: true, data });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch sentiment anomalies');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Feature 4: Movie Sentiment Summary
router.get('/movies/:movieId', requireAuth, async (req, res) => {
  try {
    const movieId = req.params.movieId as string;
    const data = await analyticsService.getMovieSummary(movieId);

    if (!data) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch movie summary');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Feature 2: Aspect-Level Movie Comparison
router.get('/movies/:movieId/aspects', requireAuth, async (req, res) => {
  try {
    const movieId = req.params.movieId as string;
    
    // Validate movie exists first to avoid unnecessary querying if missing
    const summary = await analyticsService.getMovieSummary(movieId);
    if (!summary) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const aspects = await analyticsService.getAspectComparison(movieId);

    res.json({ 
      success: true, 
      data: {
        movieId,
        aspects
      }
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch aspect comparison');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
