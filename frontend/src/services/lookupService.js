import { apiFetch, ApiError } from "./apiClient";

const BASE = "/api/Lookup";

export async function getAllApplicationStatuses() {
  return apiFetch(`${BASE}/GetAllApplicationStatuses`, { method: "GET" });
}

export async function getApplicationStatusById(id) {
  return apiFetch(`${BASE}/GetApplicationStatus/${id}`, { method: "GET" });
}

export async function saveApplicationStatus(model) {
  return apiFetch(`${BASE}/SaveApplicationStatus`, {
    method: "POST",
    body: JSON.stringify(model)
  });
}

export async function updateApplicationStatus(model) {
  return apiFetch(`${BASE}/UpdateApplicationStatus`, {
    method: "POST",
    body: JSON.stringify(model)
  });
}

export async function deleteApplicationStatus(id) {
  return apiFetch(`${BASE}/DeleteApplicationStatus/${id}`, { method: "GET" });
}

export async function getAllServices() {
  return apiFetch(`${BASE}/GetAllServices`, { method: "GET" });
}

export async function getServiceById(id) {
  return apiFetch(`${BASE}/GetService/${id}`, { method: "GET" });
}

export async function saveService(model) {
  return apiFetch(`${BASE}/SaveService`, {
    method: "POST",
    body: JSON.stringify(model)
  });
}

export async function updateService(model) {
  return apiFetch(`${BASE}/UpdateService`, {
    method: "POST",
    body: JSON.stringify(model)
  });
}

export async function deleteService(id) {
  return apiFetch(`${BASE}/DeleteService/${id}`, { method: "GET" });
}
