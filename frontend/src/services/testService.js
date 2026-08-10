import { apiFetch } from "./apiClient";
async function prepareTest(payload) {
  return apiFetch("/api/TakeTest/api/TakeTest/PrepareTest", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function getAppUserTests(page = 1, pageSize = 20) {
  return apiFetch(`/api/TakeTest/api/TakeTest/GetAppUserTest?page=${page}&pageSize=${pageSize}`);
}
async function deleteTest(testId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/DeleteTest/${testId}`);
}
async function getTestDetails(testId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/GetTestDetails/${testId}`);
}
async function getTestSummary(testId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/GetTestSummary/${testId}`);
}
async function getUserTestAnswers(testId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/TakeTestByUser/${testId}`);
}
async function updateUserTestAnswer(payload) {
  return apiFetch("/api/TakeTest/api/TakeTest/UserTestUpdate", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function saveTest(testId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/SaveTest/${testId}`);
}
async function getTestHistory(appUserId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/GetTestHistory/${appUserId}`);
}
async function getAppUserTestResult(appUserId) {
  return apiFetch(`/api/TakeTest/api/TakeTest/GetAppUserTestResult/${appUserId}`);
}
export {
  deleteTest,
  getAppUserTestResult,
  getAppUserTests,
  getTestDetails,
  getTestHistory,
  getTestSummary,
  getUserTestAnswers,
  prepareTest,
  saveTest,
  updateUserTestAnswer
};
