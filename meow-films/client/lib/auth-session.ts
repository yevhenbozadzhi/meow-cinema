export type AuthUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  email: string;
};

const AUTH_FETCH_TIMEOUT_MS = 10_000;

export function saveAuthSession(accessToken: string) {
  localStorage.setItem("token", accessToken);
  document.cookie = `token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
}

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function isAccessTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      exp?: number;
    };
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = AUTH_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchAuthMe(token: string): Promise<Response> {
  return fetchWithTimeout("/api/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetchWithTimeout("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { accessToken?: string };
    if (!data.accessToken) return null;

    saveAuthSession(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function resolveAuthUser(): Promise<AuthUser | null> {
  let token = getStoredAccessToken();
  if (!token) return null;

  if (isAccessTokenExpired(token)) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      clearAuthSession();
      return null;
    }
    token = refreshed;
  }

  try {
    let res = await fetchAuthMe(token);

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        clearAuthSession();
        return null;
      }
      res = await fetchAuthMe(refreshed);
    }

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        clearAuthSession();
      }
      return null;
    }

    const data = (await res.json()) as AuthUser;
    if (!data?.username) return null;
    return data;
  } catch {
    return null;
  }
}
