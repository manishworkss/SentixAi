import { Router } from 'express';
import { db } from '../utils/db';
import { logger } from '../utils/logger';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Require auth for all list routes
router.use(requireAuth);

// ─── GET /api/lists ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    const lists = await db.list.findMany({
      where: { userId },
      include: {
        _count: {
          select: { movies: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: lists });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch lists');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── POST /api/lists ──────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const userId = req.dbUser?.id;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'List name is required' });
    }

    const list = await db.list.create({
      data: {
        name,
        description,
        userId: userId!
      }
    });

    res.json({ success: true, data: list });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to create list');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── GET /api/lists/:id ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.dbUser?.id;

    const list = await db.list.findUnique({
      where: { id },
      include: {
        movies: {
          include: {
            movie: true
          },
          orderBy: { addedAt: 'desc' }
        }
      }
    });

    if (!list) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }
    if (list.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: list });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to fetch list');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── POST /api/lists/:id/movies ──────────────────────────────────────
router.post('/:id/movies', async (req, res) => {
  try {
    const listId = req.params.id;
    const { movieId } = req.body;
    const userId = req.dbUser?.id;

    const list = await db.list.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }

    const listMovie = await db.listMovie.create({
      data: {
        listId,
        movieId
      }
    });

    res.json({ success: true, data: listMovie });
  } catch (error: any) {
    // Check if duplicate
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Movie already in list' });
    }
    logger.error({ error: error.message }, 'Failed to add movie to list');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── DELETE /api/lists/:id/movies/:movieId ──────────────────────────────
router.delete('/:id/movies/:movieId', async (req, res) => {
  try {
    const listId = req.params.id;
    const movieId = req.params.movieId;
    const userId = req.dbUser?.id;

    const list = await db.list.findUnique({ where: { id: listId } });
    if (!list || list.userId !== userId) {
      return res.status(404).json({ success: false, message: 'List not found' });
    }

    await db.listMovie.delete({
      where: {
        listId_movieId: {
          listId,
          movieId
        }
      }
    });

    res.json({ success: true, message: 'Movie removed from list' });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Failed to remove movie from list');
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

export default router;
