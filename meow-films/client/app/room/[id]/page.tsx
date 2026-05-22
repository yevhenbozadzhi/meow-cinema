"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import { RemotePlayback, useRoomSocket } from "@/lib/useRoomSocket";
import { Room, TmdbVideo } from "@/lib/types";
import { ArrowLeftIcon } from "lucide-react";

const SEEK_THRESHOLD_SEC = 1.5;

function pickYouTubeTrailerSrc(movie: {
  videos?: { results?: TmdbVideo[] };
}): string | null {
  const results = movie.videos?.results ?? [];
  const yt = (v: TmdbVideo) => v.site === "YouTube";
  const clip =
    results.find(
      (value) => yt(value) && value.type === "Trailer" && value.official,
    ) ??
    results.find((value) => yt(value) && value.type === "Trailer") ??
    results.find((value) => yt(value) && value.type === "Teaser") ??
    results.find((value) => yt(value));
  return clip ? `https://www.youtube.com/watch?v=${clip.key}` : null;
}

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const isRemoteAction = useRef(false);
  const lastTimeRef = useRef(0);
  const seekDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { id } = use(params);

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trailerSrc, setTrailerSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  const getCurrentTime = () => playerRef.current?.currentTime ?? 0;

  const seekTo = (time: number) => {
    const el = playerRef.current;
    if (el) {
      el.currentTime = time;
    }
    lastTimeRef.current = time;
  };

  const handleRemotePlayback = (payload: RemotePlayback) => {
    isRemoteAction.current = true;
    seekTo(payload.time);

    if (payload.type === "play") {
      setPlaying(true);
    } else if (payload.type === "pause") {
      setPlaying(false);
    }

    window.setTimeout(() => {
      isRemoteAction.current = false;
    }, 150);
  };

  const { connected, peerEvents, emitPlay, emitPause, emitSeek } =
    useRoomSocket(id, { onRemotePlayback: handleRemotePlayback });

  useEffect(() => {
    const fetchRoom = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized");
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/room?roomId=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setRoom(data.room);
      } else {
        setError(data.error);
        router.push("/login");
      }
    };
    void fetchRoom();
  }, [id, router]);

  useEffect(() => {
    if (!room?.movieId) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(`/api/movie/${room.movieId}`);
        if (!res.ok) return;
        const movie = (await res.json()) as {
          videos?: { results?: TmdbVideo[] };
        };
        if (!cancelled) setTrailerSrc(pickYouTubeTrailerSrc(movie));
      } catch {
        if (!cancelled) setTrailerSrc(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [room?.movieId]);

  useEffect(() => {
    return () => {
      if (seekDebounceRef.current) {
        clearTimeout(seekDebounceRef.current);
      }
    };
  }, []);

  const handleTimeUpdate = () => {
    const current = getCurrentTime();
    const delta = Math.abs(current - lastTimeRef.current);

    if (!isRemoteAction.current && playing && delta > SEEK_THRESHOLD_SEC) {
      if (seekDebounceRef.current) {
        clearTimeout(seekDebounceRef.current);
      }
      seekDebounceRef.current = setTimeout(() => {
        if (!isRemoteAction.current) {
          emitSeek(getCurrentTime());
        }
      }, 400);
    }

    lastTimeRef.current = current;
  };

  const handlePlay = () => {
    if (isRemoteAction.current) return;
    setPlaying(true);
    emitPlay(getCurrentTime());
  };

  const handlePause = () => {
    if (isRemoteAction.current) return;
    setPlaying(false);
    emitPause(getCurrentTime());
  };

  const handleSeeked = () => {
    if (isRemoteAction.current) return;
    const time = getCurrentTime();
    lastTimeRef.current = time;
    emitSeek(time);
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-gray-900/60 p-8 text-center shadow-xl ring-1 ring-red-500/20 backdrop-blur-sm">
          <p className="text-lg font-medium text-red-400">{error}</p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-[#c38eb4] underline-offset-4 hover:underline"
          >
            To the login page
          </Link>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#c38eb4]/30 border-t-[#c38eb4]" />
        <p className="text-sm text-slate-400">Loading room…</p>
      </div>
    );
  }

  const posterUrl =
    room.moviePoster && room.moviePoster !== ""
      ? `https://image.tmdb.org/t/p/w780${room.moviePoster}`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/75 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-[#c38eb4]"
          >
            <ArrowLeftIcon className="w-4 h-4" /> To the main page
          </Link>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                connected
                  ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                  : "bg-amber-500/15 text-amber-200 ring-amber-500/30"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  connected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              {connected ? "Online" : "Connecting…"}
            </span>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden">
        {posterUrl ? (
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
            <Image
              src={posterUrl}
              alt=""
              fill
              className="scale-105 object-cover object-center blur-2xl"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/95 to-slate-950" />
          </div>
        ) : (
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0d1b2a] via-slate-900 to-[#1b263b]" />
        )}

        <div className="container mx-auto max-w-6xl px-4 pb-10 pt-8 md:pb-14 md:pt-10">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-end md:gap-10">
            <div className="relative aspect-[2/3] w-44 shrink-0 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 sm:w-52 md:w-56">
              {posterUrl ? (
                <Image
                  src={posterUrl}
                  alt={room.movieTitle}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 11rem, 14rem"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-800 text-center text-sm text-slate-400">
                  No poster
                </div>
              )}
            </div>

            <div className="w-full max-w-2xl flex-1 text-center md:text-left">
              <p className="text-xs font-medium uppercase tracking-widest text-[#c38eb4]/90">
                Watch room
              </p>
              <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
                {room.movieTitle}
              </h1>
              <p className="mt-3 font-mono text-xs text-slate-500 sm:text-sm">
                ID: {room.id}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  Status: {room.status}
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                  In room: {Math.max(peerEvents, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl ring-1 ring-white/5 backdrop-blur-sm">
              <div className="aspect-video w-full">
                {trailerSrc ? (
                  <ReactPlayer
                    ref={playerRef}
                    src={trailerSrc}
                    controls
                    playing={playing}
                    width="100%"
                    height="100%"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onTimeUpdate={handleTimeUpdate}
                    onSeeked={handleSeeked}
                  />
                ) : (
                  <div className="flex h-full min-h-[12rem] flex-col items-center justify-center gap-2 bg-slate-900/80 px-6 text-center text-slate-500">
                    <p className="text-sm">Trailer not available</p>
                    <p className="max-w-xs text-xs text-slate-600">
                      There is no trailer for this movie in the TMDB database.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="flex flex-col justify-center rounded-2xl border border-white/10 bg-gray-800/40 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-white">
              Synchronous viewing
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Play, pause, and seek are synced with everyone in this room via
              WebSocket. The indicator above shows your connection to the
              server.
            </p>
            <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-right text-slate-300">
                  {new Date(room.createdAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </div>
  );
}
