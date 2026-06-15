"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactPlayer from "react-player";
import { RemotePlayback, useRoomSocket } from "@/lib/useRoomSocket";
import { Room, TmdbVideo } from "@/lib/types";
import { ArrowLeftIcon, ChevronDown, MessageSquare, X } from "lucide-react";
import Input from "@/app/components/Input";
import Button from "@/app/components/Button";

const REMOTE_GUARD_MS = 500;
/** Only jump timeline when local and remote time differ more than this (seconds). */
const SYNC_TIME_THRESHOLD_SEC = 2;

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
  const remoteGuardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { id } = use(params);

  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trailerSrc, setTrailerSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const getCurrentTime = () => playerRef.current?.currentTime ?? 0;

  const seekTo = (time: number) => {
    const el = playerRef.current;
    if (el) {
      el.currentTime = time;
    }
  };

  const startRemoteGuard = () => {
    isRemoteAction.current = true;
    if (remoteGuardRef.current) {
      clearTimeout(remoteGuardRef.current);
    }
    remoteGuardRef.current = setTimeout(() => {
      isRemoteAction.current = false;
      remoteGuardRef.current = null;
    }, REMOTE_GUARD_MS);
  };

  const handleRemotePlayback = useCallback((payload: RemotePlayback) => {
    startRemoteGuard();

    const shouldSyncTime =
      payload.type === "seek" ||
      Math.abs(getCurrentTime() - payload.time) > SYNC_TIME_THRESHOLD_SEC;

    if (shouldSyncTime) {
      seekTo(payload.time);
    }

    if (payload.type === "play") {
      setPlaying(true);
    } else if (payload.type === "pause") {
      setPlaying(false);
    }
  }, []);

  const {
    connected,
    peerEvents,
    emitPlay,
    emitPause,
    emitSeek,
    emitChatMessage,
    chatMessages,
    getChatMessages,
  } = useRoomSocket(id, userId, { onRemotePlayback: handleRemotePlayback });

  useEffect(() => {
    if (!connected) return;
    getChatMessages(50);
  }, [getChatMessages, connected]);

  useEffect(() => {
    const fetchRoom = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized");
        router.push("/login");
        return;
      }
      const res = await fetch(`/api/room/${id}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const joinData = await res.json().catch(() => ({}));
        setError(joinData.error ?? "Failed to join room");
        return;
      }

      const roomRes = await fetch(`/api/room?roomId=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await roomRes.json();
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
      if (remoteGuardRef.current) {
        clearTimeout(remoteGuardRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.id);
      });
  }, []);

  useEffect(() => {
    if (!isChatOpen) return;
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chatMessages, isChatOpen]);

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
    emitSeek(getCurrentTime());
  };

  const handleSendMessage = () => {
    const text = messageInput.trim();
    if (!text || !userId) return;
    emitChatMessage(text);
    setMessageInput("");
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

  const handleCopeLink = () => {
    const linkShareUrl = `${window.location.origin}/room/${id}`;
    navigator.clipboard.writeText(linkShareUrl);
    alert("Link copied to clipboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pb-16">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/75 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
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

          <div className="flex flex-col gap-4 lg:col-span-2">
            <aside className="shrink-0 rounded-2xl border border-white/10 bg-gray-800/40 p-5 shadow-xl ring-1 ring-white/5 backdrop-blur-sm">
              <h2 className="text-base font-semibold text-white">
                Synchronous viewing
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Play, pause, and seek are synced with everyone in this room via
                WebSocket.
              </p>

              <Button
                type="button"
                onClick={handleCopeLink}
                className="w-full mt-4"
              >
                Copy link
              </Button>
              <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-right text-slate-300">
                    {new Date(room.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </aside>

            {/* Spacer keeps page height on desktop; visible frame shrinks when chat is closed */}
            <div className="relative shrink-0 lg:min-h-[420px]">
              {!isChatOpen && (
                <div className="rounded-2xl border border-white/10 bg-gray-800/40 p-3 shadow-xl ring-1 ring-white/5 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="group flex w-full items-center justify-between gap-3 rounded-xl border border-[#c38eb4]/25 bg-gradient-to-r from-[#c38eb4]/15 via-[#c38eb4]/5 to-transparent px-3 py-2.5 text-left transition-all duration-300 hover:border-[#c38eb4]/45 hover:from-[#c38eb4]/25 hover:shadow-lg hover:shadow-[#c38eb4]/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c38eb4]/20 text-[#c38eb4] ring-1 ring-[#c38eb4]/30 transition-transform group-hover:scale-105">
                        <MessageSquare className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white">
                          Open chat
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {chatMessages.length > 0
                            ? `${chatMessages.length} message${chatMessages.length === 1 ? "" : "s"}`
                            : "Discuss the movie together"}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-[#c38eb4]" />
                  </button>
                </div>
              )}

              <div
                className={`flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gray-800/40 shadow-xl ring-1 ring-white/5 backdrop-blur-sm transition-opacity duration-300 lg:absolute lg:inset-0 ${
                  isChatOpen
                    ? "pointer-events-auto opacity-100 max-lg:fixed max-lg:inset-x-4 max-lg:bottom-4 max-lg:z-40 max-lg:max-h-[min(70vh,520px)] max-lg:shadow-2xl max-lg:shadow-black/50"
                    : "pointer-events-none opacity-0"
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c38eb4]/20 text-[#c38eb4]">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                    <h2 className="text-base font-semibold text-white">Chat</h2>
                    {chatMessages.length > 0 && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                        {chatMessages.length}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(false)}
                    aria-label="Close chat"
                    className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div
                  ref={chatScrollRef}
                  className="chat-scroll flex-1 space-y-3 overflow-y-auto bg-slate-950/30 px-4 py-3"
                >
                  {chatMessages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      No messages yet. Say hello!
                    </p>
                  ) : (
                    chatMessages.map((message) => {
                      const isMine = message.userId === userId;

                      return (
                        <div
                          key={message.id}
                          className={`flex w-full ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                              isMine
                                ? "rounded-br-sm bg-[#c38eb4]/90 text-white"
                                : "rounded-bl-sm bg-white/10 text-slate-200"
                            }`}
                          >
                            {!isMine && (
                              <p className="mb-0.5 text-xs font-medium text-[#c38eb4]/90">
                                {message.username}
                              </p>
                            )}
                            <p className="break-words">{message.message}</p>
                            {message.createdAt && (
                              <span
                                className={`mt-1 block text-[10px] ${isMine ? "text-white/70" : "text-slate-400"}`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex gap-2 border-t border-white/10 bg-gray-900/50 p-3">
                  <Input
                    type="text"
                    placeholder="Message"
                    value={messageInput}
                    className="!border-white/10 !bg-slate-800 !text-white"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMessageInput(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    disabled={!messageInput.trim() || !userId}
                    className="shrink-0 px-4"
                    onClick={handleSendMessage}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>

            {isChatOpen && (
              <button
                type="button"
                aria-label="Close chat overlay"
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] transition-opacity lg:hidden"
                onClick={() => setIsChatOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
