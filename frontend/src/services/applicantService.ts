import { apiFetch } from "./apiClient";

export interface Country {
  countryId: number;
  coutryName: string;
}

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  isActive: boolean;
  courseUrl: string | null;
}

export interface CourseMD {
  courseId: number;
  courseName: string;
}

export interface Applicant {
  applicantId: number;
  registrationNo: string;
  firstName: string;
  lastName: string;
  mobile: string;
  otherMobile: string;
  email: string;
  address: string;
  photoUrl: string | null;
  registrationDate: string;
  expiryDate: string;
  isActive: boolean;
  coutryName: string;
  countryId: number;
  courseMD: CourseMD | null;
}

export interface PagedResult<T> {
  data: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  succeeded: boolean;
  message: string | null;
}

export interface ApplicantPayload {
  applicantId: number;
  registrationNo: string;
  firstName: string;
  lastName: string;
  mobile: string;
  otherMobile: string;
  email: string;
  address: string;
  photoUrl: string | null;
  registrationDate: string;
  expiryDate: string;
  isActive: boolean;
  countryId: number;
  courseId: number;
}

export interface ApplicantQuery {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: string;
  countryId?: number | null;
  courseId?: number | null;
}

export async function getApplicants(query: ApplicantQuery): Promise<PagedResult<Applicant>> {
  return apiFetch<PagedResult<Applicant>>("/api/Applicant/api/Applicant/GetAllApplicants", {
    method: "POST",
    body: JSON.stringify(query),
  });
}

export async function saveApplicant(payload: ApplicantPayload): Promise<string> {
  return apiFetch<string>("/api/Applicant/api/Applicant/SaveApplicants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateApplicant(payload: ApplicantPayload): Promise<string> {
  return apiFetch<string>("/api/Applicant/api/Applicant/UpdateApplicants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function changeApplicantStatus(applicantId: number): Promise<string> {
  return apiFetch<string>(`/api/Applicant/api/Applicant/ChangeApplicantStatus/${applicantId}`);
}

export async function getCountries(): Promise<Country[]> {
  return apiFetch<Country[]>("/api/Course/api/Course/GetCountryName");
}

export async function getActiveCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/api/Course/api/Course/GetActiveCourse");
}
