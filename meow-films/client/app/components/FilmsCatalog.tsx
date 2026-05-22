"use client";
import { Film } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Button from "./Button";
import Select from "./Select";
import Input from "./Input";
import { Search } from "lucide-react";
import { addFavorite } from "@/lib/favorites";
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
    await addFavorite(movieId);
  };
  return (
    <div className="flex flex-col items-center justify-center gap-4 container mx-auto">
      <div className="flex flex-row items-center justify-between gap-4 w-full">
        <div className="flex flex-col md:flex-row items-center gap-2 relative">
          <Input
            type="text"
            placeholder="Search for a movie"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-10 pr-10"
          />

          <button
            onClick={handleSearch}
            disabled={loading}
            type="button"
            className="absolute right-0 p-2 m-2 bg-[#c38eb4] rounded-md hover:bg-[#b37eb4] transition-all duration-300 cursor-pointer"
          >
            <Search className="h-4 w-4 text-white" aria-hidden />
          </button>
        </div>

        <h1 className="flex flex-col md:flex-row items-center justify-center text-white text-xl md:text-2xl font-bold gap-4">
          Filters:
          <Select
            className="bg-[#c38eb4] text-white p-2 rounded-md"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value as Category)}
          >
            <option value="popular">Popular</option>
            <option value="top_rated">Top Rated</option>
            <option value="upcoming">Upcoming</option>
            <option value="now_playing">Now Playing</option>
          </Select>
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full items-stretch">
        {movies.map((film) => (
          <Link
            key={film.id}
            href={`/movie/${film.id}`}
            className="group flex h-full min-h-0 flex-col rounded-md bg-gray-800/50 p-4 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]"
          >
            <h2 className="line-clamp-2 min-h-[3.25rem] text-center text-lg font-bold text-[#0f1011] transition-colors group-hover:text-white">
              {film.title}
            </h2>

            <div className="relative mt-2 w-full h-90 shrink-0 overflow-hidden rounded-md mb-5">
              {film.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w500${film.poster_path}`}
                  alt={film.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-700 text-sm text-gray-300">
                  No image
                </div>
              )}
            </div>

            <p className=" line-clamp-3 min-h-[4.5rem]  text-sm text-[#0f1011] transition-colors group-hover:text-white">
              {film.overview
                ? film.overview.length > 100
                  ? film.overview.slice(0, 100) + "..."
                  : film.overview
                : "No overview"}
            </p>

            <div className="mt-auto flex w-full flex-col gap-2 pt-2">
              <div className="flex w-full flex-row items-start justify-between gap-2 text-xs sm:text-sm">
                <p className="min-w-0 shrink text-[#0f1011]">
                  Date:{" "}
                  {new Date(film.release_date ?? "").toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    },
                  )}
                </p>
                <p className="shrink-0 text-[#0f1011] transition-colors group-hover:text-white">
                  ★ {film.vote_average?.toFixed(1)}
                </p>
              </div>
              <Button
                type="button"
                onClick={(e) => handleAddFavorite(e, String(film.id))}
                disabled={loading}
                className="w-full"
              >
                Add to Favorites
              </Button>
            </div>
          </Link>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
      />
    </div>
  );
}
