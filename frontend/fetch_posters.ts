async function test() {
  const res = await fetch('https://itunes.apple.com/search?term=parasite+movie&entity=movie');
  const data = await res.json();
  const movie = data.results[0];
  if (movie) {
    console.log(movie.artworkUrl100.replace('100x100bb', '600x600bb'));
  } else {
    console.log('Not found');
  }
}
test();
