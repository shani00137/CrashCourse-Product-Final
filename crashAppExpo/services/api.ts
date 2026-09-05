import { API_BASE_URL, ENDPOINTS } from "@/constants/api";

export interface CourseInfo {
  courseId: number;
  courseCode?: string;
  courseName?: string;
  isActive?: boolean;
  courseUrl?: string;
}

export interface ApplicantRequest {
  recordId: number;
  applicantId: number;
  registrationNo: string;
  firstName: string;
  lastName: string;
  mobile: string;
  otherMobile: string;
  address: string;
  email: string;
  createdOn: string;
  registrationDate: string;
  expiryDate: string;
  userNo: number;
  photoUrl: string;
  applyForCountry: number;
  countryId: number;
  courseId: number;
  courseName: CourseInfo[];
  isActive: boolean;
  course: string;
  appUserId: number;
  messages: number;
  courseMD: object;
}

export interface AppUserRequest {
  recordId: number;
  registrationNo: string;
  firstName: string;
  lastName: string;
  mobile: string;
  otherMobile: string;
  address: string;
  email: string;
  createdOn: string;
  registrationDate: string;
  expiryDate: string;
  userNo: number;
  photoUrl: string;
  applyForCountry: number;
  countryId: number;
  courseId: number;
  courseName: CourseInfo[];
  isActive: boolean;
  course: string;
  messages: number;
  courseMD: object;
  appUserRecordId: number;
  appUserId: number;
  applicantId: number;
  status: boolean;
  createOn: string;
  loginOn: string;
  deviceId: string;
  userName: string;
  password: string;
  token: string;
  dateTime: string;
  imageUrl: string;
}

