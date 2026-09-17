import fs from 'fs';
import csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

const MOVIES = [
  "Inception", 
  "The Dark Knight", 
  "Interstellar", 
  "Avengers: Endgame", 
  "Fight Club", 
  "Forrest Gump", 
  "The Matrix", 
  "Harry Potter and the Sorcerer's Stone", 
  "The Lord of the Rings: The Fellowship of the Ring", 
  "Black Panther"
];

const AUTHORS = [
  "Cinephile99", "MovieBuff", "FilmCritic", "JohnDoe", "SarahConnor",
  "PopcornLover", "ReelTalk", "ScreenWatcher", "ActionFan", "SciFiNerd",
  "ClassicWatcher", "DramaQueen", "ThrillerSeeker", "ComedyKing", "BlockbusterFan"
];

async function ingestCsv() {
  console.log("Starting IMDB Dataset ingestion...");
  
  // Create or get the 10 movies
  const movieIds: string[] = [];
  for (const title of MOVIES) {
    let movie = await prisma.movie.findFirst({ where: { title } });
    if (!movie) {
      movie = await prisma.movie.create({
        data: { title }
      });
    }
    movieIds.push(movie.id);
  }

  // Create or get the synthetic users for authors
  const authorUserIds: Record<string, string> = {};
  for (const author of AUTHORS) {
    let user = await prisma.user.findFirst({ where: { firebaseUid: `csv_${author}` } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: `csv_${author}`,
          name: author,
          email: `${author.toLowerCase()}@sentix.local`,
          role: "USER"
        }
      });
    }
    authorUserIds[author] = user.id;
  }

  const csvFilePath = path.join(__dirname, '../../../../data/IMDB Dataset.csv');
  
  const reviews: any[] = [];
  
  return new Promise((resolve, reject) => {
    let count = 0;
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (row) => {
        // Limit to 20000 reviews for performance
        if (count >= 20000) return;
        
        const reviewText = row.review.replace(/<br \/>/g, '\n');
        const sentiment = row.sentiment; // 'positive' or 'negative'
        
        // Randomly assign a movie
        const randomMovieId = movieIds[Math.floor(Math.random() * movieIds.length)];
        
        // Generate a random rating based on sentiment
        let rating = 5;
        if (sentiment === 'positive') {
          rating = Math.floor(Math.random() * 4) + 7; // 7 to 10
        } else if (sentiment === 'negative') {
          rating = Math.floor(Math.random() * 4) + 1; // 1 to 4
        }
        
        // Use externalReviewId to store the author since Review schema doesn't have an author field
        const author = AUTHORS[Math.floor(Math.random() * AUTHORS.length)];
        const externalReviewId = `csv_${author}_${count}`;
        const userId = authorUserIds[author];
        
        reviews.push({
          movieId: randomMovieId,
          userId,
          externalReviewId,
          reviewText,
          rating,
          source: "IMDB_CSV"
        });
        
        count++;
      })
      .on('end', async () => {
        console.log(`Parsed ${reviews.length} reviews. Inserting into DB...`);
        try {
          // Process in batches of 1000
          const batchSize = 1000;
          for (let i = 0; i < reviews.length; i += batchSize) {
            const batch = reviews.slice(i, i + batchSize);
            await prisma.review.createMany({
              data: batch,
              skipDuplicates: true
            });
            console.log(`Inserted batch ${Math.floor(i / batchSize) + 1} / ${Math.ceil(reviews.length / batchSize)}...`);
          }
          console.log("Ingestion complete!");
          resolve(true);
        } catch (error) {
          console.error("Error inserting reviews:", error);
          reject(error);
        } finally {
          await prisma.$disconnect();
        }
      })
      .on('error', (error) => {
        console.error("CSV Parse Error:", error);
        reject(error);
      });
  });
}

ingestCsv().catch(console.error);
