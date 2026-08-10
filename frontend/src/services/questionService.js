import { apiFetch } from "./apiClient";
async function getAllQuestions(filter) {
  return apiFetch("/api/Questions/api/Questions/GetAllQuestions", {
    method: "POST",
    body: JSON.stringify(filter)
  });
}
async function saveQuestion(payload) {
  return apiFetch("/api/Questions/api/Questions/SaveQuestions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function editQuestion(payload) {
  return apiFetch("/api/Questions/api/Questions/EditQuestion", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteQuestion(questionId) {
  return apiFetch(`/api/Questions/api/Questions/DeleteQuestion/${questionId}`);
}
export {
  deleteQuestion,
  editQuestion,
  getAllQuestions,
  saveQuestion
};
