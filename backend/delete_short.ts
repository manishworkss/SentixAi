import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const allReviews = await prisma.review.findMany();
  const shortReviews = allReviews.filter(r => r.reviewText.trim().length < 100);
  console.log(`Total short reviews to delete: ${shortReviews.length}`);
  for (const r of shortReviews) {
    await prisma.review.delete({ where: { id: r.id } });
  }
  console.log('Done deleting short reviews.');
}
run();
