import { SentimentService } from './src/services/ai/SentimentService';
import { db } from './src/utils/db';

async function run() {
  console.log('Testing Background Processing API Loop...');
  const service = new SentimentService();

  console.log('Fetching initial stats...');
  let total = await db.review.count();
  let analyzed = await db.sentimentAnalysis.count({
    where: { modelProvider: 'local-distilbert' }
  });
  console.log(`Initial Stats: Total: ${total}, Analyzed: ${analyzed}`);

  console.log('Starting background worker (batch size 2 to test loop)...');
  // We trigger it without awaiting (fire and forget)
  service.startBackgroundProcessing(2);

  console.log('Waiting 3 seconds to let background worker process a few batches...');
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log('Fetching updated stats...');
  let updatedAnalyzed = await db.sentimentAnalysis.count({
    where: { modelProvider: 'local-distilbert' }
  });
  
  console.log(`Final Stats: Total: ${total}, Analyzed: ${updatedAnalyzed}`);
  console.log(`The background worker processed ${updatedAnalyzed - analyzed} records in the background!`);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
