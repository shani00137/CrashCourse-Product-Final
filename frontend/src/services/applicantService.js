import { apiFetch } from "./apiClient";
async function getApplicants(query) {
  return apiFetch("/api/Applicant/api/Applicant/GetAllApplicants", {
    method: "POST",
    body: JSON.stringify(query)
  });
}
async function saveApplicant(payload) {
  return apiFetch("/api/Applicant/api/Applicant/SaveApplicants", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateApplicant(payload) {
  return apiFetch("/api/Applicant/api/Applicant/UpdateApplicants", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function changeApplicantStatus(applicantId) {
  return apiFetch(`/api/Applicant/api/Applicant/ChangeApplicantStatus/${applicantId}`);
}

/**
 * Permanently delete an applicant together with their invoices, line items,
 * ledger entries, status history, course selections and documents.
 * @param {number} applicantId
 * @returns {Promise<{ succeeded: boolean, message: string, applicantId: number }>}
 */
async function deleteApplicant(applicantId) {
  return apiFetch(`/api/Applicant/api/Applicant/DeleteApplicant/${applicantId}`, {
    method: "DELETE"
  });
}
async function getCountries() {
  return apiFetch("/api/Course/api/Course/GetCountryName");
}
async function getActiveCourses() {
  return apiFetch("/api/Course/api/Course/GetActiveCourse");
}
async function getActiveApplicantsByCourse(courseId) {
  return apiFetch(`/api/Applicant/api/Applicant/GetActiveApplicantsByCourse/${courseId}`);
}
async function getActiveApplicants() {
  return apiFetch("/api/Applicant/api/Applicant/GetActiveApplicants");
}
export {
  changeApplicantStatus,
  deleteApplicant,
  getActiveApplicants,
  getActiveApplicantsByCourse,
  getActiveCourses,
  getApplicants,
  getCountries,
  saveApplicant,
  updateApplicant
};
