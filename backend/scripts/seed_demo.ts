import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const DEMO_MOVIES = [
  {
    tmdbId: 27205,
    title: "Inception",
    poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
    release_date: "2010-07-15",
    vote_average: 8.4,
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: inception."
  },
  {
    tmdbId: 155,
    title: "The Dark Knight",
    poster_path: "https://m.media-amazon.com/images/I/818hyvdVfvL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets."
  },
  {
    tmdbId: 157336,
    title: "Interstellar",
    poster_path: "https://m.media-amazon.com/images/I/A1JVqNMI7UL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage."
  },
  {
    tmdbId: 299534,
    title: "Avengers: Endgame",
    poster_path: "https://m.media-amazon.com/images/I/81ExhpBEbHL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    release_date: "2019-04-24",
    vote_average: 8.3,
    overview: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe."
  },
  {
    tmdbId: 550,
    title: "Fight Club",
    poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/rr7E0NoGKxaeKdicGz22pb4h2l2.jpg",
    release_date: "1999-10-15",
    vote_average: 8.4,
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground fight clubs forming in every town."
  },
  {
    tmdbId: 13,
    title: "Forrest Gump",
    poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/3h1JZGDhZ8usL1vEunN7sH7D6kF.jpg",
    release_date: "1994-06-23",
    vote_average: 8.5,
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do. But despite all he has achieved, his one true love eludes him."
  },
  {
    tmdbId: 603,
    title: "The Matrix",
    poster_path: "https://m.media-amazon.com/images/I/613ypTLZHsL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/l6hQWH9eDksNJNiXWYRkWIGmE6B.jpg",
    release_date: "1999-03-30",
    vote_average: 8.2,
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth."
  },
  {
    tmdbId: 671,
    title: "Harry Potter and the Sorcerer's Stone",
    poster_path: "/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/hziiv14OpD73u9gAak4XDDfBKa2.jpg",
    release_date: "2001-11-16",
    vote_average: 7.9,
    overview: "Harry Potter has lived under the stairs at his aunt and uncle's house his whole life. But on his 11th birthday, he learns he's a powerful wizard—with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry."
  },
  {
    tmdbId: 120,
    title: "The Lord of the Rings: The Fellowship of the Ring",
    poster_path: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/vI3aUGtu37cKRaVtc7A4X17KzZc.jpg",
    release_date: "2001-12-18",
    vote_average: 8.4,
    overview: "Young hobbit Frodo Baggins, after inheriting a mysterious ring from his uncle Bilbo, must leave his home in order to keep it from falling into the hands of its evil creator. Along the way, a fellowship is formed to protect the ringbearer and make sure that the ring arrives at its final destination: Mt. Doom."
  },
  {
    tmdbId: 284054,
    title: "Black Panther",
    poster_path: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/6ELJEzQJ3Y45HczvreC3v00HNwW.jpg",
    release_date: "2018-02-13",
    vote_average: 7.4,
    overview: "King T'Challa returns home to the reclusive, technologically advanced African nation of Wakanda to serve as his country's new leader. However, T'Challa soon finds that he is challenged for the throne by factions within his own country as well as without."
  }
];

const DEMO_REVIEWS = [
  { text: "Absolutely mind-blowing visually, but the plot was a bit confusing the first time around. Still a masterpiece.", rating: 4, sentiment: "POSITIVE", score: 0.85 },
  { text: "I fell asleep halfway through. Way too long and overrated.", rating: 2, sentiment: "NEGATIVE", score: -0.7 },
  { text: "A truly cinematic experience. The acting was superb and the soundtrack was mesmerizing.", rating: 5, sentiment: "POSITIVE", score: 0.95 },
  { text: "It was okay, not exactly what I expected but decent enough for a weekend watch.", rating: 3, sentiment: "NEUTRAL", score: 0.1 },
  { text: "Terrible writing, completely ruined the characters from the previous movies.", rating: 1, sentiment: "NEGATIVE", score: -0.9 }
];

const DEMO_USERS = [
  { name: "John Doe", email: "john.demo@example.com" },
  { name: "Jane Smith", email: "jane.demo@example.com" },
  { name: "Movie Critic", email: "critic.demo@example.com" }
];

async function seed() {
  console.log('Seeding demo data...');

  // 1. Create demo users
  const users = [];
  for (const u of DEMO_USERS) {
    let user = await prisma.user.findUnique({ where: { email: u.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          firebaseUid: `demo-uid-${crypto.randomBytes(4).toString('hex')}`
        }
      });
    }
    users.push(user);
  }

  // 2. Create demo movies and reviews
  for (const movieData of DEMO_MOVIES) {
    let movie = await prisma.movie.findUnique({ where: { tmdbId: movieData.tmdbId } });
    
    if (!movie) {
      movie = await prisma.movie.create({
        data: {
          tmdbId: movieData.tmdbId,
          imdbId: `demo-tt${movieData.tmdbId}`, // Mark as demo via imdbId
          title: movieData.title,
          releaseDate: new Date(movieData.release_date),
          posterUrl: movieData.poster_path,
          metadata: { overview: movieData.overview, backdrop_path: movieData.backdrop_path, vote_average: movieData.vote_average }
        }
      });
      console.log(`Created movie: ${movie.title}`);
    } else {
      // Update metadata to ensure we have backdrop_path
      await prisma.movie.update({
        where: { id: movie.id },
        data: { metadata: { overview: movieData.overview, backdrop_path: movieData.backdrop_path, vote_average: movieData.vote_average } }
      });
      console.log(`Updated movie: ${movie.title}`);
    }

    // Check if demo reviews already exist for this movie
    const existingReviews = await prisma.review.count({ where: { movieId: movie.id, source: 'DEMO' } });
    
    if (existingReviews === 0) {
      // Create 3 random reviews
      const shuffledReviews = [...DEMO_REVIEWS].sort(() => 0.5 - Math.random()).slice(0, 3);
      
      for (let i = 0; i < shuffledReviews.length; i++) {
        const reviewData = shuffledReviews[i];
        const user = users[i % users.length];

        const review = await prisma.review.create({
          data: {
            movieId: movie.id,
            userId: user.id,
            reviewText: reviewData.text,
            rating: reviewData.rating,
            source: 'DEMO',
            reviewDate: new Date()
          }
        });

        // Insert pre-computed sentiment
        await prisma.sentimentAnalysis.create({
          data: {
            reviewId: review.id,
            sentiment: reviewData.sentiment,
            score: reviewData.score,
            confidence: 0.9,
            modelProvider: 'local-distilbert'
          }
        });
      }
      console.log(`Added 3 demo reviews for ${movie.title}`);
    }
  }

  console.log('Demo data seeding completed successfully!');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
