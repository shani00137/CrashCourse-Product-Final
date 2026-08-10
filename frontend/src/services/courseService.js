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
  return `${API_BASE_URL}/${url}`;
}
export {
  changeCourseStatus,
  courseFileUrl,
  deleteCourseMaterial,
  getAllCourses,
  getCourseMaterials,
  saveCourse,
  updateCourse,
  uploadCourseMaterial
};
