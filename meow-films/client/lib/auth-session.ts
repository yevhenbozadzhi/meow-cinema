export function saveAuthSession(accessToken: string) {
  localStorage.setItem("token", accessToken);
  document.cookie = `token=${accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}
