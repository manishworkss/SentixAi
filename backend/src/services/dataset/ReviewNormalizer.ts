import { logger } from '../../utils/logger';

export interface RawIMDbReview {
  review_id?: string;
  reviewer?: string;
  movie?: string;
  rating?: string | number | null;
  review_summary?: string;
  review_date?: string;
  spoiler_tag?: string | number | boolean;
  review_detail?: string;
  helpful?: string | any[];
}

export interface NormalizedReview {
  externalId: string;
  movieTitle: string;
  reviewer: string | null;
  rating: number | null;
  summary: string | null;
  reviewDate: Date | null;
  spoiler: boolean;
  text: string;
  helpfulVotes: string | null;
  source: string;
}

export class ReviewNormalizer {
  /**
   * Normalizes a raw IMDb dataset record into the internal SentixAI review structure.
   * Validates the presence of required fields like review_id and text.
   * Returns null if the record is fundamentally invalid (e.g., empty text or no ID).
   */
  static normalize(raw: RawIMDbReview): NormalizedReview | null {
    // Step 6: Text Validation
    // Use review_detail as primary text. If empty, check review_summary as fallback.
    let text = raw.review_detail?.trim() || raw.review_summary?.trim();
    
    if (!text || text.length === 0) {
      return null; // Discard invalid/empty reviews
    }

    // Must have an external ID to deduplicate (Step 8)
    const externalId = raw.review_id?.trim();
    if (!externalId) {
      return null; 
    }

    // Must have a movie title to group (Step 9)
    const movieTitle = raw.movie?.trim();
    if (!movieTitle) {
      return null;
    }

    return {
      externalId,
      movieTitle,
      reviewer: raw.reviewer?.trim() || null,
      rating: ReviewNormalizer.parseRating(raw.rating),
      summary: raw.review_summary?.trim() || null,
      reviewDate: ReviewNormalizer.parseDate(raw.review_date),
      spoiler: ReviewNormalizer.parseSpoiler(raw.spoiler_tag),
      text,
      helpfulVotes: raw.helpful ? String(raw.helpful).trim() : null,
      source: 'IMDb Dataset'
    };
  }

  /**
   * Step 5: Rating Handling
   * Convert string "9" to number 9.
   * If missing or invalid, return null (never 0).
   */
  private static parseRating(rating: string | number | null | undefined): number | null {
    if (rating === null || rating === undefined || rating === '') return null;
    
    const parsed = Number(rating);
    if (isNaN(parsed) || parsed < 1 || parsed > 10) {
      return null;
    }
    return parsed;
  }

  /**
   * Step 7: Date Normalization
   * Convert "3 May 2020" to a valid Date object.
   * If invalid, return null safely.
   */
  private static parseDate(dateStr: string | undefined): Date | null {
    if (!dateStr || dateStr.trim() === '') return null;

    try {
      // JavaScript Date.parse can natively handle "3 May 2020" or "23 July 2020"
      const timestamp = Date.parse(dateStr);
      if (isNaN(timestamp)) {
        return null;
      }
      return new Date(timestamp);
    } catch (e) {
      return null;
    }
  }

  /**
   * Safely convert spoiler tag to boolean.
   */
  private static parseSpoiler(spoiler: string | number | boolean | undefined): boolean {
    if (spoiler === true || spoiler === 1 || spoiler === '1' || spoiler === 'true') return true;
    return false;
  }
}
