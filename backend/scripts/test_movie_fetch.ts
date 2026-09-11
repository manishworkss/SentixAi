import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function test() {
  const movie = await prisma.movie.findFirst({ where: { title: "Inception" } });
  if (!movie) return console.log("No movie found");
  
  const reviews = await prisma.review.findMany({ where: { movieId: movie.id } });
  console.log(`Movie ${movie.title} has ${reviews.length} reviews`);
  
  const analytics = await prisma.sentimentAnalysis.findMany({ 
    where: { reviewId: { in: reviews.map(r => r.id) } } 
  });
  console.log(`Found ${analytics.length} sentiment records`);
}
test().finally(() => prisma.$disconnect());
