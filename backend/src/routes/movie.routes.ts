import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { MovieService } from '../services/movie.service';
import { logger } from '../utils/logger';

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

// ─── POST /api/movies/:imdbId/ingest ──────────────────────────────────────
router.post('/:imdbId/ingest', requireAuth, async (req, res) => {
  try {
    const imdbId = req.params.imdbId as string;
    const { title } = req.body; // Optional title from frontend
    
    // Step 2: Ensure the movie exists in the database
    const movie = await MovieService.findOrCreateByImdbId(imdbId, title);
    
    // TODO: Step 5 - Create IngestionJob and trigger the IngestionService

    res.json({ 
      success: true, 
      message: 'Movie verified. Ingestion logic will be implemented in Step 5.',
      data: { movie }
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to initialize movie ingestion');
    res.status(500).json({ success: false, message: 'Failed to start ingestion process' });
  }
});

export default router;
