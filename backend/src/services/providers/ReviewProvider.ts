export interface NormalizedReview {
  externalId: string;
  text: string;
  rating?: number;
  reviewDate?: Date;
  source: string;
  author?: string;
  title?: string;
}

export interface ReviewProvider {
  fetchReviews(imdbId: string): Promise<NormalizedReview[]>;
}
