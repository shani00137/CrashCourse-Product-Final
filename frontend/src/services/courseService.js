import { apiFetch, ApiError, API_BASE_URL, notifyAuthExpired } from "./apiClient";
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
        let message = `Request failed with status ${xhr.status}.`;
        try {
          const body = JSON.parse(xhr.responseText);
          if (body && typeof body.message === "string" && body.message) {
            message = body.message;
          }
        } catch {
          // non-JSON error body; keep the generic message
        }
        reject(new ApiError(message, xhr.status));
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

async function downloadCourseMaterial(courseMaterialId) {
  const info = await apiFetch(
    `/api/Course/api/Course/GetCourseMaterialPdfUrl/${courseMaterialId}`
  );
  const fileName = info?.fileName || "attachment";

  if (info?.direct && info?.downloadUrl) {
    window.location.assign(info.downloadUrl);
    return;
  }

  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${info?.downloadUrl || ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (response.status === 401) {
    notifyAuthExpired();
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }
  if (!response.ok) {
    throw new ApiError(`Request failed with status ${response.status}.`, response.status);
  }

  const objectUrl = URL.createObjectURL(await response.blob());
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
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
