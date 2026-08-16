import { db } from '../utils/db';
import { Prisma } from '@prisma/client';

export class AnalyticsService {
  
  public async getOverview() {
    const totalReviews = await db.review.count();
    const totalMovies = await db.movie.count();
    
    const analyzedReviews = await db.sentimentAnalysis.count({
      where: { modelProvider: 'local-distilbert' }
    });
    const pendingReviews = totalReviews - analyzedReviews;

    const positiveCount = await db.sentimentAnalysis.count({
      where: { modelProvider: 'local-distilbert', sentiment: 'POSITIVE' }
    });
    const negativeCount = await db.sentimentAnalysis.count({
      where: { modelProvider: 'local-distilbert', sentiment: 'NEGATIVE' }
    });

    const avgScoreAgg = await db.sentimentAnalysis.aggregate({
      where: { modelProvider: 'local-distilbert' },
      _avg: { score: true }
    });
    
    const avgRatingAgg = await db.review.aggregate({
      _avg: { rating: true }
    });

    const positivePercentage = analyzedReviews > 0 ? (positiveCount / analyzedReviews) * 100 : 0;
    const negativePercentage = analyzedReviews > 0 ? (negativeCount / analyzedReviews) * 100 : 0;

    const ratingDistribution = await db.review.groupBy({
      by: ['rating'],
      _count: { rating: true },
      where: { rating: { not: null } },
      orderBy: { rating: 'asc' }
    });

    return {
      totalReviews,
      analyzedReviews,
      pendingReviews,
      totalMovies,
      averageRating: avgRatingAgg._avg.rating || 0,
      averageSentimentScore: avgScoreAgg._avg.score || 0,
      positivePercentage: Math.round(positivePercentage * 100) / 100,
      negativePercentage: Math.round(negativePercentage * 100) / 100,
      sentimentDistribution: {
        POSITIVE: positiveCount,
        NEGATIVE: negativeCount,
        NEUTRAL: analyzedReviews - positiveCount - negativeCount
      },
      ratingDistribution: ratingDistribution.map(d => ({ rating: d.rating, count: d._count.rating }))
    };
  }

  public async getMovieSummary(movieId: string) {
    const movie = await db.movie.findUnique({
      where: { id: movieId }
    });
    
    if (!movie) return null;

    const reviewCount = await db.review.count({ where: { movieId } });
    const avgRatingAgg = await db.review.aggregate({
      where: { movieId },
      _avg: { rating: true }
    });

    const positiveCount = await db.sentimentAnalysis.count({
      where: { review: { movieId }, sentiment: 'POSITIVE' }
    });
    const negativeCount = await db.sentimentAnalysis.count({
      where: { review: { movieId }, sentiment: 'NEGATIVE' }
    });
    
    const totalAnalyzed = positiveCount + negativeCount;
    const avgScoreAgg = await db.sentimentAnalysis.aggregate({
      where: { review: { movieId } },
      _avg: { score: true }
    });

    const positivePercentage = totalAnalyzed > 0 ? (positiveCount / totalAnalyzed) * 100 : 0;
    const negativePercentage = totalAnalyzed > 0 ? (negativeCount / totalAnalyzed) * 100 : 0;

    return {
      movie,
      reviewCount,
      averageRating: avgRatingAgg._avg.rating || 0,
      positiveCount,
      negativeCount,
      positivePercentage: Math.round(positivePercentage * 100) / 100,
      negativePercentage: Math.round(negativePercentage * 100) / 100,
      averageSentimentScore: avgScoreAgg._avg.score || 0
    };
  }

  public async getSentimentOverTime(groupBy: 'day' | 'week' | 'month', movieId?: string) {
    // We use Prisma raw queries to safely group by date using MySQL's DATE_FORMAT
    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'week') dateFormat = '%Y-%u'; // Year and week
    if (groupBy === 'month') dateFormat = '%Y-%m';

    const conditions: Prisma.Sql[] = [];
    conditions.push(Prisma.sql`r.reviewDate IS NOT NULL`);
    conditions.push(Prisma.sql`s.modelProvider = 'local-distilbert'`);

    if (movieId) {
      conditions.push(Prisma.sql`r.movieId = ${movieId}`);
    }

