import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../utils/db';
import { logger } from '../utils/logger';
import { DatasetService } from '../services/dataset/DatasetService';

const router = Router();

// Step 18 — Dataset Statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const totalReviews = await db.review.count();
    const totalMovies = await db.movie.count();
    
    const ratingStats = await db.review.aggregate({
      _avg: { rating: true },
      _min: { reviewDate: true },
      _max: { reviewDate: true },
    });

    const reviewsWithRatings = await db.review.count({ where: { rating: { not: null } } });
    const reviewsWithoutRatings = totalReviews - reviewsWithRatings;

    // Rating distribution
    const distribution = await db.review.groupBy({
      by: ['rating'],
      _count: { rating: true },
      where: { rating: { not: null } },
      orderBy: { rating: 'asc' }
    });

    res.json({
      success: true,
      data: {
        totalReviews,
        totalMovies,
        reviewsWithRatings,
        reviewsWithoutRatings,
        averageRating: ratingStats._avg.rating,
        earliestReviewDate: ratingStats._min.reviewDate,
        latestReviewDate: ratingStats._max.reviewDate,
        ratingDistribution: distribution.map(d => ({ rating: d.rating, count: d._count.rating }))
      }
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch dataset stats');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Step 14 — Ingestion API
router.post('/imdb', requireAuth, async (req, res) => {
  try {
    const { maxRecords } = req.body;
    
    // Trigger dataset ingestion in the background
    const job = await DatasetService.startIngestion(maxRecords ? parseInt(maxRecords) : 50000);

    res.json({
      success: true,
      message: 'Dataset ingestion job started successfully',
      data: { jobId: job.id, status: job.status }
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to start ingestion');
    res.status(500).json({ success: false, message: 'Failed to start ingestion' });
  }
});

// Step 15 — Ingestion Status
router.get('/:jobId', requireAuth, async (req, res) => {
  try {
    const jobId = req.params.jobId as string;

    const job = await db.ingestionJob.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Ingestion job not found',
        error: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        jobId: job.id,
        movieId: job.movieId,
        status: job.status,
        totalRecords: job.totalReviews, // Keep for legacy UI compat if needed, or update DB schema
        processedRecords: job.processedRecords,
        insertedReviews: job.insertedReviews,
        duplicateReviews: job.duplicateReviews,
        invalidReviews: job.invalidReviews,
        moviesCreated: job.moviesCreated,
        errorMessage: job.errorMessage,
        startedAt: job.startedAt,
        completedAt: job.completedAt
      }
    });

  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch ingestion job');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
