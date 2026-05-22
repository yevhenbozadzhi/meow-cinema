"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";

export function CreateRoomButton({
  movieId,
  movieTitle,
  moviePoster,
}: {
  movieId: string;
  movieTitle: string;
  moviePoster: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = async () => {
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, string> = { movieId, movieTitle };
      if (moviePoster != null && moviePoster !== "") {
        body.moviePoster = moviePoster;
      }

      const res = await fetch(`/api/room`, {
        method: "POST",
        body: JSON.stringify(body),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.room?.id) {
        router.push(`/room/${data.room.id}`);
        return;
      }
      setError(
        typeof data.error === "string"
          ? data.error
          : ((data.message as string) ?? "Failed to create room"),
      );
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        onClick={() => void handleCreateRoom()}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Creating…" : "Create a Room to watch together"}
      </Button>
      {error ? (
        <p className="max-w-md text-center text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
