import { apiFetch, ApiError, API_BASE_URL } from "./apiClient";
import { getToken } from "./storage";
async function getAllCourses(query) {
  return apiFetch("/api/Course/api/Course/GetAllCourses", {
    method: "POST",
    body: JSON.stringify(query)
  });
}
async function saveCourse(form) {
  return apiFetch("/api/Course/api/Course/SaveCourse", { method: "POST", body: form });
}
async function updateCourse(form) {
  return apiFetch("/api/Course/api/Course/UpdateCourse", { method: "POST", body: form });
}
async function changeCourseStatus(courseId) {
  return apiFetch(`/api/Course/api/Course/ChangeStatus/${courseId}`);
}
async function getCourseMaterials(courseId) {
  return apiFetch("/api/Course/api/Course/GetCourseMaterial/" + courseId);
}
async function deleteCourseMaterial(courseMaterialId) {
  return apiFetch(`/api/Course/api/Course/DeleteCourseMaterial/${courseMaterialId}`);
}
function uploadCourseMaterial(form, onProgress) {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/Course/api/Course/SaveCourseMaterial`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress?.(Math.round(e.loaded / e.total * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText || "");
      } else {
        reject(new ApiError(`Request failed with status ${xhr.status}.`, xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError(`Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`, 0));
    xhr.send(form);
  });
}
function courseFileUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}/${url.replace(/^\//, "")}`;
}

// Downloads through the API instead of the storage URL so the browser never
// performs a cross-origin request to Cloudflare R2 (which has no CORS headers).
async function downloadCourseMaterial(courseMaterialId) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/api/Course/api/Course/GetCourseMaterialPdf/${courseMaterialId}`,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
  if (response.status === 401) {
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }
  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }
  return await response.blob();
}
export {
  changeCourseStatus,
  courseFileUrl,
  deleteCourseMaterial,
  downloadCourseMaterial,
  getAllCourses,
  getCourseMaterials,
  saveCourse,
  updateCourse,
  uploadCourseMaterial
};
