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
async function reviewQuestion(payload) {
  return apiFetch("/api/Questions/api/Questions/ReviewQuestion", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
async function updateQuestionVerifiedBy(payload) {
  return apiFetch("/api/Questions/api/Questions/UpdateQuestionVerifiedBy", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
// Column contract for the Excel question import, in workbook order.
// Keep in sync with QuestionImportColumns in QuestionsController.cs
const QUESTION_IMPORT_COLUMNS = [
  { name: "CourseId", required: true, type: "Number", example: "1", note: "Must match an existing course ID." },
  { name: "QuestionContent", required: true, type: "Text", example: "Which vitamin deficiency causes megaloblastic anaemia?", note: "The full question text." },
  { name: "Option1", required: true, type: "Text", example: "Vitamin B12", note: "First answer choice." },
  { name: "Option2", required: true, type: "Text", example: "Vitamin C", note: "Second answer choice." },
  { name: "Option3", required: true, type: "Text", example: "Iron", note: "Third answer choice." },
  { name: "Option4", required: true, type: "Text", example: "Calcium", note: "Fourth answer choice." },
  { name: "RightOption", required: true, type: "Number (1-4)", example: "1", note: "Which Option column is correct." }
];

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

/**
 * Downloads every question matching the current Question Bank filters
 * (course + search text) as an .xlsx workbook. `courseId` may be null to
 * export all courses; the search term is applied server-side so the file
 * matches the list on screen, not just the visible page.
 */
async function exportQuestions({ courseId = null, searchTerm = "" } = {}) {
  const token = getToken();
  const params = new URLSearchParams();
  if (searchTerm && searchTerm.trim()) params.set("searchTerm", searchTerm.trim());
  const qs = params.toString();
  const url = `${API_BASE_URL}/api/Questions/api/Questions/ExportQuestion/${courseId ?? 0}${qs ? `?${qs}` : ""}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("Export failed");
  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = "Questions.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(objectUrl);
}
export {
  bulkSaveQuestions,
  deleteQuestion,
  downloadQuestionModel,
  editQuestion,
  exportQuestions,
  generateAiQuestions,
  getAllQuestions,
  importQuestions,
  ocrPdf,
  parseOcrToQuestions,
  QUESTION_IMPORT_COLUMNS,
  reviewQuestion,
  saveQuestion,
  updateQuestionVerifiedBy
};
