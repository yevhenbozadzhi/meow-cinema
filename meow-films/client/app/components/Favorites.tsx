"use client";
import { getFavorites, removeFavorite } from "@/lib/favorites";
import { useState, useEffect, useMemo } from "react";
import { Favorite } from "../types/types";
import Link from "next/link";
import { Star, X } from "lucide-react";
import Pagination from "./Pagination";
import { FavoritesSkeleton } from "./skeleton/Skeleton";

const FAVORITES_PAGE_SIZE = 9;

export function Favorites() {
  const [favorite, setFavorite] = useState<Favorite[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(
    1,
    Math.ceil(favorite.length / FAVORITES_PAGE_SIZE),
  );
  const effectivePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (effectivePage - 1) * FAVORITES_PAGE_SIZE;
    return favorite.slice(start, start + FAVORITES_PAGE_SIZE);
  }, [favorite, effectivePage]);

  const loadFavorites = async () => {
    const data = await getFavorites();
    if (data?.favorite) {
      const details = await Promise.all(
        data.favorite.map(async (fav: { movieId: string }) => {
          const res = await fetch(`/api/movie/${fav.movieId}`);
          const movieData = await res.json();
          return { ...movieData, movieId: fav.movieId };
        }),
      );
      setFavorite(details);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadFavorites();
      setLoading(false);
    };
    load();
  }, []);

  const handleDeleteFavorite = async (
    event: React.MouseEvent<HTMLButtonElement>,
    movieId: string,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      const res = await removeFavorite(movieId);
      if (res?.success) {
        setFavorite((prev) => prev.filter((fav) => fav.movieId !== movieId));
      } else {
        setError(res?.error ?? "Failed to remove");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto mt-8">
        <h2 className="mb-4 text-xl font-bold text-white">My Favorites</h2>
        <FavoritesSkeleton />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-400">{error}</div>;
  }

  if (favorite.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">No favorites yet</div>
    );
  }

  return (
    <div className="mt-8 container mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">My Favorites</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {pageItems.map((movie) => (
          <div
            key={movie.movieId}
            className="relative group overflow-hidden rounded-lg bg-gray-800/50 p-4"
          >
            <Link href={`/movie/${movie.movieId}`} className="block">
              <img
                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                alt={movie.title}
                className="aspect-[2/3] w-full rounded object-cover"
              />
              <div className="mt-1 flex items-center justify-between gap-1">
                <h3 className="truncate text-xs font-medium text-white">
                  {movie.title}
                </h3>
                <p className="flex shrink-0 items-center gap-0.5 text-[10px] text-gray-400">
                  {movie.vote_average?.toFixed(1)}{" "}
                  <Star className="h-3 w-3 text-yellow-500" />
                </p>
              </div>
            </Link>
            <button
              type="button"
              onClick={(e) => handleDeleteFavorite(e, movie.movieId)}
              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X className="w-4 h-4 cursor-pointer text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </button>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={effectivePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        className="mt-4"
      />
    </div>
  );
}
