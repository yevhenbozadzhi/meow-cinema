import { Router } from "express";
import {
  sendAiMessageController,
  getChatHistoryController,
} from "../../controllers/ai-chat/ai-chat.js";
import { auth } from "../../middlewares/auth/auth.js";

const router = Router();

router.post("/send-message", auth, sendAiMessageController);
router.get("/get-chat-history", auth, getChatHistoryController);

export default router;
