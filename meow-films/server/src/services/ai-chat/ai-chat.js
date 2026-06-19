import prisma from "../../prisma.js";
import { openRouterService, defaultModel } from "../openrouter/openrouter.js";

export async function sendMessageToAI(userId, message) {
  try {
    const userMessage = await prisma.aIChat.create({
      data: {
        userId: userId,
        role: "USER",
        content: message,
      },
    });
    const history = await prisma.aIChat.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 100,
    });
    const messages = [
      {
        role: "system",
        content: `You are a film recommendation assistant for Meow Cinema.

Rules:
- Help only with movies and TV shows (recommendations, plot guesses, actors, genres).
- Reply in the same language as the user's latest message.
- When the user describes a plot, suggest 1–3 real, well-known titles and briefly explain why each fits.
- Use only real film/series titles that exist. Never invent fake titles or mix random languages.
- Write clearly in plain text. Do not use markdown, asterisks, or emoji.
- Keep answers concise (under 150 words unless the user asks for more).`,
      },
      ...history.map((item) => ({
        role: item.role.toLowerCase(),
        content: item.content,
      })),
    ];
    const aiReply = await openRouterService(defaultModel, messages);
    const answer = await prisma.aIChat.create({
      data: {
        userId: userId,
        role: "ASSISTANT",
        content: aiReply,
      },
    });
    return {
      success: true,
      userMessage,
      assistantMessage: answer,
    };
  } catch (error) {
    throw error;
  }
}

export async function getChatHistory(userId) {
  try {
    const result = await prisma.aIChat.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return {
      success: true,
      chatHistory: result,
    };
  } catch (error) {
    throw error;
  }
}
