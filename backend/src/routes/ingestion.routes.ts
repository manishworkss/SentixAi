import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../utils/db';
import { logger } from '../utils/logger';

const router = Router();

// Step 8 — Ingestion Status API
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
        totalReviews: job.totalReviews,
        processedReviews: job.processedReviews,
        insertedReviews: job.insertedReviews,
        skippedReviews: job.skippedReviews,
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
