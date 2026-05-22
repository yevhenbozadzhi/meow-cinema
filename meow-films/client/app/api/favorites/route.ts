import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { movieId } = await req.json();
    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 },
      );
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/add-favorite`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ movieId }),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to add favorite" },
        { status: res.status },
      );
    }
    return NextResponse.json(
      { message: "Favorite added successfully" },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/get-favorites`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to get favorites" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get favorites" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const token = req.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { movieId } = await req.json();
    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 },
      );
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/favorites/remove-favorite`,
      {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ movieId }),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to remove favorite" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}
