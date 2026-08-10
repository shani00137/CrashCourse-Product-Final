import { apiFetch } from "./apiClient";
async function getAppUsers(filter) {
  return apiFetch("/api/AppUser/api/AppUser/GetAllUsers", {
    method: "POST",
    body: JSON.stringify(filter)
  });
}
async function saveAppUser(payload) {
  return apiFetch("/api/AppUser/api/AppUser/SaveAppUser", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
export { getAppUsers, saveAppUser };
