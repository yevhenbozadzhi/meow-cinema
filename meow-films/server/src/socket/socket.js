export const getRoomStatus = async (io, roomId) => {
  if (!io) {
    return { roomSize: 0 };
  }
  const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
  return { roomSize };
};
