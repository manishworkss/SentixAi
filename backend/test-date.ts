import { db } from './src/utils/db';
async function test() {
  const m = await db.movie.create({ data: { title: "Test", imdbId: "tt123", posterUrl: "def", year: 2024 }});
  const r = await db.review.create({ data: {
    reviewText: 'abc', source: 'IMDB', url: 'http', movieId: m.id, rating: 5, author: 'test', reviewDate: new Date('2024-01-01')
  }});
  console.log("inserted");
  process.exit(0);
}
test();
