import { db } from '../../utils/db';
import { logger } from '../../utils/logger';
import { NormalizedReview } from './ReviewNormalizer';

export class IngestionProcessor {
  /**
   * Step 9 & 10: Resolves movie IDs for a batch of reviews efficiently.
   * Ensures no duplicates are created for the same movie title within the batch.
   * Returns a map of title -> movieId.
   */
  static async resolveMovies(reviews: NormalizedReview[]): Promise<{ map: Record<string, string>, newCreatedCount: number }> {
    const uniqueTitles = [...new Set(reviews.map(r => r.movieTitle))];
    if (uniqueTitles.length === 0) return { map: {}, newCreatedCount: 0 };

    const existingMovies = await db.movie.findMany({
      where: { title: { in: uniqueTitles } },
      select: { id: true, title: true }
    });

    const movieMap: Record<string, string> = {};
    existingMovies.forEach(m => movieMap[m.title] = m.id);

    const missingTitles = uniqueTitles.filter(t => !movieMap[t]);
    let newCreatedCount = 0;
    
    if (missingTitles.length > 0) {
      // Insert all missing titles in bulk
      const result = await db.movie.createMany({
        data: missingTitles.map(t => ({ title: t })),
        skipDuplicates: true
      });
      newCreatedCount = result.count;

      // Fetch them back to get their generated UUIDs
      const newMovies = await db.movie.findMany({
        where: { title: { in: missingTitles } },
        select: { id: true, title: true }
      });
      newMovies.forEach(m => movieMap[m.title] = m.id);
    }

    return { map: movieMap, newCreatedCount };
  }

  /**
   * Step 8 & 12: Processes a batch of normalized reviews, using bulk insert
   * with DB-level duplicate protection to ensure maximum performance.
   */
  static async processBatch(reviews: NormalizedReview[]) {
    // 1. Resolve movies
    const { map: movieMap, newCreatedCount } = await this.resolveMovies(reviews);
    
    // 2. Prepare payload
    const validReviews = reviews.filter(r => movieMap[r.movieTitle]);
    const invalidCount = reviews.length - validReviews.length;

    // We must deduplicate strictly within the batch itself before sending to createMany
    // because Prisma's createMany can sometimes throw if the *batch itself* contains duplicate unique keys.
    const uniqueBatch = new Map<string, any>();
    for (const r of validReviews) {
      const uniqueKey = `${r.source}_${r.externalId}`;
      if (!uniqueBatch.has(uniqueKey)) {
        uniqueBatch.set(uniqueKey, {
          movieId: movieMap[r.movieTitle],
          externalReviewId: r.externalId,
          reviewText: r.text,
          rating: r.rating,
          reviewDate: r.reviewDate,
          source: r.source
        });
      }
    }

    const createData = Array.from(uniqueBatch.values());
    const batchDuplicates = validReviews.length - createData.length;

    // 3. Bulk Insert with skipDuplicates
    // If the record already exists in the database from a previous batch, it is safely ignored.
    const result = await db.review.createMany({
      data: createData,
      skipDuplicates: true
    });

    const inserted = result.count;
    const dbDuplicates = createData.length - inserted;
    const totalDuplicates = batchDuplicates + dbDuplicates;

    return {
      inserted,
      duplicates: totalDuplicates,
      invalid: invalidCount,
      moviesCreated: newCreatedCount
    };
  }
}
