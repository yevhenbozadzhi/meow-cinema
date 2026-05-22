import { Router } from "express";
import {
  createRoomController,
  getRoomsController,
} from "../../controllers/room/room.js";
import { auth } from "../../middlewares/auth/auth.js";
const router = Router();

router.post("/room", auth, createRoomController);
router.get("/room/:id", auth, getRoomsController);
export default router;
