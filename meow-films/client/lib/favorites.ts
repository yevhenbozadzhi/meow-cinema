import { getToken } from "./token";

export async function getFavorites() {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Unauthorized");
    }
    const res = await fetch("/api/favorites", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      throw new Error("Failed to fetch favorites: " + res.statusText);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return null;
  }
}

export async function addFavorite(movieId: string) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Unauthorized");
    }
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId }),
    });
    if (!res.ok) {
      throw new Error("Failed to add favorite: " + res.statusText);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error adding favorite:", error);
    return null;
  }
}

export async function removeFavorite(movieId: string) {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error("Unauthorized");
    }
    const res = await fetch("/api/favorites", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ movieId }),
    });
    if (!res.ok) {
      throw new Error("Failed to remove favorite: " + res.statusText);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error removing favorite:", error);
    return null;
  }
}
