import { apiFetch, ApiError, API_BASE_URL } from "./apiClient";
import { getToken } from "./storage";
import type { PagedResult } from "./applicantService";

export interface CourseRow {
  courseId: number;
  courseCode: string;
  courseName: string;
  courseUrl: string | null;
  isActive: boolean;
}

export interface CourseMaterial {
  courseMaterialId: number;
  courseId: number;
  courseUrl: string | null;
  materialType: string;
  fileName: string | null;
  courseName: string | null;
  questions: number | null;
}

export interface CourseQuery {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}

export async function getAllCourses(query: CourseQuery): Promise<PagedResult<CourseRow>> {
  return apiFetch<PagedResult<CourseRow>>("/api/Course/api/Course/GetAllCourses", {
    method: "POST",
    body: JSON.stringify(query),
  });
}

export async function saveCourse(form: FormData): Promise<string> {
  return apiFetch<string>("/api/Course/api/Course/SaveCourse", { method: "POST", body: form });
}

export async function updateCourse(form: FormData): Promise<string> {
  return apiFetch<string>("/api/Course/api/Course/UpdateCourse", { method: "POST", body: form });
}

export async function changeCourseStatus(courseId: number): Promise<string> {
  return apiFetch<string>(`/api/Course/api/Course/ChangeStatus/${courseId}`);
}

export async function getCourseMaterials(courseId: number): Promise<CourseMaterial[]> {
  return apiFetch<CourseMaterial[]>("/api/Course/api/Course/GetCourseMaterial/" + courseId);
}

export async function deleteCourseMaterial(courseMaterialId: number): Promise<string> {
  return apiFetch<string>(`/api/Course/api/Course/DeleteCourseMaterial/${courseMaterialId}`);
}

export function uploadCourseMaterial(
  form: FormData,
  onProgress?: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const token = getToken();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/api/Course/api/Course/SaveCourseMaterial`);
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        onProgress?.(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText || "");
      } else {
        reject(new ApiError(`Request failed with status ${xhr.status}.`, xhr.status));
      }
    };
    xhr.onerror = () =>
      reject(new ApiError(`Cannot reach the server. Make sure the API is running at ${API_BASE_URL}.`, 0));
    xhr.send(form);
  });
}

export function courseFileUrl(url: string): string {
  return `${API_BASE_URL}/${url}`;
}
