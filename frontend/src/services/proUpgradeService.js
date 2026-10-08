import { apiFetch } from "./apiClient";

// Pro-upgrade approval workflow: trial users send a request from the app and
// it waits in the backend until the administrator approves or rejects it.
async function getProUpgradeRequests(status = "All") {
  return apiFetch(
    `/api/ProUpgradeRequest/api/ProUpgradeRequest/GetAll?status=${encodeURIComponent(status)}`,
    { method: "GET" }
  );
}

async function approveProUpgrade(payload) {
  return apiFetch("/api/ProUpgradeRequest/api/ProUpgradeRequest/Approve", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function rejectProUpgrade(payload) {
  return apiFetch("/api/ProUpgradeRequest/api/ProUpgradeRequest/Reject", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export { getProUpgradeRequests, approveProUpgrade, rejectProUpgrade };
