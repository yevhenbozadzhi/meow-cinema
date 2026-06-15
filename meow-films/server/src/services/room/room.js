import prisma from "../../prisma.js";
import { createRoomSchema } from "../../validators/room/room.js";
import { ZodError } from "zod";

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const createRoomService = async (payload, userId) => {
  try {
    const validatedData = createRoomSchema.parse(payload);
    const room = await prisma.room.create({
      data: {
        ...validatedData,
        hostUserId: userId,
        members: {
          create: {
            userId,
            role: "HOST",
          },
        },
      },
    });
    return room;
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw createServiceError("Internal server error", 500);
  }
};

export const joinRoomService = async (roomId, userId) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });
  if (!room) {
    throw createServiceError("Room not found", 404);
  }
  if (room.status !== "OPEN") {
    throw createServiceError("Room is closed", 400);
  }

  const role = room.hostUserId === userId ? "HOST" : "MEMBER";
  await prisma.roomMember.upsert({
    where: {
      roomId_userId: { roomId, userId },
    },
    create: { roomId, userId, role },
    update: {},
  });

  return room;
};

export const leaveRoomService = async (roomId, userId) => {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });
  if (!room) {
    throw createServiceError("Room not found", 404);
  }
  if (room.hostUserId === userId) {
    throw createServiceError("Host cannot leave — delete the room instead", 403);
  }

  await prisma.roomMember.delete({
    where: {
      roomId_userId: { roomId, userId },
    },
  });

  return { roomId };
};
