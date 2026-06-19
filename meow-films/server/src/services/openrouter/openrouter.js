import { OpenRouter } from "@openrouter/sdk";

export const client = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const defaultModel =
  process.env.OPENROUTER_MODEL ?? "openrouter/free";

export async function openRouterService(model, messages) {
  try {
    const completion = await client.chat.send({
      chatRequest: {
        model: model || defaultModel,
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        temperature: 0.4,
      },
    });
    return completion.choices[0]?.message?.content ?? "";
  } catch (error) {
    if (error.code === "UNAUTHORIZED") {
      throw new Error("Unauthorized");
    }
    const detail = error.error?.message ?? error.message ?? "Unknown error";
    throw new Error(`OpenRouter failed: ${detail}`);
  }
}
