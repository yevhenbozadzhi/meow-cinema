import prisma from "../../prisma.js";
import { ZodError } from "zod";

export async function sendMessageRoom(userId, roomId, message) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
    });
    if (!user || !room) {
      throw new Error("User or room not found");
    }

    const chatMessage = await prisma.roomChat.create({
      data: {
        userId: userId,
        roomId: roomId,
        message: message,
      },
      include: {
        user: {
          include: { profile: true },
        },
        room: true,
      },
    });
    return {
      success: true,
      message: chatMessage,
      user: chatMessage.user,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw error;
  }
}

export async function getChatMessages(roomId, limit = 50) {
  try {
    const messages = await prisma.roomChat.findMany({
      where: {
        roomId: roomId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      include: {
        user: {
          include: { profile: true },
        },
      },
    });
    return {
      success: true,
      messages: messages,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw error;
  }
}
