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
