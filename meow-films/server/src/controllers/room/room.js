import {
  createRoomService,
  joinRoomService,
  leaveRoomService,
} from "../../services/room/room.js";
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

export const getAllRoomsController = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const rooms = await prisma.room.findMany({
      where: {
        status: "OPEN",
        OR: [
          { hostUserId: userId },
          { members: { some: { userId } } },
        ],
      },
      include: {
        members: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      success: true,
      message: "Rooms fetched successfully",
      rooms: rooms,
    });
  } catch (error) {
    next(error);
  }
};

export const joinRoomController = async (req, res, next) => {
  try {
    const room = await joinRoomService(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: "Joined room successfully",
      room,
    });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    if (statusCode < 500) {
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const leaveRoomController = async (req, res, next) => {
  try {
    const result = await leaveRoomService(req.params.id, req.user.userId);
    res.status(200).json({
      success: true,
      message: "Left room successfully",
      ...result,
    });
  } catch (error) {
    const statusCode = error.statusCode ?? 500;
    if (statusCode < 500) {
      return res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

export const deleteRoomController = async (req, res, next) => {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: req.params.id,
      },
    });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }
    if (room.hostUserId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Only the host can delete this room",
      });
    }
    const deleted = await prisma.room.delete({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
      room: deleted,
    });
  } catch (error) {
    next(error);
  }
};
