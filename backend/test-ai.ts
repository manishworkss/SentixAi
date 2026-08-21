import { TransformersProvider } from './src/services/ai/TransformersProvider';

async function run() {
  console.log('Initializing AI Provider...');
  const provider = TransformersProvider.getInstance();

  const sampleReviews = [
    "I absolutely loved this movie. The acting was incredible and the plot was engaging from start to finish.",
    "This was a complete waste of time. The script was terrible and the characters were flat.",
    "The movie was okay, nothing special but not terrible either."
  ];

  console.log('Starting Batch Analysis...');
  const startTime = Date.now();
  
  const results = await provider.analyzeBatch(sampleReviews);
  
  const endTime = Date.now();

  console.log(`\nAnalysis completed in ${endTime - startTime}ms\n`);

  results.forEach((result, index) => {
    console.log(`Review ${index + 1}:`);
    console.log(`  Text: "${sampleReviews[index]}"`);
    console.log(`  Result:`, result);
    console.log('');
  });
}

run().catch(err => {
  console.error('Fatal Error in test:', err);
});
