import { Router } from "express";
import {
  createRoomController,
  getRoomsController,
  deleteRoomController,
  getAllRoomsController,
  joinRoomController,
  leaveRoomController,
} from "../../controllers/room/room.js";
import { auth } from "../../middlewares/auth/auth.js";
const router = Router();

router.post("/room", auth, createRoomController);
router.get("/rooms", auth, getAllRoomsController);
router.post("/room/:id/join", auth, joinRoomController);
router.post("/room/:id/leave", auth, leaveRoomController);
router.get("/room/:id", auth, getRoomsController);
router.delete("/room/:id", auth, deleteRoomController);
export default router;