const DEFAULT_COURSE_MD = { courseId: 0, courseCode: "", courseName: "", isActive: true };

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "*/*" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }
  return parseBody<T>(res);
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { accept: "*/*" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed (${res.status}): ${text}`);
  }
  return parseBody<T>(res);
}

/**
 * Reads the response body as text and attempts to parse it as JSON. The
 * backend's SaveApplicants/SaveAppUser endpoints return plain text strings,
 * so a failed JSON.parse must not throw.
 */
async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (text.trim().length === 0) return "" as unknown as T;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return text as unknown as T;
    }
  }
  return text as unknown as T;
}

/**
 * Fetches the list of active courses from the backend for use in the
 * registration form's searchable course dropdown.
 */
export async function getActiveCourses(): Promise<CourseInfo[]> {
  const data = await get<unknown>(ENDPOINTS.getActiveCourses);
  if (!Array.isArray(data)) return [];
  return data
    .filter((it) => it && typeof it === "object")
    .map((it) => {
      const c = it as Record<string, unknown>;
      return {
        courseId: Number(c.courseId) || 0,
        courseCode: typeof c.courseCode === "string" ? c.courseCode : "",
        courseName: typeof c.courseName === "string" ? c.courseName : "",
        isActive: typeof c.isActive === "boolean" ? c.isActive : true,
        courseUrl: typeof c.courseUrl === "string" ? c.courseUrl : "",
      };
    })
    .filter((c) => c.courseId > 0);
}

export interface LoginResult {
  isValid: boolean;
  response: string;
  username: string;
  appUserId: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  applicantId: number;
  userToken: string;
  courseId?: number;
}

/**
 * Authenticates an AppUser against the backend. Returns the first result from
 * the API's LoginModel list, throwing if the credentials are invalid.
 */
export async function loginAppUser({
  username,
  password,
  deviceId = "mobile-app",
}: {
  username: string;
  password: string;
  deviceId?: string;
}): Promise<LoginResult> {
  const data = await request<unknown>(ENDPOINTS.loginAppUser, {
    username,
    password,
    deviceId,
  });
  const list = Array.isArray(data) ? data : [];
  const first = list[0];
  if (!first || typeof first !== "object") {
    throw new Error("Invalid response from server.");
  }
  const row = first as Record<string, unknown>;
  const isValid = Boolean(row.isValid);
  if (!isValid) {
    throw new Error(
      typeof row.response === "string" && row.response.trim()
        ? row.response
        : "Invalid username or password."
    );
  }
  return {
    isValid: true,
    response:
      typeof row.response === "string" ? row.response : "Welcome",
    username: typeof row.username === "string" ? row.username : "",
    appUserId: Number(row.appUserId) || 0,
    name: typeof row.name === "string" ? row.name : "",
    mobile: typeof row.mobile === "string" ? row.mobile : "",
    email: typeof row.email === "string" ? row.email : "",
    address:
      typeof row.address === "string" ? row.address : "",
    applicantId: Number(row.applicantId) || 0,
    userToken: typeof row.userToken === "string" ? row.userToken : "",
  };
}

export interface RegisterApplicantInput {
  firstName: string;
  lastName: string;
  mobile: string;
  otherMobile: string;
  address: string;
  email: string;
  userName: string;
  password: string;
  courseId: number;
  courseName: string;
  countryId: number;
  applyForCountry: number;
}

/**
 * Registers an Applicant via SaveApplicants, then immediately registers the
 * corresponding AppUser (same request time) using the applicant's returned
 * identifiers. Registration is a 5-day trial.
 */
export async function registerApplicantWithAppUser(input: RegisterApplicantInput): Promise<{
  applicantId: number;
  appUserId: number;
}> {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5-day trial

  const registrationNo = `TR-${Date.now().toString().slice(-6)}`;

  const applicantBody: ApplicantRequest = {
    recordId: 0,
    applicantId: 0,
    registrationNo,
    firstName: input.firstName,
    lastName: input.lastName,
    mobile: input.mobile,
    otherMobile: input.otherMobile,
    address: input.address,
    email: input.email,
    createdOn: now.toISOString(),
    registrationDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    userNo: 0,
    photoUrl: "",
    applyForCountry: input.applyForCountry,
    countryId: input.countryId,
    courseId: input.courseId,
    courseName: input.courseName
      ? [
          {
            courseId: input.courseId,
            courseName: input.courseName,
            courseCode: input.courseName,
            isActive: true,
          },
        ]
      : [],
    isActive: true,
    course: input.courseName,
    appUserId: 0,
    messages: 0,
    courseMD: {
      courseId: input.courseId,
      courseCode: input.courseName,
      courseName: input.courseName,
      isActive: true,
    },
  };

  const applicant = await request<Record<string, unknown>>(
    ENDPOINTS.saveApplicants,
    applicantBody
  );
  const applicantId = Number(applicant?.applicantId) || 0;

  const appUserBody: AppUserRequest = {
    recordId: 0,
    registrationNo,
    firstName: input.firstName,
    lastName: input.lastName,
    mobile: input.mobile,
    otherMobile: input.otherMobile,
    address: input.address,
    email: input.email,
    createdOn: now.toISOString(),
    registrationDate: now.toISOString(),
    expiryDate: expiryDate.toISOString(),
    userNo: 0,
    photoUrl: "",
    applyForCountry: input.applyForCountry,
    countryId: input.countryId,
    courseId: input.courseId,
    courseName: input.courseName
      ? [
          {
            courseId: input.courseId,
            courseName: input.courseName,
            courseCode: input.courseName,
            isActive: true,
          },
        ]
      : [],
    isActive: true,
    course: input.courseName,
    messages: 0,
    courseMD: DEFAULT_COURSE_MD,
    appUserRecordId: 0,
    appUserId: 0,
    applicantId,
    status: true,
    createOn: now.toISOString(),
    loginOn: now.toISOString(),
    deviceId: "",
    userName: input.userName,
    password: input.password,
    token: "",
    dateTime: now.toISOString(),
    imageUrl: "",
  };

  const appUser = await request<Record<string, unknown>>(
    ENDPOINTS.saveAppUser,
    appUserBody
  );
  const appUserId = Number(appUser?.appUserId) || 0;

  return { applicantId, appUserId };
}

export interface ApplicantCourse {
  courseId: number;
  courseCode: string;
  courseName: string;
  courseUrl: string;
  questions: number;
  courseMaterial: unknown[];
}

/**
 * Fetches the registered course(s) for the given AppUser (not the applicant).
 * Backend maps the AppUser to the applicant's course selection.
 */
export async function getApplicantCourses(appUserId: number): Promise<ApplicantCourse[]> {
  const data = await get<unknown>(ENDPOINTS.getApplicantCourses(appUserId));
  if (!Array.isArray(data)) return [];
  return data
    .filter((it) => it && typeof it === "object")
    .map((it) => {
      const c = it as Record<string, unknown>;
      return {
        courseId: Number(c.courseId) || 0,
        courseCode: typeof c.courseCode === "string" ? c.courseCode : "",
        courseName: typeof c.courseName === "string" ? c.courseName : "",
        courseUrl: typeof c.courseUrl === "string" ? c.courseUrl : "",
        questions: Number(c.questions) || 0,
        courseMaterial: Array.isArray(c.courseMaterial) ? c.courseMaterial : [],
      };
    })
    .filter((c) => c.courseId > 0);
}

export interface UserDetailInfo {
  appUserId: number;
  applicantId: number;
  userName: string;
  courseId: number;
  courseName: string;
  status: boolean;
  deviceId: string;
}

/**
 * Fetches a user's profile + their registered course via
 * AppUser/GetDetailOfUserById/{appUserId}. Returns the courseId the app
 * should use when loading exercises.
 */
export async function getUserDetailById(appUserId: number): Promise<UserDetailInfo | null> {
  const data = await get<unknown>(ENDPOINTS.getUserDetailById(appUserId));
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  return {
    appUserId: Number(r.appUserId) || appUserId,
    applicantId: Number(r.applicantId) || 0,
    userName: typeof r.userName === "string" ? r.userName : "",
    courseId: Number(r.courseId) || 0,
    courseName: typeof r.courseName === "string" ? r.courseName : "",
    status: r.status !== false,
    deviceId: typeof r.deviceId === "string" ? r.deviceId : "",
  };
}

export interface ExerciseInfo {
  exerciseRecordId: number;
  exercise: string;
  startFrom: number;
  endFrom: number;
}

/**
 * Fetches the full list of exercises. Each exercise is a range of question
 * ids (startFrom..endFrom) belonging to a course.
 */
export async function getAllExercises(): Promise<ExerciseInfo[]> {
  const data = await get<unknown>(ENDPOINTS.getAllExercises);
  if (!Array.isArray(data)) return [];
  return data
    .filter((it) => it && typeof it === "object")
    .map((it) => {
      const c = it as Record<string, unknown>;
      return {
        exerciseRecordId: Number(c.exerciseRecordId) || 0,
        exercise: typeof c.exercise === "string" ? c.exercise : "",
        startFrom: Number(c.startFrom) || 0,
        endFrom: Number(c.endFrom) || 0,
      };
    })
    .filter((c) => c.exerciseRecordId > 0);
}

export interface QuestionCountResult {
  courseId: number;
  questionCount: number;
}

/**
 * Fetches the total question count for a given courseId.
 */
export async function getExerciseQuestionCount(courseId: number): Promise<QuestionCountResult> {
  const data = await get<unknown>(ENDPOINTS.getExerciseQuestionCount(courseId));
  if (!data || typeof data !== "object") return { courseId, questionCount: 0 };
  const r = data as Record<string, unknown>;
  return {
    courseId: Number(r.courseId) || courseId,
    questionCount: Number(r.questionCount) || 0,
  };
}

export interface TakeQuestion {
  questionId: number;
  questionContent: string;
  rightOption: number;
  options: string[];
}

/**
 * Fetches the questions of an exercise range for a course via
 * TakeExercise/{start},{end},{courseId}. The backend returns flat rows with
 * columns Option1..Option4 and a RightOption (1-based) index.
 */
export async function takeExercise(
  start: number,
  end: number,
  courseId: number
): Promise<TakeQuestion[]> {
  const data = await get<unknown>(ENDPOINTS.takeExercise(start, end, courseId));
  if (!Array.isArray(data)) return [];
  return data
    .filter((it) => it && typeof it === "object")
    .map((it) => {
      const r = it as Record<string, unknown>;
      const options = ["Option1", "Option2", "Option3", "Option4"]
        .map((key) => (typeof r[key] === "string" ? (r[key] as string) : ""))
        .filter((o) => o.trim().length > 0);
      return {
        questionId: Number(r.QuestionId) || 0,
        questionContent:
          typeof r.QuestionContent === "string" ? r.QuestionContent : "",
        rightOption: Number(r.RightOption) || 0,
        options,
      };
    })
    .filter((c) => c.questionId > 0 && c.options.length > 0);
}