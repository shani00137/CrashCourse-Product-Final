const TOKEN_KEY = "mds_token";
const USER_KEY = "mds_user";
const SCREEN_KEY = "mds_screen";
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function setStoredUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SCREEN_KEY);
}
function getScreen() {
  return localStorage.getItem(SCREEN_KEY) || "dashboard";
}
function setScreen(screen) {
  localStorage.setItem(SCREEN_KEY, screen);
}
export {
  clearAuth,
  getScreen,
  getStoredUser,
  getToken,
  setScreen,
  setStoredUser,
  setToken
};
