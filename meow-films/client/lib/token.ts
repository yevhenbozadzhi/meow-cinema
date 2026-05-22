export async function getToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Unauthorized");
    }
    return token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
}
