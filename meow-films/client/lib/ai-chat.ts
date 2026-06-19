import { getToken } from "./token";

export type AIChatSendResult =
  | { ok: true; result: string }
  | { ok: false; reason: "unauthorized" | "failed" };

export async function getAIChatMessages() {
  try {
    const token = await getToken();
    if (!token) {
      return [];
    }
    const response = await fetch("/api/ai-chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      return [];
    }
    if (!response.ok) {
      throw new Error("Failed to fetch AI chat messages");
    }
    const data = await response.json();
    return data.chatHistory ?? [];
  } catch (error) {
    console.error("Error fetching AI chat messages:", error);
    return null;
  }
}

export async function sendAIChatMessage(
  message: string,
): Promise<AIChatSendResult> {
  try {
    const token = await getToken();
    if (!token) {
      return { ok: false, reason: "unauthorized" };
    }
    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    if (res.status === 401) {
      return { ok: false, reason: "unauthorized" };
    }
    if (!res.ok) {
      return { ok: false, reason: "failed" };
    }
    const data = await res.json();
    return { ok: true, result: data.result ?? "" };
  } catch (error) {
    console.error("Error sending AI chat message:", error);
    return { ok: false, reason: "failed" };
  }
}

export function typeText(
  fullText: string,
  onUpdate: (partial: string) => void,
  speedMs = 20,
  onComplete?: () => void,
): () => void {
  let i = 0;
  const id = setInterval(() => {
    i++;
    onUpdate(fullText.slice(0, i));
    if (i >= fullText.length) {
      clearInterval(id);
      onComplete?.();
    }
  }, speedMs);
  return () => clearInterval(id);
}
