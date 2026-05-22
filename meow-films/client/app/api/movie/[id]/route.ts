import { getFilmById } from "@/lib/films";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const movie = await getFilmById(id);
    return NextResponse.json(movie, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch movie" },
      { status: 500 },
    );
  }
}
