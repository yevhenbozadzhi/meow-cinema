import { createRoomService } from "../../services/room/room.js";
import { ZodError } from "zod";
import prisma from "../../prisma.js";
import { getRoomStatus } from "../../socket/socket.js";
export const createRoomController = async (req, res, next) => {
  try {
    const newRoom = await createRoomService(req.body, req.user.userId);
    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: newRoom,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        issues: error.issues,
      });
    }
    next(error);
  }
};
export const getRoomsController = async (req, res, next) => {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        members: true,
      },
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    const stats = await getRoomStatus(req.app.get("io"), req.params.id);
    res.status(200).json({
      success: true,
      message: "Room fetched successfully",
      room: room,
      stats: stats,
    });
  } catch (error) {
    next(error);
  }
};
