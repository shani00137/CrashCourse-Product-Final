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

async function getUserPermissions(roleId) {
  if (roleId) {
    return apiFetch(`/api/UserPermission/Details/${roleId}`);
  }
  return apiFetch("/api/UserPermission/Get");
}

async function saveUserPermission(payload) {
  return apiFetch("/api/UserPermission/SaveUserPermission", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function deleteUserPermission(permissionId) {
  return apiFetch(`/api/UserPermission/Delete/${permissionId}`);
}

export { getAdminUsers, getRoles, saveUser, getUserPermissions, saveUserPermission, deleteUserPermission };
