import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { db } from '../utils/db';
import { logger } from '../utils/logger';

const router = Router();

// GET /api/reviews
// Fetches global reviews with optional filtering by movie title, sentiment, and user (for "My Reviews")
router.get('/', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const movieTitle = req.query.movieTitle as string | undefined;
    const sentiment = req.query.sentiment as string | undefined; // 'POSITIVE', 'NEGATIVE', 'NEUTRAL'
    const myReviews = req.query.myReviews === 'true';

    const where: any = {};

    // Filter by authenticated user's reviews if requested
    if (myReviews) {
      if (!req.dbUser) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please log in to view your reviews.' });
      }
      where.userId = req.dbUser.id;
    }

    // Filter by movie title (case-insensitive substring)
    if (movieTitle && movieTitle.trim() !== '') {
      where.movie = {
        title: {
          contains: movieTitle.trim()
        }
      };
    }

    // Filter by sentiment
    if (sentiment && sentiment !== 'ALL') {
      where.sentiments = {
        some: {
          sentiment: sentiment.toUpperCase()
        }
      };
    }

    const reviews = await db.review.findMany({
      where,
      include: {
        movie: {
          select: { id: true, title: true, posterUrl: true, releaseDate: true }
        },
        user: {
          select: { name: true, email: true }
        },
        sentiments: {
          take: 1,
          orderBy: { analyzedAt: 'desc' }
        }
      },
      orderBy: { reviewDate: 'desc' },
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
    logger.error({ error: error.message }, 'Failed to fetch global reviews');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
