import episode1Cover from "@/assets/episode-1-cover.jpg";
import episode2Cover from "@/assets/episode-2-cover.jpg";
import episode3Cover from "@/assets/episode-3-cover.jpg";

export interface Episode {
  id: string;
  seriesId: string;
  seriesTitle: string;
  episodeNumber: number;
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
}

export interface Series {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  genre: string;
  episodeCount: number;
  episodes: Episode[];
}

export interface ProductHotspot {
  id: string;
  productName: string;
  brand: string;
  price: string;
  imageUrl: string;
  position: { x: number; y: number };
  timestamp: number;
}

export interface WatchHistoryItem {
  episodeId: string;
  seriesTitle: string;
  episodeNumber: number;
  progress: number;
  watchedAt: string;
}

// Mock Series Data
export const mockSeries: Series[] = [
  {
    id: "series-1",
    title: "The Last Light",
    description: "A mysterious photographer discovers her camera captures moments from parallel realities. Each episode unravels another layer of a universe where every choice creates a new world.",
    coverUrl: episode1Cover,
    genre: "Drama • Mystery",
    episodeCount: 6,
    episodes: [
      {
        id: "ep-1-1",
        seriesId: "series-1",
        seriesTitle: "The Last Light",
        episodeNumber: 1,
        title: "The First Frame",
        description: "Maya finds an antique camera at a flea market that seems to photograph things that haven't happened yet.",
        duration: "4:32",
        thumbnailUrl: episode1Cover,
      },
      {
        id: "ep-1-2",
        seriesId: "series-1",
        seriesTitle: "The Last Light",
        episodeNumber: 2,
        title: "Echoes",
        description: "The photographs begin showing moments from lives Maya never lived.",
        duration: "3:58",
        thumbnailUrl: episode1Cover,
      },
      {
        id: "ep-1-3",
        seriesId: "series-1",
        seriesTitle: "The Last Light",
        episodeNumber: 3,
        title: "Convergence",
        description: "Two versions of Maya's life begin to intersect in unexpected ways.",
        duration: "4:15",
        thumbnailUrl: episode1Cover,
      },
    ],
  },
  {
    id: "series-2",
    title: "Silk & Stone",
    description: "In the world of haute couture, a young designer navigates ambition, legacy, and the price of perfection. Every stitch tells a story.",
    coverUrl: episode2Cover,
    genre: "Fashion • Drama",
    episodeCount: 8,
    episodes: [
      {
        id: "ep-2-1",
        seriesId: "series-2",
        seriesTitle: "Silk & Stone",
        episodeNumber: 1,
        title: "The Atelier",
        description: "Celine arrives at the legendary Maison Verne, where tradition meets innovation.",
        duration: "4:45",
        thumbnailUrl: episode2Cover,
      },
      {
        id: "ep-2-2",
        seriesId: "series-2",
        seriesTitle: "Silk & Stone",
        episodeNumber: 2,
        title: "First Collection",
        description: "Under pressure to prove herself, Celine takes a bold creative risk.",
        duration: "4:12",
        thumbnailUrl: episode2Cover,
      },
    ],
  },
  {
    id: "series-3",
    title: "Midnight Kitchen",
    description: "A chef's journey through the underground culinary world of a European city. Every dish holds a secret, every ingredient has a story.",
    coverUrl: episode3Cover,
    genre: "Culinary • Thriller",
    episodeCount: 5,
    episodes: [
      {
        id: "ep-3-1",
        seriesId: "series-3",
        seriesTitle: "Midnight Kitchen",
        episodeNumber: 1,
        title: "First Course",
        description: "Marco discovers a hidden kitchen beneath the city's oldest restaurant.",
        duration: "3:55",
        thumbnailUrl: episode3Cover,
      },
    ],
  },
];

// Mock Hotspots for Video Player
export const mockHotspots: ProductHotspot[] = [
  {
    id: "hotspot-1",
    productName: "Vintage Leica Camera",
    brand: "Leica",
    price: "€2,450",
    imageUrl: "/placeholder.svg",
    position: { x: 65, y: 40 },
    timestamp: 15,
  },
  {
    id: "hotspot-2",
    productName: "Silk Scarf — Nocturne",
    brand: "Maison Verne",
    price: "€320",
    imageUrl: "/placeholder.svg",
    position: { x: 30, y: 60 },
    timestamp: 45,
  },
  {
    id: "hotspot-3",
    productName: "Artisan Coffee Set",
    brand: "Atelier Noir",
    price: "€180",
    imageUrl: "/placeholder.svg",
    position: { x: 75, y: 70 },
    timestamp: 90,
  },
];

// Mock Watch History
export const mockWatchHistory: WatchHistoryItem[] = [
  {
    episodeId: "ep-1-1",
    seriesTitle: "The Last Light",
    episodeNumber: 1,
    progress: 100,
    watchedAt: "2 hours ago",
  },
  {
    episodeId: "ep-2-1",
    seriesTitle: "Silk & Stone",
    episodeNumber: 1,
    progress: 65,
    watchedAt: "Yesterday",
  },
];

// Get all episodes flattened
export const getAllEpisodes = (): Episode[] => {
  return mockSeries.flatMap((series) => series.episodes);
};

// Get series by ID
export const getSeriesById = (id: string): Series | undefined => {
  return mockSeries.find((series) => series.id === id);
};

// Get episode by ID
export const getEpisodeById = (id: string): Episode | undefined => {
  return getAllEpisodes().find((episode) => episode.id === id);
};
