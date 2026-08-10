import { getToken } from "./storage";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5049";
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}
const AUTH_EXPIRED_EVENT = "mds_auth_expired";
function notifyAuthExpired() {
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}
function onAuthExpired(cb) {
  window.addEventListener(AUTH_EXPIRED_EVENT, cb);
  return () => window.removeEventListener(AUTH_EXPIRED_EVENT, cb);
}
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      `Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`,
      0
    );
  }
  if (response.status === 401) {
    notifyAuthExpired();
  }
  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }
  const text = await response.text();
  if (!text) return void 0;
  const trimmed = text.trim();
  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("json") || trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
        return text;
      }
      throw new ApiError(`Server returned an unexpected response: ${text.slice(0, 200)}`, response.status);
    }
  }
  return text;
}
export {
  API_BASE_URL,
  ApiError,
  apiFetch,
  notifyAuthExpired,
  onAuthExpired
};
