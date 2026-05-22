import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const auth = req.headers.get("Authorization");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/profile/avatar`,
      {
        method: "PATCH",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: auth ?? "",
        },
      },
    );
    if (!res.ok) {
      throw new Error("Failed to update avatar: " + res.statusText);
    }
    const data = await res.json();
    return NextResponse.json({ success: true, avatarUrl: data.avatarUrl });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
