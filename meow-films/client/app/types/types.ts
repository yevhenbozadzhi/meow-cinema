export type Favorite = {
  movieId: string;
  title?: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  genres?: { id: number; name: string }[];
  overview?: string;
  videos?: { key: string }[];
  images?: { file_path: string }[];
  backdrop_path?: string;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  vote_count?: number;
  video?: boolean;
  adult?: boolean;
};

export type ChatMessage = {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  username: string;
};

export type AIChatMessage = {
  id: string;
  userId: string;
  content: string;
  role: "USER" | "ASSISTANT";
  createdAt: string;
  isTyping?: boolean;
  requiresAuth?: boolean;
};
