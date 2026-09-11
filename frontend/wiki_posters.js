// import fs from 'fs';
// import path from 'path';

// const TMDB_PATH = path.resolve(process.cwd(), 'src/lib/tmdb.ts');
// let content = fs.readFileSync(TMDB_PATH, 'utf-8');

// async function getWikiPoster(title) {
//   try {
//     const searchTitle = encodeURIComponent(title + " (film)");
//     const res = await fetch(\`https://en.wikipedia.org/w/api.php?action=query&titles=\${searchTitle}&prop=pageimages&format=json&pithumbsize=600\`, {
//       headers: { 'User-Agent': 'SentixAi-Agent/1.0' }
//     });
//     const data = await res.json();
//     const pages = data.query.pages;
//     const pageId = Object.keys(pages)[0];
//     if (pageId !== "-1" && pages[pageId].thumbnail) {
//       return pages[pageId].thumbnail.source;
//     }
    
//     // Try without "(film)"
//     const res2 = await fetch(\`https://en.wikipedia.org/w/api.php?action=query&titles=\${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600\`, {
//       headers: { 'User-Agent': 'SentixAi-Agent/1.0' }
//     });
//     const data2 = await res2.json();
//     const pages2 = data2.query.pages;
//     const pageId2 = Object.keys(pages2)[0];
//     if (pageId2 !== "-1" && pages2[pageId2].thumbnail) {
//       return pages2[pageId2].thumbnail.source;
//     }
//   } catch (e) {
//     console.log('Error fetching', title, e);
//   }
//   return null;
// }

// async function run() {
//   const matches = [...content.matchAll(/title:\s*"([^"]+)",\s*poster_path:\s*"([^"]+)"/g)];
  
//   for (const match of matches) {
//     const title = match[1];
//     const posterUrl = match[2];
    
//     if (posterUrl.includes('media-amazon.com')) {
//       console.log('Fetching Wiki for', title);
//       const newUrl = await getWikiPoster(title);
//       if (newUrl) {
//         content = content.replace(posterUrl, newUrl);
//         console.log('Replaced', title, '->', newUrl);
//       } else {
//         console.log('Could not find', title);
//         // Fallback to TMDB default movie
//         content = content.replace(posterUrl, 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg');
//       }
//     }
//   }
  
//   fs.writeFileSync(TMDB_PATH, content, 'utf-8');
//   console.log('Done replacing posters.');
// }

// run();
