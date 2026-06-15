import { Socket } from "socket.io";
import { sendMessageRoom, getChatMessages } from "../../services/chat/chat.js";

function toChatPayload(saved, user) {
  return {
    id: saved.id,
    roomId: saved.roomId,
    userId: saved.userId,
    message: saved.message,
    createdAt: saved.createdAt,
    username: user?.profile?.username ?? "User",
  };
}

export async function handleChatMessage(io, roomId, userId, message) {
  try {
    const {
      success,
      message: saved,
      user,
    } = await sendMessageRoom(userId, roomId, message);
    if (!success) {
      throw new Error("Failed to send message");
    }
    io.in(roomId).emit("chat-message", toChatPayload(saved, user));
    return {
      success: true,
      message: "Message sent to room",
      roomChat: message,
    };
  } catch (error) {
    return { success: false, message: "Failed to send message", error };
  }
}

export async function handleGetChatMessages(socket, roomId, limit) {
  try {
    const { success, messages } = await getChatMessages(roomId, limit);
    if (!success) return;
    const payload = messages
      .map((item) => toChatPayload(item, item.user))
      .reverse();
    socket.emit("chat-get-messages", payload);
  } catch (error) {
    console.error("Failed to load chat messages:", error);
  }
}
