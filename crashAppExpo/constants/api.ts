export const API_BASE_URL = "http://localhost:5005/api";

export const ENDPOINTS = {
  saveApplicants: "/Applicant/api/Applicant/SaveApplicants",
  saveAppUser: "/AppUser/api/AppUser/SaveAppUser",
  loginAppUser: "/Login/api/login/AppUserDetails",
  getActiveCourses: "/Course/api/Course/GetActiveCoursePublic",
  getApplicantCourses: (appUserId: number) =>
    `/Applicant/api/Applicant/GetApplicantCourses/${appUserId}`,
  getAllExercises: "/Course/api/Course/GetAllExercise",
  getUserDetailById: (appUserId: number) =>
    `/AppUser/api/AppUser/GetDetailOfUserById/${appUserId}`,
  takeExercise: (start: number, end: number, courseId: number) =>
    `/Questions/api/Questions/TakeExercise/${start},${end},${courseId}`,
  getExerciseQuestionCount: (courseId: number) =>
    `/Questions/api/Questions/GetExerciseQuestionCount/${courseId}`,
};