import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const movies = await prisma.movie.findMany({
    where: { tmdbId: { not: null } },
    include: { reviews: true }
  });
  console.log("Movies count:", movies.length);
  for (const m of movies) {
    console.log(`Movie: ${m.title}, tmdbId: ${m.tmdbId}, internalId: ${m.id}, Reviews: ${m.reviews.length}`);
  }
}
check().finally(() => prisma.$disconnect());
