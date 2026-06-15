export type Film = {
  id: string;
  poster_path?: string;
  title: string;
  overview: string;
  release_date?: string;
  vote_average?: number;
  genres?: { id: number; name: string }[];
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  className?: string;
};

export interface Room {
  id: string;
  hostUserId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string | null;
  status: string;
  createdAt: string;
}

export type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official?: boolean;
};
