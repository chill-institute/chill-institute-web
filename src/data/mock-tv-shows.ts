export type MockTvShow = {
  id: number;
  title: string;
  year: string;
  rating: number;
  status: "Returning" | "Ended";
  networks: string[];
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  imdbUrl: string;
  trailerKey: string;
  seasons: {
    number: number;
    name: string;
    episodes: {
      number: number;
      title: string;
      date: string;
      runtime: string;
    }[];
  }[];
};

const POSTER_BASE = "https://image.tmdb.org/t/p/w342";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

export const mockTvShows: MockTvShow[] = [
  {
    id: 1,
    title: "The White Lotus",
    year: "2021\u2013",
    rating: 7.8,
    status: "Returning",
    networks: ["HBO"],
    posterUrl: `${POSTER_BASE}/gbSaK9v1CbcYH1ISgbM7XObD2dW.jpg`,
    backdropUrl: `${BACKDROP_BASE}/gbSaK9v1CbcYH1ISgbM7XObD2dW.jpg`,
    overview:
      "Follow the exploits of various guests and employees of a luxury resort chain whose behavior is affected by their stay at the properties.",
    imdbUrl: "https://www.imdb.com/title/tt13406094/",
    trailerKey: "TGLq7_v8_3o",
    seasons: [
      {
        number: 1,
        name: "Hawaii",
        episodes: [
          { number: 1, title: "Arrivals", date: "2021-07-11", runtime: "64 min" },
          { number: 2, title: "New Day", date: "2021-07-18", runtime: "56 min" },
          { number: 3, title: "Mysterious Monkeys", date: "2021-07-25", runtime: "52 min" },
          { number: 4, title: "Recentering", date: "2021-08-01", runtime: "57 min" },
          { number: 5, title: "The Lotus-Eaters", date: "2021-08-08", runtime: "54 min" },
          { number: 6, title: "Departures", date: "2021-08-15", runtime: "68 min" },
        ],
      },
      {
        number: 2,
        name: "Sicily",
        episodes: [
          { number: 1, title: "Ciao", date: "2022-10-30", runtime: "63 min" },
          { number: 2, title: "Italian Dream", date: "2022-11-06", runtime: "57 min" },
          { number: 3, title: "Bull Elephants", date: "2022-11-13", runtime: "60 min" },
          { number: 4, title: "In the Sandbox", date: "2022-11-20", runtime: "58 min" },
          { number: 5, title: "That's Amore", date: "2022-11-27", runtime: "65 min" },
        ],
      },
      {
        number: 3,
        name: "Thailand",
        episodes: [
          { number: 1, title: "Arrivals", date: "2025-02-16", runtime: "67 min" },
          { number: 2, title: "The Game", date: "2025-02-23", runtime: "59 min" },
          { number: 3, title: "The Masseuse", date: "2025-03-02", runtime: "62 min" },
          { number: 4, title: "Flesh", date: "2025-03-09", runtime: "58 min" },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Severance",
    year: "2022\u2013",
    rating: 8.7,
    status: "Returning",
    networks: ["Apple TV+"],
    posterUrl: `${POSTER_BASE}/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg`,
    backdropUrl: `${BACKDROP_BASE}/pPHpeI2X1qEd1CS1SeyrdhZ4qnT.jpg`,
    overview:
      "Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins a journey to discover the truth about their jobs.",
    imdbUrl: "https://www.imdb.com/title/tt11280740/",
    trailerKey: "xEQP4VVuyrY",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Good News About Hell", date: "2022-02-18", runtime: "57 min" },
          { number: 2, title: "Half Loop", date: "2022-02-18", runtime: "47 min" },
          { number: 3, title: "In Perpetuity", date: "2022-02-25", runtime: "48 min" },
          { number: 4, title: "The You You Are", date: "2022-03-04", runtime: "42 min" },
          {
            number: 5,
            title: "The Grim Barbarity of Optics and Design",
            date: "2022-03-11",
            runtime: "46 min",
          },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "Hello, Ms. Cobel", date: "2025-01-17", runtime: "55 min" },
          { number: 2, title: "Goodbye, Mrs. Selvig", date: "2025-01-24", runtime: "50 min" },
          { number: 3, title: "Who Is Alive?", date: "2025-01-31", runtime: "48 min" },
          { number: 4, title: "Woe's Hollow", date: "2025-02-07", runtime: "52 min" },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Adolescence",
    year: "2025\u2013",
    rating: 9.1,
    status: "Returning",
    networks: ["Netflix"],
    posterUrl: `${POSTER_BASE}/20i4nShZZg1g1VFHSB8xpaYM4r7.jpg`,
    backdropUrl: `${BACKDROP_BASE}/20i4nShZZg1g1VFHSB8xpaYM4r7.jpg`,
    overview:
      "A British anthology drama examining the pressures, joys, and anxieties of modern adolescence, each episode filmed in a single continuous take.",
    imdbUrl: "https://www.imdb.com/title/tt32355096/",
    trailerKey: "Y-El4m3IRHY",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Episode 1", date: "2025-03-13", runtime: "55 min" },
          { number: 2, title: "Episode 2", date: "2025-03-13", runtime: "48 min" },
          { number: 3, title: "Episode 3", date: "2025-03-13", runtime: "52 min" },
          { number: 4, title: "Episode 4", date: "2025-03-13", runtime: "50 min" },
        ],
      },
    ],
  },
  {
    id: 4,
    title: "The Last of Us",
    year: "2023\u2013",
    rating: 8.8,
    status: "Returning",
    networks: ["HBO"],
    posterUrl: `${POSTER_BASE}/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg`,
    backdropUrl: `${BACKDROP_BASE}/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg`,
    overview:
      "Joel and Ellie, a pair connected through the harshness of the world they live in, must navigate a post-apocalyptic United States overrun by deadly fungal infection.",
    imdbUrl: "https://www.imdb.com/title/tt3581920/",
    trailerKey: "uLtkt8BonwM",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          {
            number: 1,
            title: "When You're Lost in the Darkness",
            date: "2023-01-15",
            runtime: "81 min",
          },
          { number: 2, title: "Infected", date: "2023-01-22", runtime: "52 min" },
          { number: 3, title: "Long Long Time", date: "2023-01-29", runtime: "76 min" },
          { number: 4, title: "Please Hold to My Hand", date: "2023-02-05", runtime: "44 min" },
          { number: 5, title: "Endure and Survive", date: "2023-02-12", runtime: "58 min" },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "Future Days", date: "2025-04-13", runtime: "65 min" },
          { number: 2, title: "Patrol", date: "2025-04-20", runtime: "55 min" },
          { number: 3, title: "Burnout", date: "2025-04-27", runtime: "58 min" },
        ],
      },
    ],
  },
  {
    id: 5,
    title: "Andor",
    year: "2022\u2013",
    rating: 8.4,
    status: "Returning",
    networks: ["Disney+"],
    posterUrl: `${POSTER_BASE}/khZqmwHQicTYoS7Flreb9EddFZC.jpg`,
    backdropUrl: `${BACKDROP_BASE}/khZqmwHQicTYoS7Flreb9EddFZC.jpg`,
    overview:
      "The tale of the burgeoning rebellion against the Empire and how people and planets became involved. Follows the journey of rebel spy Cassian Andor during the formative years of the Rebellion.",
    imdbUrl: "https://www.imdb.com/title/tt9253284/",
    trailerKey: "cKOegEuCcfw",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Kassa", date: "2022-09-21", runtime: "39 min" },
          { number: 2, title: "That Would Be Me", date: "2022-09-21", runtime: "36 min" },
          { number: 3, title: "Reckoning", date: "2022-09-21", runtime: "44 min" },
          { number: 4, title: "Aldhani", date: "2022-09-28", runtime: "46 min" },
          { number: 5, title: "The Axe Forgets", date: "2022-10-05", runtime: "43 min" },
          { number: 6, title: "The Eye", date: "2022-10-12", runtime: "48 min" },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "Rix Road", date: "2025-04-22", runtime: "50 min" },
          { number: 2, title: "Funeral", date: "2025-04-29", runtime: "45 min" },
          { number: 3, title: "Prodigal", date: "2025-05-06", runtime: "48 min" },
        ],
      },
    ],
  },
  {
    id: 6,
    title: "Sh\u014Dgun",
    year: "2024\u2013",
    rating: 8.7,
    status: "Returning",
    networks: ["FX"],
    posterUrl: `${POSTER_BASE}/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg`,
    backdropUrl: `${BACKDROP_BASE}/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg`,
    overview:
      "In Japan in the year 1600, at the dawn of a century-defining civil war, Lord Yoshii Toranaga is fighting for his life as his enemies on the Council of Regents unite against him.",
    imdbUrl: "https://www.imdb.com/title/tt2788316/",
    trailerKey: "nHgD-HEMDAo",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Anjin", date: "2024-02-27", runtime: "72 min" },
          { number: 2, title: "Servants of Two Masters", date: "2024-02-27", runtime: "59 min" },
          { number: 3, title: "Tomorrow Is Tomorrow", date: "2024-03-05", runtime: "54 min" },
          { number: 4, title: "The Eightfold Fence", date: "2024-03-12", runtime: "58 min" },
          { number: 5, title: "Broken to the Fist", date: "2024-03-19", runtime: "61 min" },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "The Return", date: "2025-07-01", runtime: "65 min" },
          { number: 2, title: "Crimson Sky", date: "2025-07-08", runtime: "58 min" },
          { number: 3, title: "The Sword and the Pen", date: "2025-07-15", runtime: "62 min" },
        ],
      },
    ],
  },
  {
    id: 7,
    title: "Squid Game",
    year: "2021\u2013",
    rating: 7.8,
    status: "Returning",
    networks: ["Netflix"],
    posterUrl: `${POSTER_BASE}/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg`,
    backdropUrl: `${BACKDROP_BASE}/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg`,
    overview:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games. Inside, a tempting prize awaits with deadly high stakes.",
    imdbUrl: "https://www.imdb.com/title/tt10919420/",
    trailerKey: "oqxAJKy0ii4",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Red Light, Green Light", date: "2021-09-17", runtime: "60 min" },
          { number: 2, title: "Hell", date: "2021-09-17", runtime: "63 min" },
          { number: 3, title: "The Man with the Umbrella", date: "2021-09-17", runtime: "54 min" },
          { number: 4, title: "Stick to the Team", date: "2021-09-17", runtime: "56 min" },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "Bread and Lottery", date: "2024-12-26", runtime: "57 min" },
          { number: 2, title: "Halloween Party", date: "2024-12-26", runtime: "52 min" },
          { number: 3, title: "001", date: "2024-12-26", runtime: "55 min" },
          { number: 4, title: "Six Legs", date: "2024-12-26", runtime: "48 min" },
        ],
      },
    ],
  },
  {
    id: 8,
    title: "Slow Horses",
    year: "2022\u2013",
    rating: 8.2,
    status: "Returning",
    networks: ["Apple TV+"],
    posterUrl: `${POSTER_BASE}/dnpatlJrEPiDSn5fzgzvxtiSnMo.jpg`,
    backdropUrl: `${BACKDROP_BASE}/dnpatlJrEPiDSn5fzgzvxtiSnMo.jpg`,
    overview:
      "Follow a dysfunctional team of MI5 agents \u2014 and their obnoxious boss, the brilliant but dishevelled Jackson Lamb \u2014 as they navigate the world of espionage.",
    imdbUrl: "https://www.imdb.com/title/tt5875444/",
    trailerKey: "L3a5y4Jvnpk",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Failure's Contagious", date: "2022-04-01", runtime: "47 min" },
          { number: 2, title: "Work Drinks", date: "2022-04-01", runtime: "42 min" },
          { number: 3, title: "Bad Tradecraft", date: "2022-04-08", runtime: "44 min" },
          { number: 4, title: "Visiting Hours", date: "2022-04-15", runtime: "39 min" },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "Last Stop", date: "2022-12-02", runtime: "48 min" },
          { number: 2, title: "From Upshott with Love", date: "2022-12-02", runtime: "42 min" },
          { number: 3, title: "Drinking Games", date: "2022-12-09", runtime: "44 min" },
        ],
      },
      {
        number: 3,
        name: "Season 3",
        episodes: [
          { number: 1, title: "Strange Games", date: "2023-11-29", runtime: "50 min" },
          { number: 2, title: "Hard Lessons", date: "2023-11-29", runtime: "45 min" },
          { number: 3, title: "Negotiating with Tigers", date: "2023-12-06", runtime: "47 min" },
        ],
      },
    ],
  },
  {
    id: 9,
    title: "Breaking Bad",
    year: "2008\u20132013",
    rating: 9.5,
    status: "Ended",
    networks: ["AMC"],
    posterUrl: `${POSTER_BASE}/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg`,
    backdropUrl: `${BACKDROP_BASE}/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg`,
    overview:
      "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family's future.",
    imdbUrl: "https://www.imdb.com/title/tt0903747/",
    trailerKey: "HhesaQXLnao",
    seasons: [
      {
        number: 1,
        name: "Season 1",
        episodes: [
          { number: 1, title: "Pilot", date: "2008-01-20", runtime: "58 min" },
          { number: 2, title: "Cat's in the Bag...", date: "2008-01-27", runtime: "48 min" },
          {
            number: 3,
            title: "...And the Bag's in the River",
            date: "2008-02-10",
            runtime: "48 min",
          },
          { number: 4, title: "Cancer Man", date: "2008-02-17", runtime: "48 min" },
        ],
      },
      {
        number: 2,
        name: "Season 2",
        episodes: [
          { number: 1, title: "Seven Thirty-Seven", date: "2009-03-08", runtime: "47 min" },
          { number: 2, title: "Grilled", date: "2009-03-15", runtime: "47 min" },
          { number: 3, title: "Bit by a Dead Bee", date: "2009-03-22", runtime: "47 min" },
          { number: 4, title: "Down", date: "2009-03-29", runtime: "47 min" },
          { number: 5, title: "Breakage", date: "2009-04-05", runtime: "47 min" },
        ],
      },
      {
        number: 3,
        name: "Season 3",
        episodes: [
          { number: 1, title: "No Mas", date: "2010-03-21", runtime: "47 min" },
          { number: 2, title: "Caballo sin Nombre", date: "2010-03-28", runtime: "47 min" },
          { number: 3, title: "I.F.T.", date: "2010-04-04", runtime: "47 min" },
          { number: 4, title: "Green Light", date: "2010-04-11", runtime: "47 min" },
        ],
      },
    ],
  },
];

export const networkFilters = [
  "All",
  "HBO",
  "Netflix",
  "Apple TV+",
  "Disney+",
  "FX",
  "AMC",
] as const;
