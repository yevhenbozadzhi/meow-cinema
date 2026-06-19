import { getToken } from "./token";

export async function getAIChatMessages() {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Unauthorized");
    }
    const response = await fetch("/api/ai-chat", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
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

export async function sendAIChatMessage(message: string) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Unauthorized");
    }
    const res = await fetch("/api/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error("Failed to send AI chat message");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error sending AI chat message:", error);
    return null;
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
