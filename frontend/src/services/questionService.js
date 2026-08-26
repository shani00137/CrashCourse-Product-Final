import { apiFetch, API_BASE_URL } from "./apiClient";
import { getToken } from "./storage";
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
async function ocrPdf(payload) {
  return apiFetch("/api/Questions/api/Questions/OcrPdf", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function parseOcrToQuestions(payload) {
  return apiFetch("/api/Questions/api/Questions/ParseOcrToQuestions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function bulkSaveQuestions(payload) {
  return apiFetch("/api/Questions/api/Questions/BulkSaveQuestions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function generateAiQuestions(payload) {
  return apiFetch("/api/Questions/api/Questions/GenerateAiQuestions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function importQuestions(file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/api/Questions/api/Questions/ImportQuestion", {
    method: "POST",
    body: formData
  });
}
async function downloadQuestionModel(filename) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/api/Questions/api/Questions/DownloadQuestionModel/${filename}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error("Download failed");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
async function getAllTopics() {
  return apiFetch("/api/Questions/api/Questions/GetAllTopics");
}
async function createTopic(payload) {
  return apiFetch("/api/Questions/api/Questions/SaveTopic", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateTopic(payload) {
  return apiFetch("/api/Questions/api/Questions/EditTopic", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
}
async function deleteTopic(topicId) {
  return apiFetch(`/api/Questions/api/Questions/DeleteTopic/${topicId}`);
}
export {
  bulkSaveQuestions,
  createTopic,
  deleteQuestion,
  deleteTopic,
  downloadQuestionModel,
  editQuestion,
  generateAiQuestions,
  getAllQuestions,
  getAllTopics,
  importQuestions,
  ocrPdf,
  parseOcrToQuestions,
  saveQuestion,
  updateTopic
};
