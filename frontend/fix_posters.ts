import fs from 'fs';
import path from 'path';

const TMDB_PATH = path.resolve(process.cwd(), 'src/lib/tmdb.ts');
let content = fs.readFileSync(TMDB_PATH, 'utf-8');

async function getItunesPoster(title: string): Promise<string | null> {
  try {
    const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(title)}+movie&entity=movie`);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
    }
  } catch (e) {
    console.log('Error fetching', title);
  }
  return null;
}

async function run() {
  const matches = [...content.matchAll(/title:\s*"([^"]+)",\s*poster_path:\s*"([^"]+)"/g)];
  
  for (const match of matches) {
    const fullMatch = match[0];
    const title = match[1];
    let posterUrl = match[2];
    
    // Check if URL is Amazon (which we know 404s mostly)
    if (posterUrl.includes('media-amazon.com')) {
      console.log('Fetching for', title);
      const newUrl = await getItunesPoster(title);
      if (newUrl) {
        content = content.replace(posterUrl, newUrl);
        console.log('Replaced', title, '->', newUrl);
      } else {
        // Fallback to Wikipedia or OMDB if possible, or just a placeholder image
        console.log('Could not find', title);
        content = content.replace(posterUrl, `https://via.placeholder.com/600x900/1a1a2e/00d2ff?text=${encodeURIComponent(title)}`);
      }
    }
  }
  
  fs.writeFileSync(TMDB_PATH, content, 'utf-8');
  console.log('Done replacing posters.');
}

run();
