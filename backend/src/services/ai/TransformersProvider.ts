import { SentimentProvider, SentimentResult } from './SentimentProvider';
import { logger } from '../../utils/logger';

export class TransformersProvider implements SentimentProvider {
  private static instance: TransformersProvider;
  private readonly providerName = 'python-ml-service';

  private constructor() {}

  public static getInstance(): TransformersProvider {
    if (!TransformersProvider.instance) {
      TransformersProvider.instance = new TransformersProvider();
    }
    return TransformersProvider.instance;
  }

  private mapToResult(output: any): SentimentResult {
    const rawLabel = output.label.toUpperCase();
    const confidence = output.score;

    let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
    if (rawLabel === 'POSITIVE') label = 'POSITIVE';
    if (rawLabel === 'NEGATIVE') label = 'NEGATIVE';
    
    let score = 0;
    if (label === 'POSITIVE') score = confidence;
    if (label === 'NEGATIVE') score = -confidence;

    return {
      label,
      score,
      confidence,
      provider: this.providerName
    };
  }

  public async analyze(text: string): Promise<SentimentResult> {
    try {
      const response = await fetch('http://127.0.0.1:8000/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: [text] })
      });
      
      if (!response.ok) {
        throw new Error(`ML Service responded with status ${response.status}`);
      }

      const data = await response.json();
      return this.mapToResult(data.results[0]);
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to connect to ML Service for single analysis');
      // Fallback
      return { label: 'NEUTRAL', score: 0, confidence: 0, provider: 'fallback' };
    }
  }

  public async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    if (!texts || texts.length === 0) return [];
    
    try {
      const response = await fetch('http://127.0.0.1:8000/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts })
      });

      if (!response.ok) {
        throw new Error(`ML Service responded with status ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((output: any) => this.mapToResult(output));
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to connect to ML Service for batch analysis');
      return texts.map(() => ({ label: 'NEUTRAL', score: 0, confidence: 0, provider: 'fallback' }));
    }
  }

  public async analyzeAspects(texts: string[], labels: string[]): Promise<any[]> {
    if (!texts || texts.length === 0) return [];
    
    try {
      const response = await fetch('http://127.0.0.1:8000/aspects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts, labels })
      });

      if (!response.ok) {
        throw new Error(`ML Service responded with status ${response.status}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to connect to ML Service for aspect analysis');
      return texts.map((t) => ({ sequence: t, labels: [], scores: [] }));
    }
  }
}
