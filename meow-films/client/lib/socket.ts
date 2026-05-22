import { io, Socket } from "socket.io-client";

export function getSocketUrl() {
  const raw = `${process.env.NEXT_PUBLIC_API_URL}`;
  return raw;
}

export function createSocket(): Socket {
  return io(getSocketUrl(), {
    withCredentials: true,
    transports: ["websocket", "polling"],
    forceNew: true,
  });
}
