import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("Authorization");
    const { movieId, movieTitle, moviePoster } = await req.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/room/room`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth ?? "",
        },
        body: JSON.stringify({ movieId, movieTitle, moviePoster }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message ?? data.error ?? "Failed to create room",
          issues: data.issues,
        },
        { status: res.status },
      );
    }
    return NextResponse.json({ success: true, room: data.room });
  } catch (error) {
    console.error("Failed to create room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create room" },
      { status: 500 },
    );
  }

}

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("Authorization");
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");
    if (!roomId) {
      return NextResponse.json(
        { success: false, error: "Room ID is required" },
        { status: 400 },
      );
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/room/room/${roomId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth ?? "",
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to get room");
    }
    const data = await res.json();
    return NextResponse.json({
      success: true,
      room: data.room,
      stats: data.stats,
    });
  } catch (error) {
    console.error("Failed to get room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get room" },
      { status: 500 },
    );
  }
}
