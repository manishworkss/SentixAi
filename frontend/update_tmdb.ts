import fs from 'fs';
import path from 'path';

const TMDB_PATH = path.resolve(process.cwd(), 'src/lib/tmdb.ts');

let content = fs.readFileSync(TMDB_PATH, 'utf-8');

const newMovies = `
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    poster_path: "https://m.media-amazon.com/images/I/81BvSBL8b0L._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    release_date: "2021-12-15",
    vote_average: 8.0,
    overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero."
  },
  {
    id: 238,
    title: "The Godfather",
    poster_path: "https://m.media-amazon.com/images/I/81rY1F7yv5L._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
    release_date: "1972-03-14",
    vote_average: 8.7,
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family."
  },
  {
    id: 496243,
    title: "Parasite",
    poster_path: "https://m.media-amazon.com/images/I/91Nn2T6g9hL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoZPhKwcbD3q.jpg",
    release_date: "2019-05-30",
    vote_average: 8.5,
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood."
  },
  {
    id: 680,
    title: "Pulp Fiction",
    poster_path: "https://m.media-amazon.com/images/I/81UTs3sC5hL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    release_date: "1994-09-10",
    vote_average: 8.5,
    overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge."
  },
  {
    id: 129,
    title: "Spirited Away",
    poster_path: "https://m.media-amazon.com/images/I/71O1A613U8L._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/Ab8mkHcg2YsqWvd52qwP39I1glA.jpg",
    release_date: "2001-07-20",
    vote_average: 8.5,
    overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family."
  },
  {
    id: 98,
    title: "Gladiator",
    poster_path: "https://m.media-amazon.com/images/I/81yZIMf5GqL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/ehGlsAKHGsE0PeyUaFw7100a7Qe.jpg",
    release_date: "2000-05-01",
    vote_average: 8.2,
    overview: "In the year 180, the death of emperor Marcus Aurelius throws the Roman Empire into chaos. Maximus is one of the Roman army's most capable and trusted generals and a key advisor to the emperor."
  },
  {
    id: 8587,
    title: "The Lion King",
    poster_path: "https://m.media-amazon.com/images/I/81M1I62L1pL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/wXsoX2m0iN234Iq7x6G8v2TzSXP.jpg",
    release_date: "1994-06-23",
    vote_average: 8.3,
    overview: "A young lion prince is cast out of his pride by his cruel uncle, who claims he killed his father. While the uncle rules with an iron paw, the prince grows up beyond the Savannah, living by a philosophy: No worries for the rest of your days."
  },
  {
    id: 857,
    title: "Saving Private Ryan",
    poster_path: "https://m.media-amazon.com/images/I/81b2o1E4bRL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/bdD11XyYf4oVnSj50h217lI8i6E.jpg",
    release_date: "1998-07-24",
    vote_average: 8.2,
    overview: "As U.S. troops storm the beaches of Normandy, three brothers lie dead on the battlefield, with a fourth trapped behind enemy lines. Ranger captain John Miller and seven men are tasked with penetrating German-held territory and bringing the boy home."
  },
  {
    id: 1422,
    title: "The Departed",
    poster_path: "https://m.media-amazon.com/images/I/81lZ1x-18hL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/kEGWzxs4rB7nC4k3B9jK7vR9w3l.jpg",
    release_date: "2006-10-04",
    vote_average: 8.2,
    overview: "To take down South Boston's Irish Mafia, the police send in one of their own to infiltrate the underworld, not realizing the syndicate has done likewise."
  },
  {
    id: 694,
    title: "Goodfellas",
    poster_path: "https://m.media-amazon.com/images/I/81l3A0m0eYL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/sw7mordbZxgITU877yTpZCud90M.jpg",
    release_date: "1990-09-12",
    vote_average: 8.5,
    overview: "The true story of Henry Hill, a half-Irish, half-Sicilian Brooklyn kid who is adopted by neighbourhood gangsters at an early age and climbs the ranks of a Mafia family under the guidance of Jimmy Conway."
  },
  {
    id: 274,
    title: "The Silence of the Lambs",
    poster_path: "https://m.media-amazon.com/images/I/81E1w3E8xVL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/mfwq2nMBzArzQ7Y9RKe8SK8PW82.jpg",
    release_date: "1991-02-01",
    vote_average: 8.3,
    overview: "Clarice Starling is a top student at the FBI's training academy. Jack Crawford wants Clarice to interview Dr. Hannibal Lecter, a brilliant psychiatrist who is also a violent psychopath, serving life behind bars for various acts of murder and cannibalism."
  },
  {
    id: 280,
    title: "Terminator 2: Judgment Day",
    poster_path: "https://m.media-amazon.com/images/I/81A4-Q+-mSL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/xKbVWpmxQWvI5eWpL9Wv4sW0VfJ.jpg",
    release_date: "1991-07-03",
    vote_average: 8.1,
    overview: "Nearly 10 years have passed since Sarah Connor was targeted for termination by a cyborg from the future. Now her son, John, the future leader of the resistance, is the target for a newer, more deadly terminator."
  },
  {
    id: 278,
    title: "Se7en",
    poster_path: "https://m.media-amazon.com/images/I/81B88B2pS2L._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/zB5S39T2O6lXv8q5gQvL1vHjE6H.jpg",
    release_date: "1995-09-22",
    vote_average: 8.4,
    overview: "Two homicide detectives are on a desperate hunt for a serial killer whose crimes are based on the 'seven deadly sins' in this dark and haunting film."
  },
  {
    id: 121,
    title: "The Lord of the Rings: The Two Towers",
    poster_path: "https://m.media-amazon.com/images/I/81z3eD7pXJL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/7tNnPZMcKtoXQ5lYnIuV3I4r8bN.jpg",
    release_date: "2002-12-18",
    vote_average: 8.4,
    overview: "Frodo and Sam are trekking to Mordor to destroy the One Ring of Power while Gimli, Legolas and Aragorn search for the orc-captured Merry and Pippin."
  },
  {
    id: 122,
    title: "The Lord of the Rings: The Return of the King",
    poster_path: "https://m.media-amazon.com/images/I/81yZIMf5GqL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/m9OqB5v5G8yE6lP5Z3bO4J4Zk0N.jpg",
    release_date: "2003-12-01",
    vote_average: 8.5,
    overview: "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor from Sauron's forces."
  },
  {
    id: 11,
    title: "Star Wars: Episode IV - A New Hope",
    poster_path: "https://m.media-amazon.com/images/I/81Wn2-k-cEL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/qZqWc8W6q8K4t8tJ9m5E0hDk9vK.jpg",
    release_date: "1977-05-25",
    vote_average: 8.2,
    overview: "Princess Leia is captured and held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Venturesome Luke Skywalker and dashing captain Han Solo team together with the loveable robot duo R2-D2 and C-3PO to rescue the beautiful princess."
  },
  {
    id: 604,
    title: "The Matrix Reloaded",
    poster_path: "https://m.media-amazon.com/images/I/81z1V2a4RBL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/xkbH7zX6q1Y3M9I0f5Fj9tM6J0m.jpg",
    release_date: "2003-05-15",
    vote_average: 7.0,
    overview: "Six months after the events depicted in The Matrix, Neo has proved to be a good omen for the free humans, as more and more humans are being freed from the matrix and brought to Zion, the one and only stronghold of the Resistance."
  },
  {
    id: 475557,
    title: "Joker",
    poster_path: "https://m.media-amazon.com/images/I/71I3uC9+sPL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/n6bUvigpRFqSwmwpF1m0F7eF8vL.jpg",
    release_date: "2019-10-02",
    vote_average: 8.2,
    overview: "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure."
  },
  {
    id: 329,
    title: "Jurassic Park",
    poster_path: "https://m.media-amazon.com/images/I/81H+m8+D2xL._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/k3A9gK7A4S8s4f2w5D8q7c5H7c1.jpg",
    release_date: "1993-06-11",
    vote_average: 7.9,
    overview: "A wealthy entrepreneur secretly creates a theme park featuring living dinosaurs drawn from prehistoric DNA. Before opening day, he invites a team of experts and his two eager grandchildren to experience the park."
  },
  {
    id: 424,
    title: "Schindler's List",
    poster_path: "https://m.media-amazon.com/images/I/81+H4lZVw+L._AC_UF894,1000_QL80_.jpg",
    backdrop_path: "https://image.tmdb.org/t/p/original/yR2m1NnQ5d1xP9uN5Rk3A2vH3rG.jpg",
    release_date: "1993-12-15",
    vote_average: 8.6,
    overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II."
  }
];`;

