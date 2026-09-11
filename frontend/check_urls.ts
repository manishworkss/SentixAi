import fs from 'fs';
import path from 'path';

const TMDB_PATH = path.resolve(process.cwd(), 'src/lib/tmdb.ts');
const content = fs.readFileSync(TMDB_PATH, 'utf-8');

// Extract all URLs
const urls = [...content.matchAll(/poster_path:\s*"([^"]+)"/g)].map(m => m[1]);

async function checkUrl(url: string) {
  if (url.startsWith('/')) {
    url = `https://image.tmdb.org/t/p/w500${url}`;
  }
  try {
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`[${res.status}] ${url}`);
  } catch (e) {
    console.log(`[ERROR] ${url} - ${e.message}`);
  }
}

async function run() {
  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
