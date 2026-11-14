import { useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Lock,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Play,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  User,
  UserCheck,
  XCircle
} from "lucide-react";
import {
  clearSession,
  getClientCourses,
  getClientSession,
  getClientUserDetail,
  isTrialByDates,
  loginClient
} from "../../../../services/clientService";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.onlinecrashcourse.app&pcampaignid=web_share";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#C41E3A] focus:ring-4 focus:ring-[#C41E3A]/10";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function daysLeft(value) {
  if (!value) return null;
  const end = new Date(value).getTime();
  if (Number.isNaN(end)) return null;
  return Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000));
}

function getInitials(name) {
  const parts = String(name || "Student").trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(part => part[0]).join("").toUpperCase() || "S";
}

function getAccountStatus(detail, loading) {
  if (!detail) {
    return loading
      ? { label: "Loading", tone: "bg-white/15 text-white" }
      : { label: "Unavailable", tone: "bg-rose-100 text-rose-700" };
  }
  const expired = detail.expiryDate ? new Date(detail.expiryDate).getTime() <= Date.now() : false;
  if (detail.status === false) return { label: "Blocked", tone: "bg-rose-100 text-rose-700" };
  if (detail.isActive === false) return { label: "Inactive", tone: "bg-rose-100 text-rose-700" };
  if (expired) return { label: "Expired", tone: "bg-rose-100 text-rose-700" };
  if (isTrialByDates(detail.registrationDate, detail.expiryDate)) {
    return { label: "Trial", tone: "bg-amber-100 text-amber-800" };
  }
  return { label: "Active", tone: "bg-emerald-100 text-emerald-700" };
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3.5 last:border-b-0">
      <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[#C41E3A]">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <p className="mt-0.5 break-words text-sm font-semibold text-slate-800">{value || "—"}</p>
      </div>
    </div>
  );
}

