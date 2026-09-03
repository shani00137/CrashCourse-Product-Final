export const API_BASE_URL = "http://localhost:5005/api";

export const ENDPOINTS = {
  saveApplicants: "/Applicant/api/Applicant/SaveApplicants",
  saveAppUser: "/AppUser/api/AppUser/SaveAppUser",
  getActiveCourses: "/Course/api/Course/GetActiveCoursePublic",
  getApplicantCourses: (appUserId: number) =>
    `/Applicant/api/Applicant/GetApplicantCourses/${appUserId}`,
  getAllExercises: "/Course/api/Course/GetAllExercise",
  takeExercise: (start: number, end: number, courseId: number) =>
    `/Questions/api/Questions/TakeExercise/${start},${end},${courseId}`,
};