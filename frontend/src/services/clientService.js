import { API_BASE_URL } from "./apiClient";

const CLIENT_SESSION_KEY = "mds_client_session";

function readSession() {
  const raw = localStorage.getItem(CLIENT_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeSession(session) {
  localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(CLIENT_SESSION_KEY);
}

function getClientSession() {
  return readSession();
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return void 0;
  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return text;
    }
  }
  return text;
}

async function clientFetch(path, options = {}) {
  const session = readSession();
  const headers = new Headers(options.headers);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(`Cannot reach the server at ${API_BASE_URL}.`);
  }
  const data = await parseResponse(response);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return data;
}

function normalizeCourse(course) {
  const c = course && typeof course === "object" ? course : {};
  const photo =
    typeof c.coursePhotourl === "string"
      ? c.coursePhotourl
      : typeof c.coursePhotoUrl === "string"
        ? c.coursePhotoUrl
        : "";
  return {
    courseId: Number(c.courseId) || 0,
    courseCode: typeof c.courseCode === "string" ? c.courseCode : "",
    courseName: typeof c.courseName === "string" ? c.courseName : "",
    courseUrl: typeof c.courseUrl === "string" ? c.courseUrl : "",
    coursePhotoUrl: photo,
    saleRate: Number(c.saleRate) || 0,
    isForMobile: c.isForMobile !== false,
    isActive: c.isActive !== false
  };
}

async function getPublicCourses() {
  const data = await clientFetch("/api/Course/api/Course/GetActiveCoursePublic");
  if (!Array.isArray(data)) return [];
  return data
    .map(normalizeCourse)
    .filter(course => course.courseId > 0 && course.isActive && course.isForMobile);
}

