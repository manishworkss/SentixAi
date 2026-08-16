import { db } from '../utils/db';

export class MovieService {
  /**
   * Retrieves a movie by its IMDb ID, including a count of its reviews.
   */
  static async findByImdbId(imdbId: string) {
    return await db.movie.findUnique({
      where: { imdbId },
      include: {
        _count: {
          select: { reviews: true }
        }
      }
    });
  }

  /**
   * Finds a movie by IMDb ID, creating it if it doesn't exist.
   * Prevents creating duplicate records for the same IMDb ID.
   */
  static async findOrCreateByImdbId(imdbId: string, title: string = "Pending Title", metadata?: any) {
    let movie = await db.movie.findUnique({ where: { imdbId } });
    
    if (!movie) {
      movie = await db.movie.create({
        data: {
          imdbId,
          title,
          metadata: metadata || {}
        }
      });
    }
    
    return movie;
  }
}
