import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { message } = await request.json();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-chat/send-message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ message }),
      },
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ai-chat/get-chat-history`,
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
        { error: "Failed to get chat history" },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get chat history" },
      { status: 500 },
    );
  }
}
