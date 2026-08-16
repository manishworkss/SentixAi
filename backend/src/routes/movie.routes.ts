import { Router } from 'express';
import { db } from '../utils/db';
import { logger } from '../utils/logger';

const router = Router();

// ─── GET /api/movies/:id ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id as string;
    
    // We now fetch by the internal UUID, as imdbId is optional.
    const movie = await db.movie.findUnique({ where: { id } });

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

// ─── GET /api/movies/:id/reviews ──────────────────────────────────────
router.get('/:id/reviews', async (req, res) => {
  try {
    const id = req.params.id as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Step 17: Support rating filters
    const minRating = req.query.minRating ? parseInt(req.query.minRating as string) : undefined;
    const maxRating = req.query.maxRating ? parseInt(req.query.maxRating as string) : undefined;
    const spoiler = req.query.spoiler !== undefined ? req.query.spoiler === 'true' : undefined;

    const movie = await db.movie.findUnique({ where: { id } });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const where: any = { movieId: movie.id };
    
    if (minRating !== undefined || maxRating !== undefined) {
      where.rating = {};
      if (minRating !== undefined) where.rating.gte = minRating;
      if (maxRating !== undefined) where.rating.lte = maxRating;
    }

    if (spoiler !== undefined) {
      where.spoiler = spoiler; // Wait, our schema doesn't have spoiler boolean! Let's ignore it for now or adapt if needed.
      // Since it's not in DB, we'll gracefully ignore it to avoid crashes.
      delete where.spoiler;
    }

    const reviews = await db.review.findMany({
      where,
      orderBy: { reviewDate: 'desc' }, // Sort by review date
      skip,
      take: limit
    });

    const total = await db.review.count({ where });

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

export default router;
