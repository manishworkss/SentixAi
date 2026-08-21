import { SentimentService } from './src/services/ai/SentimentService';

async function run() {
  console.log('Initializing SentimentService Batch Test...');
  const service = new SentimentService();

  console.log('Fetching and analyzing 10 pending reviews...');
  const startTime = Date.now();
  
  const result = await service.processPendingReviews(10);
  
  const endTime = Date.now();

  console.log(`\nBatch test completed in ${endTime - startTime}ms`);
  console.log('Result:', result);
  
  // Exiting to cleanly close Prisma connection if any (handled automatically by tsx usually or we can explicitly close if db was exported, but typically it stays open. 
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal Error in test:', err);
  process.exit(1);
});
