import { getFilmsBySearch } from "@/lib/films";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }
    const films = await getFilmsBySearch(query);
    return NextResponse.json(films);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch films" },
      { status: 500 },
    );
  } finally {
    console.log("Films fetched successfully");
  }
}
