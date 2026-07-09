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
    const contentType = res.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : null;
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message ?? data?.error ?? "Refresh failed" },
        { status: res.status },
      );
    }
    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
