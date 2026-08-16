import { pipeline, env } from '@xenova/transformers';
import { SentimentProvider, SentimentResult } from './SentimentProvider';
import { logger } from '../../utils/logger';

// Configure transformers.js to avoid making network requests for standard tokenizer configs every time,
// and to cache models in the local filesystem gracefully.
env.allowLocalModels = true;

export class TransformersProvider implements SentimentProvider {
  private static instance: TransformersProvider;
  private classifier: any = null;
  private readonly modelName = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';
  private readonly providerName = 'local-distilbert';

  private constructor() {}

  /**
   * Singleton pattern to ensure we only load the model into memory once.
   */
  public static getInstance(): TransformersProvider {
    if (!TransformersProvider.instance) {
      TransformersProvider.instance = new TransformersProvider();
    }
    return TransformersProvider.instance;
  }

  /**
   * Lazy loads the classification model from Hugging Face / Local Cache.
   */
  private async loadModel() {
    if (this.classifier) return;

    logger.info(`Loading AI Model: ${this.modelName}...`);
    try {
      this.classifier = await pipeline('sentiment-analysis', this.modelName);
      logger.info('Model successfully loaded into memory.');
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to load transformers model');
      throw new Error('Failed to initialize AI model.');
    }
  }

  /**
   * Maps the raw transformer output to our standard SentimentResult.
   */
  private mapToResult(output: any): SentimentResult {
    const rawLabel = output.label.toUpperCase(); // Usually 'POSITIVE' or 'NEGATIVE'
    const confidence = output.score; // Confidence score between 0 and 1

    // Determine the label
    let label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
    if (rawLabel === 'POSITIVE') label = 'POSITIVE';
    if (rawLabel === 'NEGATIVE') label = 'NEGATIVE';
    
    // DistilBERT SST-2 does not naturally output neutral. We can artificially introduce it
    // if confidence is very low, though typically it forces pos/neg. We will map directly for now.
    
    // Map score: POSITIVE gets confidence (e.g. 0.9), NEGATIVE gets -confidence (e.g. -0.9)
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
    await this.loadModel();
    // Transformers pipeline returns an array of results, one for each input string
    const result = await this.classifier(text);
    return this.mapToResult(result[0]);
  }

  public async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    if (!texts || texts.length === 0) return [];
    
    await this.loadModel();
    
    // The pipeline can process an array of strings in bulk efficiently
    const results = await this.classifier(texts);
    
    return results.map((output: any) => this.mapToResult(output));
  }
}