    const whereClause = conditions.length > 0 
      ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` 
      : Prisma.empty;

    const query = Prisma.sql`
      SELECT 
        DATE_FORMAT(r.reviewDate, ${dateFormat}) as period,
        COUNT(r.id) as totalReviews,
        SUM(CASE WHEN s.sentiment = 'POSITIVE' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN s.sentiment = 'NEGATIVE' THEN 1 ELSE 0 END) as negative,
        AVG(s.score) as averageScore,
        AVG(r.rating) as averageRating
      FROM Review r
      JOIN SentimentAnalysis s ON r.id = s.reviewId
      ${whereClause}
      GROUP BY period
      ORDER BY period ASC
    `;

    const results: any[] = await db.$queryRaw(query);

    return results.map(row => ({
      period: row.period,
      totalReviews: Number(row.totalReviews),
      positive: Number(row.positive),
      negative: Number(row.negative),
      averageScore: Number(row.averageScore) || 0,
      averageRating: Number(row.averageRating) || null
    }));
  }

  public async getSentimentAnomalies(groupBy: 'day' | 'week' | 'month' = 'month', threshold: number = 2) {
    const timeline = await this.getSentimentOverTime(groupBy);
    
    if (timeline.length < 3) return []; // Not enough data for mean/stddev

    // Calculate overall mean
    const sum = timeline.reduce((acc, curr) => acc + curr.averageScore, 0);
    const mean = sum / timeline.length;

    // Calculate overall standard deviation
    const squareDiffs = timeline.map(curr => Math.pow(curr.averageScore - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((acc, curr) => acc + curr, 0) / timeline.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    if (stdDev === 0) return []; // No deviation possible

    const anomalies = timeline.map(curr => {
      const zScore = (curr.averageScore - mean) / stdDev;
      const isAnomaly = Math.abs(zScore) >= threshold;
      return {
        period: curr.period,
        sentimentScore: curr.averageScore,
        expectedScore: mean,
        deviation: zScore,
        anomalyFlag: isAnomaly,
        severity: isAnomaly ? (zScore > 0 ? 'HIGH_POSITIVE' : 'HIGH_NEGATIVE') : 'NORMAL'
      };
    }).filter(a => a.anomalyFlag);

    return anomalies;
  }

  public async getAspectComparison(movieId: string) {
    // Fetch all analyzed reviews for the movie
    const analyzedReviews = await db.sentimentAnalysis.findMany({
      where: { review: { movieId }, modelProvider: 'local-distilbert' },
      include: { review: { select: { reviewText: true } } }
    });

    const aspectsDef = {
      acting: ["acting", "actor", "actress", "cast", "performance", "played by"],
      story: ["story", "plot", "script", "writing"],
      direction: ["director", "direction", "directed"],
      visuals: ["visuals", "cinematography", "camera", "shot", "lighting"],
      music: ["music", "soundtrack", "score", "song", "audio"],
      characters: ["character", "protagonist", "villain"],
      pacing: ["pacing", "pace", "slow", "fast", "dragged"],
      effects: ["effects", "cgi", "vfx", "special effects"]
    };

    const aspectStats: Record<string, { mentions: number, positive: number, negative: number, sumScore: number }> = {};
    Object.keys(aspectsDef).forEach(k => {
      aspectStats[k] = { mentions: 0, positive: 0, negative: 0, sumScore: 0 };
    });

    // Keyword-based attribution (using lowercased text)
    analyzedReviews.forEach(analysis => {
      const text = analysis.review.reviewText.toLowerCase();
      
      Object.entries(aspectsDef).forEach(([aspect, keywords]) => {
        const isMentioned = keywords.some(kw => text.includes(kw));
        
        if (isMentioned) {
          aspectStats[aspect].mentions++;
          if (analysis.sentiment === 'POSITIVE') aspectStats[aspect].positive++;
          if (analysis.sentiment === 'NEGATIVE') aspectStats[aspect].negative++;
          aspectStats[aspect].sumScore += analysis.score;
        }
      });
    });

    return Object.entries(aspectStats).map(([aspect, stats]) => {
      return {
        aspect,
        mentions: stats.mentions,
        positive: stats.positive,
        negative: stats.negative,
        averageScore: stats.mentions > 0 ? (stats.sumScore / stats.mentions) : 0
      };
    }).filter(a => a.mentions > 0); // Only return aspects that were actually mentioned
  }
}
