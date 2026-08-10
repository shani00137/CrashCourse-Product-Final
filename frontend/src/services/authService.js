import { apiFetch } from "./apiClient";
import { clearAuth, getStoredUser, getToken, setStoredUser, setToken } from "./storage";
async function login(username, password) {
  const data = await apiFetch("/api/Login/api/login/Details", {
    method: "POST",
    body: JSON.stringify({ Username: username, Password: password })
  });
  const user = Array.isArray(data) ? data[0] : void 0;
  if (!user || !user.userToken) {
    if (user?.userName?.startsWith("System.")) {
      throw new Error("Server error while logging in. Please try again.");
    }
    throw new Error("Invalid username or password.");
  }
  setToken(user.userToken);
  setStoredUser(user);
  return user;
}
function logout() {
  clearAuth();
}
function isTokenExpired(token) {
  try {
    const base64Url = token.split(".")[1] ?? "";
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    if (typeof payload?.exp !== "number") return false;
    return payload.exp * 1e3 <= Date.now();
  } catch {
    return false;
  }
}
function isAuthenticated() {
  const token = getToken();
  return Boolean(token) && !isTokenExpired(token);
}
function getCurrentUser() {
  return getStoredUser();
}
export {
  getCurrentUser,
  isAuthenticated,
  login,
  logout
};