export function ClientLoginPage() {
  const navigate = useNavigate();
  const [existingSession] = useState(() => {
    const session = getClientSession();
    return session?.appUserId ? session : null;
  });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (existingSession) {
    return <Navigate to="/store/account" replace />;
  }

  const submit = async event => {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      await loginClient({ username, password });
      navigate("/store/account", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#C41E3A]">
        <ArrowLeft size={15} /> Back to courses
      </Link>

      <div className="mt-6 grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#8F1329] via-[#C41E3A] to-[#E05A45] p-7 text-white sm:p-9">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <Smartphone size={24} />
            </span>
            <h1 className="mt-6 text-3xl font-bold leading-tight">Mobile user login</h1>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Use the same username and password as the Crash Course Android app. After signing in you can view your account status, basic profile, and course subscription.
            </p>

            <div className="mt-8 space-y-3 text-sm text-white/80">
              <p className="flex items-center gap-2"><ShieldCheck size={16} /> Secure account access</p>
              <p className="flex items-center gap-2"><BookOpen size={16} /> See your enrolled courses</p>
              <p className="flex items-center gap-2"><CheckCircle2 size={16} /> Read material in the app</p>
            </div>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Play size={15} fill="currentColor" /> Open Google Play
            </a>
          </div>
        </div>

        <div className="p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-[#C41E3A]">
              <LogIn size={21} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-0.5 text-xs text-slate-500">Access your mobile account details.</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Username</span>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                  placeholder="Your username"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Password</span>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className={`${inputClass} pl-10`}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  type="password"
                  placeholder="Your password"
                  autoComplete="current-password"
                />
              </div>
            </label>

            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#C41E3A]/20 transition hover:bg-[#A0192F] disabled:opacity-60"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
            New to Crash Course?{" "}
            <Link to="/store" className="font-bold text-[#C41E3A] hover:underline">
              Choose a course to create your account
            </Link>
            .
          </div>
        </div>
      </div>
    </section>
  );
}

export function ClientAccountPage() {
  const navigate = useNavigate();
  const [session] = useState(() => getClientSession());
  const [detail, setDetail] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const appUserId = session?.appUserId || 0;

  const load = useCallback(async () => {
    if (!appUserId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const [detailResult, coursesResult] = await Promise.allSettled([
      getClientUserDetail(appUserId),
      getClientCourses(appUserId)
    ]);
    const errors = [];
    if (detailResult.status === "fulfilled") {
      setDetail(detailResult.value);
    } else {
      errors.push(detailResult.reason instanceof Error ? detailResult.reason.message : "Couldn't load account status.");
    }
    if (coursesResult.status === "fulfilled") {
      setCourses(coursesResult.value);
    } else {
      errors.push(coursesResult.reason instanceof Error ? coursesResult.reason.message : "Couldn't load course subscriptions.");
    }
    setError(errors.join(" "));
    setLoading(false);
  }, [appUserId]);

  useEffect(() => {
    load();
  }, [load]);

  if (!session || !appUserId) {
    return <Navigate to="/store/login" replace />;
  }

  const status = getAccountStatus(detail, loading);
  const trial = detail ? isTrialByDates(detail.registrationDate, detail.expiryDate) : false;
  const plan = detail ? (trial ? "5-day trial" : "Premium") : "—";
  const remaining = detail ? daysLeft(detail.expiryDate) : null;
  const displayName = session.name || detail?.userName || "Student";

  const logout = () => {
    clearSession();
    navigate("/store", { replace: true });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/store" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#C41E3A]">
          <ArrowLeft size={15} /> Back to courses
        </Link>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#C41E3A] hover:text-[#C41E3A] disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#8F1329] via-[#C41E3A] to-[#E05A45] p-6 text-white shadow-xl shadow-rose-200 sm:p-8">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-xl font-bold backdrop-blur">
              {getInitials(displayName)}
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Mobile account</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{displayName}</h1>
              <p className="mt-1 text-sm text-white/70">@{session.username || detail?.userName || "student"}</p>
            </div>
          </div>
          <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${status.tone}`}>
            {status.label}
          </span>
        </div>

        <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Plan</p>
            <p className="mt-1 text-lg font-bold">{plan}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Expires</p>
            <p className="mt-1 text-lg font-bold">{formatDate(detail?.expiryDate)}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/55">Days left</p>
            <p className="mt-1 text-lg font-bold">
              {remaining == null ? "—" : remaining > 0 ? `${remaining} days` : "Expired"}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-[#C41E3A]">
              <User size={19} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Basic information</h2>
              <p className="mt-0.5 text-xs text-slate-500">Your profile details.</p>
            </div>
          </div>
          <div className="mt-1">
            <InfoRow icon={User} label="Full name" value={displayName} />
            <InfoRow icon={BadgeCheck} label="Username" value={session.username || detail?.userName} />
            <InfoRow icon={Mail} label="Email" value={session.email} />
            <InfoRow icon={Phone} label="Mobile" value={session.mobile} />
            <InfoRow icon={MapPin} label="Address" value={session.address} />
            <InfoRow icon={UserCheck} label="App user ID" value={appUserId ? `#${appUserId}` : "—"} />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard size={19} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Subscription information</h2>
              <p className="mt-0.5 text-xs text-slate-500">Your plan and account dates.</p>
            </div>
          </div>
          <div className="mt-1">
            <InfoRow icon={ShieldCheck} label="Account status" value={status.label} />
            <InfoRow icon={BadgeCheck} label="Plan" value={plan} />
            <InfoRow icon={CalendarDays} label="Registration date" value={formatDate(detail?.registrationDate)} />
            <InfoRow icon={Clock} label="Expiry date" value={formatDate(detail?.expiryDate)} />
            <InfoRow icon={UserCheck} label="Applicant ID" value={detail?.applicantId ? `#${detail.applicantId}` : "—"} />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <BookOpen size={19} />
            </span>
            <div>
              <h2 className="font-bold text-slate-900">Course subscriptions</h2>
              <p className="mt-0.5 text-xs text-slate-500">Courses available in your mobile account.</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
            <Loader2 size={18} className="animate-spin text-[#C41E3A]" /> Loading subscriptions...
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <XCircle size={28} className="text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No course subscription found</p>
            <p className="mt-1 text-xs text-slate-500">Choose a course from the store to get started.</p>
            <Link to="/store" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C41E3A] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#A0192F]">
              Browse courses <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {courses.map(course => (
              <div key={course.courseId} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {course.courseCode || "Course"}
                    </p>
                    <p className="mt-1 font-bold text-slate-900">{course.courseName || "Untitled course"}</p>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    Enrolled
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><BookOpen size={13} /> {course.materialCount} materials</span>
                  <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> {course.questions} questions</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          <Play size={15} fill="currentColor" /> Open Android app
        </a>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-bold text-[#C41E3A] transition hover:bg-rose-50"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </section>
  );
}