content = content.replace('];\n\nexport const TMDB_IMAGE_BASE', `,\n${newMovies}\n\nexport const TMDB_IMAGE_BASE`);

content = content.replace(
  `  getPopularMovies: async (page: number = 1): Promise<TMDBMovie[]> => {
    if (!TMDB_API_KEY) return page === 1 ? FALLBACK_MOVIES : [];`,
  `  getPopularMovies: async (page: number = 1): Promise<TMDBMovie[]> => {
    if (!TMDB_API_KEY) {
      const start = (page - 1) * 20;
      return FALLBACK_MOVIES.slice(start, start + 20);
    }`
);

content = content.replace(
  `  searchMovies: async (query: string, page: number = 1): Promise<TMDBMovie[]> => {
    if (!TMDB_API_KEY) {
      return page === 1 ? FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase())) : [];
    }`,
  `  searchMovies: async (query: string, page: number = 1): Promise<TMDBMovie[]> => {
    if (!TMDB_API_KEY) {
      const results = FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
      const start = (page - 1) * 20;
      return results.slice(start, start + 20);
    }`
);

content = content.replace(
  `    } catch (e) {
      console.warn("TMDB API Error, using fallback data.");
      return page === 1 ? FALLBACK_MOVIES : [];
    }`,
  `    } catch (e) {
      console.warn("TMDB API Error, using fallback data.");
      const start = (page - 1) * 20;
      return FALLBACK_MOVIES.slice(start, start + 20);
    }`
);

content = content.replace(
  `    } catch (e) {
      return page === 1 ? FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase())) : [];
    }`,
  `    } catch (e) {
      const results = FALLBACK_MOVIES.filter(m => m.title.toLowerCase().includes(query.toLowerCase()));
      const start = (page - 1) * 20;
      return results.slice(start, start + 20);
    }`
);

fs.writeFileSync(TMDB_PATH, content, 'utf-8');
console.log('Successfully updated tmdb.ts');
