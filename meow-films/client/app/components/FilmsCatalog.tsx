"use client";
import { Film } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "./Button";
import Select from "./Select";
import Input from "./Input";
import { Search } from "lucide-react";
import { addFavorite, getFavorites } from "@/lib/favorites";
import Pagination from "./Pagination";

type Category = "popular" | "top_rated" | "upcoming" | "now_playing";

export default function FilmsCatalog() {
  const [movies, setMovies] = useState<Film[]>([]);
  const [category, setCategory] = useState<Category>("popular");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadFavoriteIds = async () => {
      const data = await getFavorites();
      if (!data?.favorite) return;
      setFavoriteIds(
        new Set(
          data.favorite.map((item: { movieId: string }) => String(item.movieId)),
        ),
      );
    };
    void loadFavoriteIds();
  }, []);

  useEffect(() => {
    const loadFilms = async () => {
      try {
        setLoading(true);
        const url = searchQuery
          ? `/api/movie?query=${encodeURIComponent(searchQuery)}&page=${currentPage}`
          : `/api/movie?category=${category}&page=${currentPage}`;
        const data = await fetch(url).then((res) => res.json());
        setMovies(data.results ?? []);
        setTotalPages(data.total_pages ?? 1);
      } catch (error) {
        console.error("Failed to load films:", error);
        setMovies([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    void loadFilms();
  }, [category, currentPage, searchQuery]);

  const handleCategoryChange = (value: Category) => {
    setCategory(value);
    setCurrentPage(1);
    setSearchInput("");
    setSearchQuery("");
  };

  const handleSearch = () => {
    const trimmed = searchInput.trim();
    if (trimmed === searchQuery) return;
    setSearchQuery(trimmed);
    setCurrentPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleAddFavorite = async (
    e: React.MouseEvent<HTMLButtonElement>,
    movieId: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await addFavorite(movieId);
    if (result !== null) {
      setFavoriteIds((prev) => new Set(prev).add(movieId));
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-10 sm:gap-6 sm:px-6 lg:gap-8">
      <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative w-full min-w-0 sm:max-w-md lg:max-w-xl">
          <Input
            type="text"
            placeholder="Search for a movie"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-11 w-full pr-12"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            type="button"
            aria-label="Search"
            className="absolute top-1/2 right-1.5 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md bg-[#c38eb4] transition-all duration-300 hover:bg-[#86a9cf] disabled:opacity-50"
          >
            <Search className="h-4 w-4 text-white" aria-hidden />
          </button>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <span className="text-sm font-semibold text-white sm:text-base">
            Filters:
          </span>
          <Select
            className="h-11 w-full min-w-0 rounded-md bg-[#c38eb4] p-2 text-white sm:min-w-[10rem] sm:w-auto"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as Category)}
          >
            <option value="popular">Popular</option>
            <option value="top_rated">Top Rated</option>
            <option value="upcoming">Upcoming</option>
            <option value="now_playing">Now Playing</option>
          </Select>
        </div>
      </div>

      {loading && movies.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/80 sm:text-base">
          Loading movies…
        </p>
      ) : null}

      {!loading && movies.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/80 sm:text-base">
          No movies found. Try another search or filter.
        </p>
      ) : null}

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {movies.map((film) => {
          const inFavorites = favoriteIds.has(String(film.id));
          return (
            <Link
              key={film.id}
              href={`/movie/${film.id}`}
              className="group flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-gray-900/55 p-3 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02] sm:p-4"
            >
              <h2 className="line-clamp-2 min-h-12 text-center text-base font-bold text-slate-100 transition-colors group-hover:text-white sm:min-h-13 sm:text-lg">
                {film.title}
              </h2>

              <div className="relative mt-2 mb-4 aspect-[2/3] w-full shrink-0 overflow-hidden rounded-md">
                {film.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                    alt={film.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-700 text-sm text-gray-300">
                    No image
                  </div>
                )}
              </div>

              <p className="line-clamp-3 min-h-16 text-sm text-slate-300 transition-colors group-hover:text-white sm:min-h-18">
                {film.overview
                  ? film.overview.length > 100
                    ? `${film.overview.slice(0, 100)}...`
                    : film.overview
                  : "No overview"}
              </p>

              <div className="mt-auto flex w-full flex-col gap-2 pt-2">
                <div className="flex w-full flex-row items-start justify-between gap-2 text-xs text-slate-300 sm:text-sm">
                  <p className="min-w-0 shrink">
                    {new Date(film.release_date ?? "").toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      },
                    )}
                  </p>
                  <p className="shrink-0 transition-colors group-hover:text-white">
                    ★ {film.vote_average?.toFixed(1)}
                  </p>
                </div>
                {inFavorites ? (
                  <span className="text-center text-sm font-medium text-[#c38eb4]">
                    In favorites
                  </span>
                ) : (
                  <Button
                    type="button"
                    onClick={(e) => handleAddFavorite(e, String(film.id))}
                    disabled={loading}
                    className="w-full text-sm sm:text-base"
                  >
                    Add to Favorites
                  </Button>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        className="px-2"
      />
    </section>
  );
}
