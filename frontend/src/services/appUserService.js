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
async function deleteAppUser(appUserId) {
  return apiFetch(`/api/AppUser/api/AppUser/DeleteUser/${appUserId}`);
}
async function resetAppUserPassword(payload) {
  return apiFetch("/api/AppUser/api/AppUser/ChangePassword", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function resetAppUserDeviceId(appUserId) {
  return apiFetch(`/api/AppUser/api/AppUser/ResetDeviceId/${appUserId}`);
}
export { getAppUsers, saveAppUser, deleteAppUser, resetAppUserPassword, resetAppUserDeviceId };
