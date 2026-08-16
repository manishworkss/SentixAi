export interface SentimentResult {
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  score: number;      // Mapped from -1.0 to 1.0 (if provider supports it)
  confidence: number; // 0.0 to 1.0 confidence in the label
  provider: string;   // e.g., 'local-distilbert'
}

export interface SentimentProvider {
  /**
   * Analyzes a single string of text and returns the sentiment result.
   */
  analyze(text: string): Promise<SentimentResult>;
  
  /**
   * Analyzes an array of strings.
   * Useful for providers that support batching (like Transformers).
   */
  analyzeBatch(texts: string[]): Promise<SentimentResult[]>;
}
