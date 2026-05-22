import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") ?? "",
        },
        credentials: "include",
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Refresh failed" },
        { status: res.status },
      );
    }
    return NextResponse.json({ message: "Refresh successful" });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
