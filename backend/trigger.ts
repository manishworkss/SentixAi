import { SentimentService } from './src/services/ai/SentimentService';
async function run() {
  const service = new SentimentService();
  console.log("Starting processing with desc order...");
  await service.processPendingReviews(10);
  console.log("Processing done.");
}
run();
