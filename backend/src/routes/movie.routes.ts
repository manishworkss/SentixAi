import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { MovieService } from '../services/movie.service';
import { IngestionService } from '../services/ingestion.service';
import { logger } from '../utils/logger';
import { db } from '../utils/db';

const router = Router();

// ─── GET /api/movies/:imdbId ──────────────────────────────────────────────
router.get('/:imdbId', async (req, res) => {
  try {
    const imdbId = req.params.imdbId as string;
    const movie = await MovieService.findByImdbId(imdbId);

    if (!movie) {
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found',
        error: 'NOT_FOUND'
      });
    }

    res.json({ success: true, data: movie });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch movie');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── GET /api/movies/:imdbId/reviews ──────────────────────────────────────
router.get('/:imdbId/reviews', async (req, res) => {
  try {
    const imdbId = req.params.imdbId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const movie = await db.movie.findUnique({ where: { imdbId } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const reviews = await db.review.findMany({
      where: { movieId: movie.id },
      orderBy: { reviewDate: 'desc' },
      skip,
      take: limit
    });

    const total = await db.review.count({ where: { movieId: movie.id } });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch reviews');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── POST /api/movies/:imdbId/ingest ──────────────────────────────────────
router.post('/:imdbId/ingest', requireAuth, async (req, res) => {
  try {
    const imdbId = req.params.imdbId as string;
    const { title } = req.body; 
    
    // Step 2: Ensure the movie exists in the database
    const movie = await MovieService.findOrCreateByImdbId(imdbId, title);
    
    // Step 5: Create IngestionJob and trigger the IngestionService
    const ingestionService = new IngestionService();
    const job = await ingestionService.startIngestion(movie.id, imdbId);

    res.json({ 
      success: true, 
      message: 'Ingestion job started successfully',
      data: { 
        jobId: job.id,
        status: job.status,
        movieId: movie.id
      }
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to initialize movie ingestion');
    res.status(500).json({ success: false, message: 'Failed to start ingestion process' });
  }
});

export default router;
