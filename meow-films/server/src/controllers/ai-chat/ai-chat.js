import {
  sendMessageToAI,
  getChatHistory,
} from "../../services/ai-chat/ai-chat.js";
import { sendMessageSchema } from "../../validators/ai-chat/ai-chat.js";
import { ZodError } from "zod";

export async function sendAiMessageController(req, res, next) {
  try {
    const validatedData = sendMessageSchema.parse(req.body);
    const result = await sendMessageToAI(
      req.user.userId,
      validatedData.message,
    );
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Failed to send message",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      result: result.assistantMessage?.content,
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
}

export async function getChatHistoryController(req, res, next) {
  try {
    const result = await getChatHistory(req.user.userId);
    if (!result) {
      return res.status(400).json({
        success: false,
        message: "Failed to get chat history",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      chatHistory: result.chatHistory,
    });
  } catch (error) {
    next(error);
  }
}
