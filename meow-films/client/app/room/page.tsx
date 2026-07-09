"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, LogOut } from "lucide-react";
import Button from "@/app/components/Button";
import { Room } from "@/lib/types";
import Pagination from "../components/Pagination";
import { RoomsGridSkeleton } from "../components/skeleton/Skeleton";

export default function RoomIndexPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [leavingId, setLeavingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [roomsRes, meRes] = await Promise.all([
          fetch("/api/room", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const roomsData = await roomsRes.json();
        if (cancelled) return;

        if (!roomsRes.ok || !roomsData.success) {
          setError(roomsData.error ?? "Failed to load rooms");
          setRooms([]);
          return;
        }

        setRooms(roomsData.rooms ?? []);

        if (meRes.ok) {
          const me = await meRes.json();
          setUserId(me.id ?? null);
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load rooms");
          setRooms([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setDeletingId(roomId);
    try {
      const res = await fetch(`/api/room/${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to delete room");
        return;
      }
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch {
      setError("Failed to delete room");
    } finally {
      setDeletingId(null);
    }
  };

  const handleLeaveRoom = async (roomId: string) => {
    if (!confirm("Leave this room? It will disappear from your list.")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLeavingId(roomId);
    try {
      const res = await fetch(`/api/room/${roomId}/leave`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error ?? "Failed to leave room");
        return;
      }
      setRooms((prev) => prev.filter((room) => room.id !== roomId));
    } catch {
      setError("Failed to leave room");
    } finally {
      setLeavingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="container mx-auto">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-bold text-white">Rooms</h1>
          <p className="mt-2 text-sm text-slate-400">
            Rooms you created or joined. Leave a room to hide it from this list.
          </p>
        </div>

        {loading && <RoomsGridSkeleton />}

        {!loading && error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && rooms.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-10 text-center shadow-xl ring-1 ring-white/5">
            <p className="text-slate-300">No rooms in your list yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Create a room from a movie page or join one by opening its link.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#c38eb4] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b37eb4]"
            >
              Browse movies
            </Link>
          </div>
        )}

        {!loading && rooms.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rooms.map((room) => {
              const posterUrl =
                room.moviePoster && room.moviePoster !== ""
                  ? `https://image.tmdb.org/t/p/w342${room.moviePoster}`
                  : null;
              const isHost = userId === room.hostUserId;

              return (
                <li
                  key={room.id}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-gray-800/40 shadow-xl ring-1 ring-white/5 backdrop-blur-sm"
                >
                  <Link href={`/room/${room.id}`} className="block">
                    <div className="relative aspect-video bg-slate-900">
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={room.movieTitle}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-500">
                          No poster
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="line-clamp-2 font-semibold text-white">
                        {room.movieTitle}
                      </h2>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                          {room.status}
                        </span>
                        <span>{new Date(room.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                  {isHost ? (
                    <div className="border-t border-white/10 px-4 py-3">
                      <Button
                        type="button"
                        disabled={deletingId === room.id}
                        onClick={() => void handleDeleteRoom(room.id)}
                        className="flex w-full items-center justify-center gap-2 bg-red-900/60 text-sm hover:bg-red-800/80"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === room.id ? "Deleting…" : "Delete room"}
                      </Button>
                    </div>
                  ) : (
                    <div className="border-t border-white/10 px-4 py-3">
                      <Button
                        type="button"
                        disabled={leavingId === room.id}
                        onClick={() => void handleLeaveRoom(room.id)}
                        className="flex w-full items-center justify-center gap-2 bg-slate-700/80 text-sm hover:bg-slate-600/80"
                      >
                        <LogOut className="h-4 w-4" />
                        {leavingId === room.id ? "Leaving…" : "Leave room"}
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        loading={loading}
        className="px-2"
      />
    </div>
  );
}
