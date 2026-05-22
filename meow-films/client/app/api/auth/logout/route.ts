import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") ?? "",
        },
        credentials: "include",
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: "Logout failed" },
        { status: response.status },
      );
    }
    return NextResponse.json({ message: "Logout successful" });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
