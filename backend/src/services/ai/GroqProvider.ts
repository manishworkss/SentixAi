import { SentimentProvider, SentimentResult } from './SentimentProvider';
import { logger } from '../../utils/logger';
import Groq from 'groq-sdk';

export class GroqProvider implements SentimentProvider {
  private static instance: GroqProvider;
  private readonly providerName = 'groq-llama3';
  private groq: Groq;

  private constructor() {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY || ''
    });
  }

  public static getInstance(): GroqProvider {
    if (!GroqProvider.instance) {
      GroqProvider.instance = new GroqProvider();
    }
    return GroqProvider.instance;
  }

  public async analyze(text: string): Promise<SentimentResult> {
    const results = await this.analyzeBatch([text]);
    return results[0] || { label: 'NEUTRAL', score: 0, confidence: 0, provider: this.providerName };
  }

  public async analyzeBatch(texts: string[]): Promise<SentimentResult[]> {
    if (!texts || texts.length === 0) return [];
    if (!process.env.GROQ_API_KEY) {
      logger.error('GROQ_API_KEY is not set in environment variables.');
      return texts.map(() => ({ label: 'NEUTRAL', score: 0, confidence: 0, provider: this.providerName }));
    }

    try {
      const prompt = `Analyze the sentiment of the following list of reviews. Some reviews might contain sarcasm or double negations (e.g. "not bad" is positive).
Return ONLY a raw JSON object with a single key "results" mapping to an array of objects. Each object must have:
- "label": strictly one of "POSITIVE", "NEGATIVE", or "NEUTRAL".
- "confidence": a number between 0.0 and 1.0.

Reviews:
${texts.map((text, i) => `[${i}]: ${text}`).join('\n')}
`;

      const completion = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert sentiment analysis AI. Return ONLY valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "openai/gpt-oss-20b",
        temperature: 0.0,
        response_format: { type: "json_object" }
      });

      const responseContent = completion.choices[0]?.message?.content || '{"results":[]}';
      const data = JSON.parse(responseContent);
      
      const results: SentimentResult[] = [];
      for (let i = 0; i < texts.length; i++) {
        const item = data.results[i];
        if (item) {
          const label = ['POSITIVE', 'NEGATIVE', 'NEUTRAL'].includes(item.label) ? item.label : 'NEUTRAL';
          const confidence = typeof item.confidence === 'number' ? item.confidence : 0.5;
          let score = 0;
          if (label === 'POSITIVE') score = confidence;
          if (label === 'NEGATIVE') score = -confidence;

          results.push({
            label: label as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
            score,
            confidence,
            provider: this.providerName
          });
        } else {
          results.push({ label: 'NEUTRAL', score: 0, confidence: 0, provider: this.providerName });
        }
      }
      return results;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Failed to connect to Groq API for batch analysis');
      throw error;
    }
  }

  // Not implementing aspects via Groq yet to save on tokens, we can fallback to empty
  public async analyzeAspects(texts: string[], labels: string[]): Promise<any[]> {
    return texts.map((t) => ({ sequence: t, labels: [], scores: [] }));
  }
}
