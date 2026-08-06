import { apiFetch } from "./apiClient";
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from "./storage";
import type { LoginUser } from "./types";

export type { LoginUser } from "./types";

export async function login(username: string, password: string): Promise<LoginUser> {
  const data = await apiFetch<LoginUser[]>("/api/Login/api/login/Details", {
    method: "POST",
    body: JSON.stringify({ Username: username, Password: password }),
  });

  const user = Array.isArray(data) ? data[0] : undefined;
  if (!user || !user.userToken) {
    if (user?.userName?.startsWith("System.")) {
      throw new Error("Server error while logging in. Please try again.");
    }
    throw new Error("Invalid username or password.");
  }

  setToken(user.userToken);
  setStoredUser<LoginUser>(user);
  return user;
}

export function logout(): void {
  clearAuth();
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function getCurrentUser(): LoginUser | null {
  return getStoredUser<LoginUser>();
}
