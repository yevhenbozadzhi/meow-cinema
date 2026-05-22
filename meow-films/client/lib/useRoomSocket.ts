"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket } from "./socket";

export type RemotePlayback = {
  type: "play" | "pause" | "seek";
  time: number;
};

type PlaybackPayload = { time: number; from?: string };

type UseRoomSocketOptions = {
  onRemotePlayback?: (payload: RemotePlayback) => void;
};

type UseRoomSocketReturn = {
  connected: boolean;
  peerEvents: number;
  emitPlay: (time: number) => void;
  emitPause: (time: number) => void;
  emitSeek: (time: number) => void;
};

export function useRoomSocket(
  roomId: string | null,
  options?: UseRoomSocketOptions,
): UseRoomSocketReturn {
  const [connected, setConnected] = useState(false);
  const [peerEvents, setPeerEvents] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const onRemotePlaybackRef = useRef(options?.onRemotePlayback);

  useEffect(() => {
    onRemotePlaybackRef.current = options?.onRemotePlayback;
  });

  useEffect(() => {
    if (!roomId) return;

    const socket = createSocket();
    socketRef.current = socket;

    const onConnect = () => {
      setConnected(true);
      socket.emit("join-room", roomId);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onUserJoined = () => {
      setPeerEvents((prev) => prev + 1);
    };

    const onUserLeft = () => {
      setPeerEvents((prev) => prev - 1);
    };

    const onPlaybackPlay = ({ time }: PlaybackPayload) => {
      onRemotePlaybackRef.current?.({ type: "play", time });
    };

    const onPlaybackPause = ({ time }: PlaybackPayload) => {
      onRemotePlaybackRef.current?.({ type: "pause", time });
    };

    const onPlaybackSeek = ({ time }: PlaybackPayload) => {
      onRemotePlaybackRef.current?.({ type: "seek", time });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("playback-play", onPlaybackPlay);
    socket.on("playback-pause", onPlaybackPause);
    socket.on("playback-seek", onPlaybackSeek);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.emit("leave-room", roomId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("playback-play", onPlaybackPlay);
      socket.off("playback-pause", onPlaybackPause);
      socket.off("playback-seek", onPlaybackSeek);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomId]);

  const emitPlay = useCallback(
    (time: number) => {
      if (!roomId) return;
      socketRef.current?.emit("playback-play", { roomId, time });
    },
    [roomId],
  );

  const emitPause = useCallback(
    (time: number) => {
      if (!roomId) return;
      socketRef.current?.emit("playback-pause", { roomId, time });
    },
    [roomId],
  );

  const emitSeek = useCallback(
    (time: number) => {
      if (!roomId) return;
      socketRef.current?.emit("playback-seek", { roomId, time });
    },
    [roomId],
  );

  return {
    connected,
    peerEvents,
    emitPlay,
    emitPause,
    emitSeek,
  };
}
