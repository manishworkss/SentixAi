import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const shortReviews = await prisma.review.findMany({
    where: {
      userId: { not: null }
    }
  });
  console.log(`Internal reviews total: ${shortReviews.length}`);
  const shortInternal = shortReviews.filter(r => r.reviewText.trim().length < 100);
  console.log(`Short internal reviews: ${shortInternal.length}`);
  console.log(shortInternal.map(r => `[${r.id}] ${r.reviewText}`).join('\n---\n'));
}
run();
