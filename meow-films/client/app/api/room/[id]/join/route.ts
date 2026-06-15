import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = req.headers.get("Authorization");
    const { id } = await params;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/room/room/${id}/join`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: auth ?? "",
        },
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message ?? data.error ?? "Failed to join room",
        },
        { status: res.status },
      );
    }
    return NextResponse.json({ success: true, room: data.room });
  } catch (error) {
    console.error("Failed to join room:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join room" },
      { status: 500 },
    );
  }
}