function isTrialByDates(registrationDate, expiryDate) {
  if (!registrationDate || !expiryDate) return false;
  const start = new Date(registrationDate).getTime();
  const end = new Date(expiryDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return false;
  if (Date.now() >= end) return false;
  const spanDays = (end - start) / (24 * 60 * 60 * 1000);
  return spanDays > 0 && spanDays <= 6;
}

async function getClientUserDetail(appUserId) {
  const data = await clientFetch(`/api/AppUser/api/AppUser/GetDetailOfUserById/${appUserId}`);
  if (!data || typeof data !== "object") return null;
  return {
    appUserId: Number(data.appUserId) || Number(appUserId) || 0,
    applicantId: Number(data.applicantId) || 0,
    userName: typeof data.userName === "string" ? data.userName : "",
    courseId: Number(data.courseId) || 0,
    courseName: typeof data.courseName === "string" ? data.courseName : "",
    status: data.status !== false,
    deviceId: typeof data.deviceId === "string" ? data.deviceId : "",
    registrationDate: typeof data.registrationDate === "string" ? data.registrationDate : "",
    expiryDate: typeof data.expiryDate === "string" ? data.expiryDate : "",
    isActive: typeof data.isActive === "boolean" ? data.isActive : true
  };
}

async function getClientCourses(appUserId) {
  const data = await clientFetch(`/api/Applicant/api/Applicant/GetApplicantCourses/${appUserId}`);
  if (!Array.isArray(data)) return [];
  return data
    .map(course => {
      const c = course && typeof course === "object" ? course : {};
      return {
        courseId: Number(c.courseId) || 0,
        courseCode: typeof c.courseCode === "string" ? c.courseCode : "",
        courseName: typeof c.courseName === "string" ? c.courseName : "",
        courseUrl: typeof c.courseUrl === "string" ? c.courseUrl : "",
        questions: Number(c.questions) || 0,
        materialCount: Array.isArray(c.courseMaterial) ? c.courseMaterial.length : 0
      };
    })
    .filter(course => course.courseId > 0);
}

async function getCountries() {
  const data = await clientFetch("/api/Course/api/Course/GetCountryName");
  if (!Array.isArray(data)) return [];
  return data
    .map(country => ({
      countryId: Number(country?.countryId) || 0,
      countryName: typeof country?.coutryName === "string" ? country.coutryName : ""
    }))
    .filter(country => country.countryId > 0 && country.countryName);
}

async function loginClient({ username, password }) {
  const data = await clientFetch("/api/Login/api/login/AppUserDetails", {
    method: "POST",
    body: JSON.stringify({ Username: username.trim(), Password: password, DeviceId: "web-store" })
  });
  const row = Array.isArray(data) ? data[0] : null;
  if (!row || !row.isValid || !row.userToken) {
    throw new Error(
      typeof row?.response === "string" && row.response.trim()
        ? row.response
        : "Invalid username or password."
    );
  }
  const session = {
    token: row.userToken,
    appUserId: Number(row.appUserId) || 0,
    applicantId: Number(row.applicantId) || 0,
    username: typeof row.username === "string" ? row.username : username.trim(),
    name: typeof row.name === "string" ? row.name : "",
    email: typeof row.email === "string" ? row.email : "",
    mobile: typeof row.mobile === "string" ? row.mobile : "",
    address: typeof row.address === "string" ? row.address : ""
  };
  writeSession(session);
  return session;
}

async function registerClient(input) {
  const now = new Date();
  const expiryDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const registrationNo = `WEB-${Date.now().toString().slice(-6)}`;
  const courseArray = input.courseName
    ? [
        {
          courseId: input.courseId,
          courseName: input.courseName,
          courseCode: input.courseCode || input.courseName,
          isActive: true
        }
      ]
    : [];

  const applicant = await clientFetch("/api/Applicant/api/Applicant/SaveApplicants", {
    method: "POST",
    body: JSON.stringify({
      recordId: 0,
      applicantId: 0,
      registrationNo,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      otherMobile: input.otherMobile || "",
      address: input.address,
      email: input.email,
      createdOn: now.toISOString(),
      registrationDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      userNo: 0,
      photoUrl: "",
      applyForCountry: 0,
      countryId: input.countryId,
      courseId: input.courseId,
      courseName: courseArray,
      isActive: true,
      course: input.courseName || "",
      appUserId: 0,
      messages: 0,
      courseMD: {
        courseId: input.courseId,
        courseCode: input.courseCode || input.courseName || "",
        courseName: input.courseName || "",
        isActive: true
      }
    })
  });

  if (!applicant || applicant.succeeded === false) {
    throw new Error(
      typeof applicant?.message === "string" && applicant.message
        ? applicant.message
        : "We couldn't create your applicant profile."
    );
  }

  const applicantId = Number(applicant.applicantId) || 0;
  if (applicantId <= 0) {
    throw new Error("The server did not return an applicant id.");
  }

  const appUser = await clientFetch("/api/AppUser/api/AppUser/SaveAppUser", {
    method: "POST",
    body: JSON.stringify({
      recordId: 0,
      registrationNo,
      firstName: input.firstName,
      lastName: input.lastName,
      mobile: input.mobile,
      otherMobile: input.otherMobile || "",
      address: input.address,
      email: input.email,
      createdOn: now.toISOString(),
      registrationDate: now.toISOString(),
      expiryDate: expiryDate.toISOString(),
      userNo: 0,
      photoUrl: "",
      applyForCountry: 0,
      countryId: input.countryId,
      courseId: input.courseId,
      courseName: courseArray,
      isActive: true,
      course: input.courseName || "",
      messages: 0,
      courseMD: {
        courseId: input.courseId,
        courseCode: input.courseCode || input.courseName || "",
        courseName: input.courseName || "",
        isActive: true
      },
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
      isAIAllowed: true
    })
  });

  if (!appUser || appUser.succeeded === false) {
    throw new Error(
      typeof appUser?.message === "string" && appUser.message
        ? appUser.message
        : "Your account was created, but the mobile user record could not be saved."
    );
  }

  const appUserId = Number(appUser.appUserId) || 0;
  if (appUserId <= 0) {
    throw new Error("The server did not return an app user id.");
  }

  try {
    return await loginClient({ username: input.userName, password: input.password });
  } catch {
    throw new Error(
      "Your account was created, but we couldn't sign you in automatically. Use “Already registered? Sign in” with your username and password."
    );
  }
}

async function getStripePlan() {
  const data = await clientFetch("/api/Stripe/Plan");
  const plan = data && typeof data === "object" ? data : {};
  const publishableKey =
    typeof plan.publishableKey === "string" ? plan.publishableKey.trim() : "";
  return {
    configured: plan.configured === true,
    // Never let a secret key (sk_...) reach Stripe.js.
    publishableKey: publishableKey.startsWith("pk_") ? publishableKey : "",
    amountCents: Number(plan.amountCents) || 0,
    currency: typeof plan.currency === "string" ? plan.currency : "USD",
    months: Number(plan.months) || 1
  };
}

async function createPaymentIntent({ appUserId, courseId, includeAIAssistant = false }) {
  const data = await clientFetch("/api/Stripe/CreatePaymentIntent", {
    method: "POST",
    body: JSON.stringify({
      appUserId,
      courseId,
      includeAIAssistant,
      preserveExistingCourses: true
    })
  });
  const result = data && typeof data === "object" ? data : {};
  return {
    succeeded: result.succeeded === true,
    configured: result.configured === true,
    clientSecret: typeof result.clientSecret === "string" ? result.clientSecret : "",
    paymentIntentId: typeof result.paymentIntentId === "string" ? result.paymentIntentId : "",
    amountCents: Number(result.amountCents) || 0,
    currency: typeof result.currency === "string" ? result.currency : "",
    message: typeof result.message === "string" ? result.message : ""
  };
}

async function confirmPayment({ appUserId, paymentIntentId, courseId, includeAIAssistant = false }) {
  const data = await clientFetch("/api/Stripe/Confirm", {
    method: "POST",
    body: JSON.stringify({
      appUserId,
      paymentIntentId,
      courseId,
      includeAIAssistant,
      preserveExistingCourses: true
    })
  });
  const result = data && typeof data === "object" ? data : {};
  return {
    succeeded: result.succeeded === true,
    verified: result.verified === true,
    pending: result.pending === true,
    message: typeof result.message === "string" ? result.message : ""
  };
}

let stripeScriptPromise = null;

function loadStripeScript() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  if (!stripeScriptPromise) {
    stripeScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[src="https://js.stripe.com/v3/"]');
      if (existing) {
        existing.addEventListener("load", () => resolve(window.Stripe));
        existing.addEventListener("error", () => reject(new Error("Couldn't load Stripe.")));
        return;
      }
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = () => resolve(window.Stripe);
      script.onerror = () => reject(new Error("Couldn't load Stripe."));
      document.head.appendChild(script);
    });
  }
  return stripeScriptPromise;
}

async function getStripe(publishableKey) {
  const key = typeof publishableKey === "string" ? publishableKey.trim() : "";
  if (!key.startsWith("pk_")) {
    throw new Error(
      "Card payments are misconfigured on the server. Please contact support."
    );
  }
  const Stripe = await loadStripeScript();
  if (!Stripe) throw new Error("Stripe is unavailable.");
  return Stripe(key);
}

function resolveAssetUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}/${url.replace(/^\/+/, "")}`;
}

export {
  API_BASE_URL,
  clearSession,
  clientFetch,
  confirmPayment,
  createPaymentIntent,
  getClientCourses,
  getClientSession,
  getClientUserDetail,
  getCountries,
  getPublicCourses,
  getStripe,
  getStripePlan,
  isTrialByDates,
  loginClient,
  registerClient,
  resolveAssetUrl
};
