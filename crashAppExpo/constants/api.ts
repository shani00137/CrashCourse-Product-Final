// export const API_BASE_URL = "http://localhost:5005/api";
export const API_BASE_URL = "https://development.crashcourseonlin.net/api";
export const ENDPOINTS = {
  saveApplicants: "/Applicant/api/Applicant/SaveApplicants",
  saveAppUser: "/AppUser/api/AppUser/SaveAppUser",
  loginAppUser: "/Login/api/login/AppUserDetails",
  getActiveCourses: "/Course/api/Course/GetActiveCoursePublic",
  getCountryName: "/Course/api/Course/GetCountryName",
  getApplicantCourses: (appUserId: number) =>
    `/Applicant/api/Applicant/GetApplicantCourses/${appUserId}`,
  getAllExercises: "/Course/api/Course/GetAllExercise",
  getCourseMaterials: (courseId: number) =>
    `/Course/api/Course/GetCourseMaterial/${courseId}`,
  getUserDetailById: (appUserId: number) =>
    `/AppUser/api/AppUser/GetDetailOfUserById/${appUserId}`,
  changePlan: "/AppUser/api/AppUser/ChangePlan",
  takeExercise: (start: number, end: number, courseId: number) =>
    `/Questions/api/Questions/TakeExercise/${start},${end},${courseId}`,
  getExerciseQuestionCount: (courseId: number) =>
    `/Questions/api/Questions/GetExerciseQuestionCount/${courseId}`,
  explainQuestion: "/Questions/api/Questions/ExplainQuestion",
  saveReadingTime: "/ReadingTime/api/ReadingTime/SaveReadingTime",
  getAllReadingTime: (appUserId: number) =>
    `/ReadingTime/api/ReadingTime/GetAllReadingTime/${appUserId}`,
  getReadingTime: (appUserId: number, courseId: number, start: number, end: number) =>
    `/ReadingTime/api/ReadingTime/GetReadingTime/${appUserId}/${courseId}/${start},${end}`,
  prepareTest: "/TakeTest/api/TakeTest/PrepareTest",
  generateTest: "/TakeTest/api/TakeTest/GenerateTest",
  getUserTests: (appUserId: number) =>
    `/TakeTest/api/TakeTest/GetUserTests/${appUserId}`,
  conductTestByUser: (testId: number) =>
    `/TakeTest/api/TakeTest/ConductTestByUser/${testId}`,
  userTestUpdate: "/TakeTest/api/TakeTest/UserTestUpdate",
  saveTest: (testId: number) => `/TakeTest/api/TakeTest/SaveTest/${testId}`,
  updateToken: "/AppUser/api/AppUser/UpdateToken",
};