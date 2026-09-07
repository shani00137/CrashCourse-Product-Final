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

let authToken = "";

/**
 * Sets the Bearer token attached to subsequent requests. Called by AppContext
 * when a session is restored/logged in (and cleared on logout).
 */
export function setSessionToken(token: string) {
  authToken = token || "";
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
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
    headers: {
      accept: "*/*",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
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
  registrationDate?: string;
  expiryDate?: string;
  isActive?: boolean;
}

/**
 * True when the account was created as a 5-day trial: the expiry is still in
 * the future and the registration→expiry span is ~5 days (not a full
 * subscription). Used to gate exercises/tests/AI during the trial.
 */
export function isTrialByDates(
  registrationDate?: string,
  expiryDate?: string
): boolean {
  if (!registrationDate || !expiryDate) return false;
  const start = new Date(registrationDate).getTime();
  const end = new Date(expiryDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  if (Date.now() >= end) return false;
  const spanDays = (end - start) / (24 * 60 * 60 * 1000);
  return spanDays > 0 && spanDays <= 6;
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
    registrationDate:
      typeof r.registrationDate === "string" ? r.registrationDate : undefined,
    expiryDate: typeof r.expiryDate === "string" ? r.expiryDate : undefined,
    isActive: typeof r.isActive === "boolean" ? r.isActive : undefined,
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

export interface ExplainQuestionInput {
  question: string;
  options: string[];
  prompt: string;
  maxWords?: number;
}

export interface ExplainQuestionResult {
  succeeded: boolean;
  message?: string;
  answer?: string;
}

/**
 * Sends a student's question + custom prompt to the backend AI tutor
 * and returns a short, exam-focused explanation. The returned answer
 * is rendered read-only (never mutates exercise state).
 */
export async function explainQuestion(
  input: ExplainQuestionInput
): Promise<ExplainQuestionResult> {
  const data = await request<unknown>(ENDPOINTS.explainQuestion, input);
  if (!data || typeof data !== "object") {
    return { succeeded: false, message: "Invalid response from server." };
  }
  const r = data as Record<string, unknown>;
  return {
    succeeded: r.succeeded !== false,
    message: typeof r.message === "string" ? r.message : "",
    answer: typeof r.answer === "string" ? r.answer : "",
  };
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
      const options = ["option1", "option2", "option3", "option4"]
        .map((key) => (typeof r[key] === "string" ? (r[key] as string) : ""))
        .filter((o) => o.trim().length > 0);
      return {
        questionId: Number(r.questionId) || 0,
        questionContent:
          typeof r.questionContent === "string" ? r.questionContent : "",
        rightOption: Number(r.rightOption) || 0,
        options,
      };
    })
    .filter((c) => c.questionId > 0 && c.options.length > 0);
}

export interface ReadingTimeRow {
  appUserId: number;
  courseId: number;
  exerciseStart: number;
  exerciseEnd: number;
  totalSeconds: number;
}

/**
 * Adds a delta of reading seconds to an exercise for a user (upsert). The
 * backend adds `seconds` to the stored TotalSeconds and returns the new total.
 */
export async function saveReadingTime(input: {
  appUserId: number;
  courseId: number;
  exerciseStart: number;
  exerciseEnd: number;
  seconds: number;
}): Promise<{ succeeded: boolean; totalSeconds: number }> {
  const data = await request<unknown>(ENDPOINTS.saveReadingTime, input);
  if (!data || typeof data !== "object") {
    return { succeeded: false, totalSeconds: 0 };
  }
  const r = data as Record<string, unknown>;
  return {
    succeeded: r.succeeded !== false,
    totalSeconds: Number(r.totalSeconds) || 0,
  };
}

/**
 * Fetches all reading-time rows for a user (one per exercise range).
 */
export async function getAllReadingTime(appUserId: number): Promise<ReadingTimeRow[]> {
  const data = await get<unknown>(ENDPOINTS.getAllReadingTime(appUserId));
  if (!Array.isArray(data)) return [];
  return data.filter((it) => it && typeof it === "object").map((it) => {
      const r = it as Record<string, unknown>;
      return {
        appUserId: Number(r.appUserId) || 0,
        courseId: Number(r.courseId) || 0,
        exerciseStart: Number(r.exerciseStart) || 0,
        exerciseEnd: Number(r.exerciseEnd) || 0,
        totalSeconds: Number(r.totalSeconds) || 0,
      };
    });
}

/**
 * Fetches the reading-time row for a single exercise range. Returns a zeroed
 * row when the user has not started that exercise yet.
 */
export async function getReadingTime(
  appUserId: number,
  courseId: number,
  start: number,
  end: number
): Promise<ReadingTimeRow | null> {
  const data = await get<unknown>(ENDPOINTS.getReadingTime(appUserId, courseId, start, end));
  if (!data || typeof data !== "object") return null;
  const r = data as Record<string, unknown>;
  return {
    appUserId: Number(r.appUserId) || appUserId,
    courseId: Number(r.courseId) || courseId,
    exerciseStart: Number(r.exerciseStart) || start,
    exerciseEnd: Number(r.exerciseEnd) || end,
    totalSeconds: Number(r.totalSeconds) || 0,
  };
}

export interface UserTestInfo {
  testId: number;
  courseId: number;
  courseName: string;
  isCompleted: boolean;
  testDate: string | null;
  questions: number;
  duration: number;
  rightQuestions: number;
  remarks: string;
  percentage: number;
  answeredQuestions: number;
  testStartTime: string | null;
}

/**
 * Fetches the test list for an AppUser. `answeredQuestions` is the number of
 * questions with a saved answer (0 for tests never opened).
 */
export async function getUserTests(appUserId: number): Promise<UserTestInfo[]> {
  const data = await get<unknown>(ENDPOINTS.getUserTests(appUserId));
  if (!Array.isArray(data)) return [];
  return data
    .filter((it) => it && typeof it === "object")
    .map((it) => {
      const r = it as Record<string, unknown>;
      const total = Number(r.questions) || 0;
      const right = Number(r.rightQuestions) || 0;
      return {
        testId: Number(r.testId) || 0,
        courseId: Number(r.courseId) || 0,
        courseName: typeof r.courseName === "string" ? r.courseName : "",
        isCompleted: r.isCompleted === true || r.isCompleted === "true",
        testDate: typeof r.testDate === "string" ? (r.testDate as string) : null,
        questions: total,
        duration: Number(r.duration) || 0,
        rightQuestions: right,
        remarks: typeof r.remarks === "string" ? (r.remarks as string) : "",
        percentage: total > 0 ? Math.round((right / total) * 100) : Number(r.percentage) || 0,
        answeredQuestions: Number(r.answeredQuestions) || 0,
        testStartTime: typeof r.testStartTime === "string" ? (r.testStartTime as string) : null,
      };
    });
}

export interface PrepareTestInput {
  courseId: number;
  questions: number;
  duration: number;
  applicantId: number[];
  createdBy?: number;
  testDate?: string;
}

/**
 * Creates a fresh test for the current applicant via PrepareTest. The backend
 * picks random questions for the course and returns a plain-text result.
 */
export async function prepareTest(input: PrepareTestInput): Promise<string> {
  const data = await request<unknown>(ENDPOINTS.prepareTest, {
    courseId: input.courseId,
    questions: input.questions,
    duration: input.duration,
    applicantId: input.applicantId,
    createdBy: input.createdBy || 0,
    testDate: input.testDate || new Date().toISOString(),
  });
  return typeof data === "string" ? data : JSON.stringify(data);
}

export interface GenerateTestInput {
  appUserId: number;
  courseId: number;
  questions: number;
  duration?: number;
  mode: "random" | "ai";
  difficulty?: string;
}

export interface GenerateTestResult {
  succeeded: boolean;
  message?: string;
  testId?: number;
  durationMinutes?: number;
  questions?: number;
}

/**
 * Creates a test on demand for the current user. `mode` "random" picks
 * questions from the course question bank; "ai" has the backend generate
 * questions at the requested difficulty via OpenAI. The created test is saved
 * server-side and its testId returned so the app can open it immediately.
 */
export async function generateTest(input: GenerateTestInput): Promise<GenerateTestResult> {
  const data = await request<unknown>(ENDPOINTS.generateTest, {
    appUserId: input.appUserId,
    courseId: input.courseId,
    questions: input.questions,
    duration: input.duration || 0,
    mode: input.mode,
    difficulty: input.difficulty || "",
  });
  if (!data || typeof data !== "object") {
    return { succeeded: false, message: "Invalid response from server." };
  }
  const r = data as Record<string, unknown>;
  return {
    succeeded: r.succeeded === true,
    message: typeof r.message === "string" ? (r.message as string) : "",
    testId: Number(r.testId) || 0,
    durationMinutes: Number(r.durationMinutes) || 0,
    questions: Number(r.questions) || 0,
  };
}

export interface TestQuestion {
  testId: number;
  questionId: number;
  questionContent: string;
  rightOption: number;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  isSelected: number;
  answer: string;
  durationMinutes: number;
  testStartTime: string | null;
}

export interface ConductTestResult {
  succeeded: boolean;
  questions: TestQuestion[];
  durationMinutes: number;
  testStartTime: string | null;
}

/**
 * Fetches a test's questions (with saved answers) for the conduct screen.
 * Uses the same camelCase rows as TakeExercise so option text is already
 * HTML-stripped and answer/save comparisons match server-side.
 */
export async function conductTestByUser(testId: number): Promise<ConductTestResult> {
  const data = await get<unknown>(ENDPOINTS.conductTestByUser(testId));
  if (!data || typeof data !== "object") {
    return { succeeded: false, questions: [], durationMinutes: 0, testStartTime: null };
  }
  const r = data as Record<string, unknown>;
  const rows = Array.isArray(r.data) ? r.data : [];
  const questions = rows
    .filter((it) => it && typeof it === "object")
    .map((it) => {
      const q = it as Record<string, unknown>;
      return {
        testId: Number(q.testId) || testId,
        questionId: Number(q.questionId) || 0,
        questionContent: typeof q.questionContent === "string" ? (q.questionContent as string) : "",
        rightOption: Number(q.rightOption) || 0,
        option1: typeof q.option1 === "string" ? (q.option1 as string) : "",
        option2: typeof q.option2 === "string" ? (q.option2 as string) : "",
        option3: typeof q.option3 === "string" ? (q.option3 as string) : "",
        option4: typeof q.option4 === "string" ? (q.option4 as string) : "",
        isSelected: Number(q.isSelected) || 0,
        answer: typeof q.answer === "string" ? (q.answer as string) : "",
        durationMinutes: Number(q.durationMinutes) || 0,
        testStartTime: typeof q.testStartTime === "string" ? (q.testStartTime as string) : null,
      };
    })
    .filter((q) => q.questionId > 0);
  return {
    succeeded: r.succeeded !== false,
    questions,
    durationMinutes: Number(r.durationMinutes) || 0,
    testStartTime: typeof r.testStartTime === "string" ? (r.testStartTime as string) : null,
  };
}

export interface UserTestAnswerInput {
  testId: number;
  questionId: number;
  isSelected: number;
  answer: string;
}

/**
 * Persists the selected option for a question as the user goes (server-side
 * autosave, matching UserTestUpdate).
 */
export async function userTestUpdate(input: UserTestAnswerInput): Promise<void> {
  await request<unknown>(ENDPOINTS.userTestUpdate, input);
}

/**
 * Marks the test as completed and scores it server-side. Returns the backend's
 * plain-text confirmation.
 */
export async function saveTest(testId: number): Promise<string> {
  const data = await get<unknown>(ENDPOINTS.saveTest(testId));
  return typeof data === "string" ? data : JSON.stringify(data);
}