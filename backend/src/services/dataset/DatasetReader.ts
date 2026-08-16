import fs from 'fs';
import StreamArray from 'stream-json/streamers/StreamArray';
import { parser } from 'stream-json';
import { logger } from '../../utils/logger';

export class DatasetReader {
  /**
   * Streams a JSON array from a file and processes it in batches without loading
   * the entire file into memory.
   * 
   * @param filePath The absolute path to the dataset JSON file.
   * @param batchSize The number of records to accumulate before invoking the callback.
   * @param onBatch The async callback function to process the batch.
   * @param maxRecords Optional limit to stop reading early (useful for staged imports).
   */
  static async processInBatches(
    filePath: string,
    batchSize: number,
    onBatch: (records: any[]) => Promise<void>,
    maxRecords?: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let currentBatch: any[] = [];
      let recordsProcessed = 0;
      let isPaused = false;
      let hasEnded = false;

      const pipeline = fs.createReadStream(filePath)
        .pipe(parser() as any)
        .pipe(StreamArray.withParser() as any);

      pipeline.on('data', async (data: any) => {
        // data comes in the format { key: number, value: any }
        const record = data.value;
        currentBatch.push(record);
        recordsProcessed++;

        // Stop processing further chunks if we hit the explicit max limit
        if (maxRecords && recordsProcessed >= maxRecords) {
          pipeline.destroy();
          hasEnded = true;
        }

        // When batch is full (or we hit max limit), pause the stream and flush it
        if (currentBatch.length >= batchSize || hasEnded) {
          isPaused = true;
          pipeline.pause();

          const batchToProcess = [...currentBatch];
          currentBatch = []; // Reset for the next batch immediately

          try {
            await onBatch(batchToProcess);
            
            isPaused = false;
            if (hasEnded) {
              return resolve();
            } else {
              pipeline.resume();
            }
          } catch (error) {
            logger.error({ error: (error as Error).message }, 'Failed to process batch');
            pipeline.destroy(error as Error);
            return reject(error);
          }
        }
      });

      pipeline.on('end', async () => {
        if (hasEnded) return; // Already resolved via maxRecords logic
        hasEnded = true;

        if (currentBatch.length > 0) {
          try {
            await onBatch(currentBatch);
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          resolve();
        }
      });

      pipeline.on('error', (err: any) => {
        if (!hasEnded) {
          logger.error({ error: err.message }, 'Stream pipeline error');
          reject(err);
        }
      });
    });
  }
}
