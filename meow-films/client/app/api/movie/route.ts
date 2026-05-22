import getFilms, { getFilmsBySearch } from "@/lib/films";
import { NextResponse } from "next/server";

const ALLOWED_CATEGORIES = [
  "popular",
  "top_rated",
  "upcoming",
  "now_playing",
] as const;

type MovieCategory = (typeof ALLOWED_CATEGORIES)[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const categoryParam = searchParams.get("category") ?? "popular";
    const pageParam = searchParams.get("page") ?? "1";
    const page = Number.parseInt(pageParam, 10);

    if (Number.isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: "Page must be a positive integer" },
        { status: 400 },
      );
    }

    if (query) {
      const films = await getFilmsBySearch(query, page);
      return NextResponse.json(films, { status: 200 });
    }

    if (!ALLOWED_CATEGORIES.includes(categoryParam as MovieCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const films = await getFilms(categoryParam as MovieCategory, page);
    return NextResponse.json(films, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch films" },
      { status: 500 },
    );
  }
}
