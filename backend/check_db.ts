import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { sentiments: true }
  });
  console.log(JSON.stringify(reviews, null, 2));
}
run();
