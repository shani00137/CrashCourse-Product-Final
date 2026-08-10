import { apiFetch } from "./apiClient";
async function getAdminUsers() {
  return apiFetch("/api/UserInfo/Get");
}
async function getRoles() {
  return apiFetch("/api/UserRole/Get");
}
async function saveUser(payload) {
  return apiFetch("/api/UserInfo/SaveUsers", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
export { getAdminUsers, getRoles, saveUser };
