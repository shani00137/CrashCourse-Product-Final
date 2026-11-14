import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Menu,
  Phone,
  Play,
  Search,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Trash2,
  User,
  UserPlus,
  X
} from "lucide-react";
import {
  clearSession,
  confirmPayment,
  createPaymentIntent,
  getClientSession,
  getCountries,
  getPublicCourses,
  getStripe,
  getStripePlan,
  loginClient,
  registerClient,
  resolveAssetUrl
} from "../../../../services/clientService";
import {
  addToCart,
  cartTotal,
  clearCart,
  formatPrice,
  getCart,
  removeFromCart
} from "../../../../services/clientCart";
import { ClientAccountPage, ClientLoginPage } from "./ClientAccount";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#C41E3A] focus:ring-4 focus:ring-[#C41E3A]/10";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.onlinecrashcourse.app&pcampaignid=web_share";

function PlayStoreButton({ light = false, className = "" }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-3 rounded-xl px-4 py-2.5 shadow-sm transition ${
        light
          ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          : "bg-slate-950 text-white hover:bg-slate-800"
      } ${className}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          light ? "bg-slate-900/5" : "bg-white/10"
        }`}
      >
        <Play size={17} fill="currentColor" />
      </span>
      <span className="flex flex-col text-left leading-none">
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] opacity-60">
          Get it on
        </span>
        <span className="mt-1 text-sm font-bold">Google Play</span>
      </span>
    </a>
  );
}

function CourseImage({ course, className = "" }) {
  const image = resolveAssetUrl(course.coursePhotoUrl);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [image]);
  if (image && !failed) {
    return (
      <img
        src={image}
        alt={course.courseName || "Course"}
        className={`h-full w-full object-cover ${className}`}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 ${className}`}>
      <GraduationCap size={42} className="text-[#C41E3A]/50" />
    </div>
  );
}

function Header({ cartCount }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/store" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C41E3A] text-white shadow-lg shadow-[#C41E3A]/20">
            <GraduationCap size={21} />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-slate-900">Crash Course</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
              Health Care Professionals
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/store" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Courses
          </Link>
          <a href="/store#app" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Mobile app
          </a>
          <a href="#why-us" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            Why us
          </a>
          <Link to="/store/cart" className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
            <ShoppingCart size={17} />
            Cart
            {cartCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C41E3A] px-1.5 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </nav>

        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            <Link to="/store" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Courses
            </Link>
            <a href="/store#app" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Mobile app
            </a>
            <Link to="/store/cart" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <span className="flex items-center gap-2"><ShoppingCart size={16} /> Cart</span>
              <span className="text-xs text-slate-500">{cartCount}</span>
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function Footer() {
  useLocation();
  const session = getClientSession();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C41E3A] text-white">
            <GraduationCap size={16} />
          </span>
          <span className="font-semibold text-slate-800">Crash Course</span>
          <span className="text-slate-300">/</span>
          <span>Health care exam preparation</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} /> Secure Stripe payments</span>
          <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-[#C41E3A]">
            <Smartphone size={14} /> Android app
          </a>
          <span className="hidden h-4 w-px bg-slate-200 sm:block" />
          <Link
            to={session ? "/store/account" : "/store/login"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 transition hover:border-[#C41E3A] hover:text-[#C41E3A]"
          >
            <User size={14} /> {session ? "My account" : "Mobile user login"}
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-slate-500 transition hover:text-[#C41E3A]"
          >
            <Lock size={14} /> Admin login
          </Link>
        </div>
      </div>
    </footer>
  );
}

function CourseCard({ course, inCart, onAdd, onBuy }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <CourseImage course={course} className="transition duration-500 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
            <Smartphone size={11} /> App access
          </span>
          {course.courseCode ? (
            <span className="rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
              {course.courseCode}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-slate-900">
          {course.courseName || "Untitled course"}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
          <BadgeCheck size={14} className="text-emerald-600" />
          Verified curriculum
          <span className="text-slate-300">•</span>
          Read in app
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Course price</p>
            <p className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">{formatPrice(course.saleRate)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAdd(course)}
              disabled={inCart}
              className={`inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition ${
                inCart
                  ? "cursor-default bg-emerald-50 text-emerald-700"
                  : "border border-slate-200 text-slate-700 hover:border-[#C41E3A] hover:text-[#C41E3A]"
              }`}
            >
              {inCart ? <Check size={14} /> : <ShoppingCart size={14} />}
              {inCart ? "In cart" : "Add to cart"}
            </button>
            <button
              type="button"
              onClick={() => onBuy(course)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#C41E3A] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#A0192F]"
            >
              Enroll <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function AppPromo() {
  const highlights = [
    { icon: BookOpen, title: "Full course material", text: "Read lessons and notes after enrollment." },
    { icon: ShieldCheck, title: "One account", text: "Sign in with the account you create here." },
    { icon: Smartphone, title: "Study anywhere", text: "Review material on your Android phone." }
  ];

  return (
    <section id="app" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-2xl shadow-slate-300 sm:px-10 lg:px-14 lg:py-14">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#C41E3A]/30 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_280px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
              <Smartphone size={14} /> Official Android app
            </span>
            <h2 className="mt-5 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Your course material, wherever you study.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
              After checkout, sign in to the Crash Course app on Google Play to read the course material, review exercises, and prepare for your exam on the go.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <PlayStoreButton light />
              <span className="text-xs font-medium text-white/50">Download the app from Google Play</span>
            </div>
            <div className="mt-9 grid gap-3 sm:grid-cols-3">
              {highlights.map(item => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-rose-200">
                    <item.icon size={18} />
                  </span>
                  <p className="mt-3 text-sm font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[250px]">
            <div className="rounded-[2rem] border border-white/15 bg-white/[0.06] p-3 shadow-2xl shadow-black/40">
              <div className="overflow-hidden rounded-[1.5rem] bg-white">
                <div className="bg-gradient-to-br from-[#8F1329] to-[#C41E3A] px-5 py-6 text-white">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/65">
                    <GraduationCap size={14} /> Crash Course
                  </div>
                  <p className="mt-3 text-lg font-bold leading-tight">Continue learning</p>
                  <p className="mt-1 text-xs text-white/65">Your enrolled courses</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {["Course overview", "Lessons and notes", "Practice exercises"].map((label, index) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-3.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-[#C41E3A]">
                        {index === 0 ? <BookOpen size={15} /> : index === 1 ? <CheckCircle2 size={15} /> : <Sparkles size={15} />}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Catalog({ courses, loading, error, onReload, cart, onAdd, onBuy }) {
  const [query, setQuery] = useState("");
  const filtered = courses.filter(course => {
    const value = query.trim().toLowerCase();
    if (!value) return true;
    return (
      (course.courseName || "").toLowerCase().includes(value) ||
      (course.courseCode || "").toLowerCase().includes(value)
    );
  });

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#8F1329] via-[#C41E3A] to-[#E05A45] text-white">
        <div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <Sparkles size={14} /> Trusted by health care professionals
            </span>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Learn smarter. Pass with confidence.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              Choose a mobile-ready crash course, enroll securely, and read the full course material in our Android app. Built for busy health care professionals.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#courses" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#A0192F] shadow-xl shadow-black/10 transition hover:bg-rose-50">
                Browse courses <ArrowRight size={16} />
              </a>
              <Link to="/store/cart" className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
                <ShoppingCart size={16} /> View cart
              </Link>
              <PlayStoreButton />
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} /> Verified content</span>
              <span className="inline-flex items-center gap-2"><Smartphone size={16} /> Read in the app</span>
              <span className="inline-flex items-center gap-2"><CreditCard size={16} /> Secure checkout</span>
            </div>
            <div className="mt-8 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : courses.length}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Active courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Android</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Mobile app</p>
              </div>
              <div>
                <p className="text-2xl font-bold">Stripe</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/55">Secure pay</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="rounded-2xl bg-white p-5 text-slate-900">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Course preview</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Active</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-[#C41E3A]">
                    <BookOpen size={26} />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{courses[0]?.courseName || "Your next course"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{courses[0]?.courseCode || "Mobile crash course"}</p>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-lg font-bold text-slate-900">{formatPrice(courses[0]?.saleRate ?? 0)}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">One-time</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-lg font-bold text-slate-900">Mobile</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Study anywhere</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-2/3 rounded-full bg-[#C41E3A]" />
                </div>
                <p className="mt-2 text-xs text-slate-500">Structured lessons, exercises and timed tests.</p>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-between rounded-xl bg-slate-950 px-3.5 py-3 text-white transition hover:bg-slate-800"
                >
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <Smartphone size={15} /> Read course material in the app
                  </span>
                  <Play size={14} fill="currentColor" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C41E3A]">Available now</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Choose your course</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Every course below is active and enabled for mobile learning. Add one or more to your cart, then create your account and pay securely.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search courses..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#C41E3A] focus:ring-4 focus:ring-[#C41E3A]/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20">
            <Loader2 size={30} className="animate-spin text-[#C41E3A]" />
            <p className="mt-3 text-sm text-slate-500">Loading available courses...</p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="mt-10 flex flex-col items-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-14 text-center">
            <AlertCircle size={32} className="text-[#C41E3A]" />
            <p className="mt-3 text-sm font-semibold text-rose-900">{error}</p>
            <button type="button" onClick={onReload} className="mt-5 rounded-xl bg-[#C41E3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#A0192F]">
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !error && filtered.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <BookOpen size={34} className="mx-auto text-slate-300" />
            <p className="mt-3 font-semibold text-slate-800">No courses found</p>
            <p className="mt-1 text-sm text-slate-500">
              {courses.length === 0 ? "New programs are added regularly. Please check back soon." : "Try a different search term."}
            </p>
          </div>
        ) : null}

        {!loading && !error && filtered.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(course => (
              <CourseCard
                key={course.courseId}
                course={course}
                inCart={cart.some(item => item.courseId === course.courseId)}
                onAdd={onAdd}
                onBuy={onBuy}
              />
            ))}
          </div>
        ) : null}
      </section>

      <AppPromo />

      <section id="why-us" className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { icon: ShieldCheck, title: "Verified content", text: "Courses are prepared and maintained by health care education specialists." },
            { icon: Smartphone, title: "Study on mobile", text: "Every listed course is enabled for the Crash Course mobile app." },
            { icon: CreditCard, title: "Secure payments", text: "Card payments are processed securely by Stripe. No card details touch our servers." }
          ].map(item => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#C41E3A] shadow-sm">
                <item.icon size={21} />
              </span>
              <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function CartPage({ cart, onRemove, onCheckout }) {
  const total = cartTotal(cart);
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C41E3A]">Your selection</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Course cart</h1>
          <p className="mt-2 text-sm text-slate-500">Review your courses before creating your account and paying.</p>
        </div>
        <Link to="/store" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#C41E3A] hover:text-[#C41E3A]">
          <ArrowLeft size={15} /> Continue shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-[#C41E3A]">
            <ShoppingCart size={24} />
          </span>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-slate-500">Add a course from the catalog to get started.</p>
          <Link to="/store" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#A0192F]">
            Browse courses <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {cart.map(course => (
              <div key={course.courseId} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  <CourseImage course={course} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{course.courseCode || "Course"}</p>
                  <h3 className="mt-0.5 truncate text-sm font-bold text-slate-900">{course.courseName}</h3>
                  <p className="mt-1 text-sm font-semibold text-[#C41E3A]">{formatPrice(course.saleRate)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(course.courseId)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-[#C41E3A]"
                  aria-label={`Remove ${course.courseName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Order summary</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Courses</span>
                <span>{cart.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax</span>
                <span>Included</span>
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-semibold text-slate-700">Total</span>
              <span className="text-2xl font-bold tracking-tight text-slate-900">{formatPrice(total)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#A0192F]"
            >
              Continue to checkout <ArrowRight size={16} />
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
              <Lock size={12} /> Secure Stripe card payment
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {Icon ? <Icon size={13} /> : null}
        {label}
      </span>
      {children}
    </label>
  );
}

function RegisterForm({ cart, countries, countriesLoading, onRegistered }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    otherMobile: "",
    email: "",
    address: "",
    countryId: "",
    userName: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const primaryCourse = cart[0];

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const submit = async event => {
    event.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) return setError("Please enter your full name.");
    if (form.mobile.trim().replace(/\D/g, "").length < 10) return setError("Please enter a valid mobile number.");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Please enter a valid email address.");
    if (!form.address.trim()) return setError("Please enter your address.");
    if (!form.countryId) return setError("Please select your country.");
    if (form.userName.trim().length < 4) return setError("Username must be at least 4 characters.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const session = await registerClient({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobile: form.mobile.trim(),
        otherMobile: form.otherMobile.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        userName: form.userName.trim(),
        password: form.password,
        countryId: Number(form.countryId),
        courseId: primaryCourse.courseId,
        courseName: primaryCourse.courseName,
        courseCode: primaryCourse.courseCode
      });
      onRegistered(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" icon={User}>
          <input className={inputClass} value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John" autoComplete="given-name" />
        </Field>
        <Field label="Last name" icon={User}>
          <input className={inputClass} value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Doe" autoComplete="family-name" />
        </Field>
        <Field label="Mobile number" icon={Phone}>
          <input className={inputClass} value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="+1 234 567 8901" autoComplete="tel" />
        </Field>
        <Field label="Other mobile (optional)" icon={Phone}>
          <input className={inputClass} value={form.otherMobile} onChange={e => update("otherMobile", e.target.value)} placeholder="+1 555 000 1111" />
        </Field>
        <Field label="Email address" icon={Mail}>
          <input className={inputClass} value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" type="email" autoComplete="email" />
        </Field>
        <Field label="Country" icon={MapPin}>
          <select className={inputClass} value={form.countryId} onChange={e => update("countryId", e.target.value)} disabled={countriesLoading}>
            <option value="">{countriesLoading ? "Loading countries..." : "Select your country"}</option>
            {countries.map(country => (
              <option key={country.countryId} value={country.countryId}>{country.countryName}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Address" icon={MapPin}>
        <textarea className={`${inputClass} h-24 resize-none py-3`} value={form.address} onChange={e => update("address", e.target.value)} placeholder="Street, city, country" autoComplete="street-address" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Username" icon={User}>
          <input className={inputClass} value={form.userName} onChange={e => update("userName", e.target.value)} placeholder="Choose a username" autoComplete="username" />
        </Field>
        <div className="hidden sm:block" />
        <Field label="Password" icon={Lock}>
          <div className="relative">
            <input className={`${inputClass} pr-10`} value={form.password} onChange={e => update("password", e.target.value)} placeholder="At least 6 characters" type={showPassword ? "text" : "password"} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-800">
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>
        <Field label="Confirm password" icon={Lock}>
          <input className={inputClass} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Re-enter password" type={showPassword ? "text" : "password"} autoComplete="new-password" />
        </Field>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
          <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#A0192F] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
        {loading ? "Creating your account..." : "Create account & continue to payment"}
      </button>
      <p className="text-center text-xs leading-relaxed text-slate-500">
        Your account starts with a 5-day trial. Completing payment unlocks the course(s) in your cart.
      </p>
    </form>
  );
}

function SignInForm({ onSignedIn, onCancel }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setLoading(true);
    try {
      const session = await loginClient({ username, password });
      onSignedIn(session);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Username" icon={User}>
        <input className={inputClass} value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" autoComplete="username" />
      </Field>
      <Field label="Password" icon={Lock}>
        <input className={inputClass} value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Your password" autoComplete="current-password" />
      </Field>
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
          <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}
      <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#A0192F] disabled:opacity-60">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
        {loading ? "Signing in..." : "Sign in to continue"}
      </button>
      <button type="button" onClick={onCancel} className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800">
        Create a new account instead
      </button>
    </form>
  );
}

function PaymentStep({ cart, session, onSuccess, onUseAnotherAccount }) {
  const cardMountRef = useRef(null);
  const cardElementRef = useRef(null);
  const stripeRef = useRef(null);
  const [plan, setPlan] = useState(null);
  const [ready, setReady] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [progress, setProgress] = useState("");
  const total = cartTotal(cart);

  useEffect(() => {
    let cancelled = false;
    let cardElement = null;

    (async () => {
      try {
        const info = await getStripePlan();
        if (cancelled) return;
        setPlan(info);
        if (!info.configured || !info.publishableKey) {
          setError("Card payments are not configured on the server yet. Please contact support.");
          return;
        }
        const stripe = await getStripe(info.publishableKey);
        if (cancelled) return;
        stripeRef.current = stripe;
        const elements = stripe.elements();
        cardElement = elements.create("card", {
          hidePostalCode: false,
          style: {
            base: {
              fontSize: "15px",
              color: "#0f172a",
              fontFamily: "Inter, system-ui, sans-serif",
              "::placeholder": { color: "#94a3b8" }
            },
            invalid: { color: "#C41E3A" }
          }
        });
        if (cardMountRef.current) {
          cardElement.mount(cardMountRef.current);
          cardElementRef.current = cardElement;
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Couldn't prepare the payment form.");
      } finally {
        if (!cancelled) setLoadingPlan(false);
      }
    })();

    return () => {
      cancelled = true;
      if (cardElement) cardElement.destroy();
      cardElementRef.current = null;
    };
  }, []);

  const pay = async () => {
    setError("");
    if (!stripeRef.current || !cardElementRef.current) {
      setError("The payment form is still loading. Please wait a moment and try again.");
      return;
    }
    setPaying(true);
    try {
      for (let index = 0; index < cart.length; index += 1) {
        const course = cart[index];
        if (Number(course.saleRate) <= 0) {
          setProgress(`Enrolling in ${course.courseName || "free course"}...`);
          const enrolled = await confirmPayment({
            appUserId: session.appUserId,
            paymentIntentId: "",
            courseId: course.courseId
          });
          if (!enrolled.succeeded) {
            throw new Error(enrolled.message || "We couldn't enroll you in the free course.");
          }
          continue;
        }
        setProgress(`Preparing payment ${index + 1} of ${cart.length}...`);
        const intent = await createPaymentIntent({
          appUserId: session.appUserId,
          courseId: course.courseId
        });
        if (!intent.succeeded || !intent.clientSecret) {
          throw new Error(intent.message || "Couldn't start the payment. Please try again.");
        }
        setProgress(`Paying for ${course.courseName || "course"} (${index + 1} of ${cart.length})...`);
        const result = await stripeRef.current.confirmCardPayment(intent.clientSecret, {
          payment_method: {
            card: cardElementRef.current,
            billing_details: {
              name: session.name || session.username || "",
              email: session.email || ""
            }
          }
        });
        if (result.error) {
          throw new Error(result.error.message || "The payment didn't go through. Please try again.");
        }
        if (!result.paymentIntent || result.paymentIntent.status !== "succeeded") {
          throw new Error("The payment was not completed. Please try again.");
        }
        setProgress(`Confirming ${course.courseName || "course"}...`);
        const confirmed = await confirmPayment({
          appUserId: session.appUserId,
          paymentIntentId: result.paymentIntent.id,
          courseId: course.courseId
        });
        if (!confirmed.succeeded) {
          throw new Error(confirmed.message || "We couldn't confirm this payment. Please try again.");
        }
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
      setProgress("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-emerald-900">
          <CheckCircle2 size={18} />
          <span>Signed in as <strong>{session.name || session.username}</strong></span>
        </div>
        <button type="button" onClick={onUseAnotherAccount} className="text-xs font-semibold text-emerald-800 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-950">
          Use another account
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <CreditCard size={17} className="text-[#C41E3A]" /> Card details
        </h3>
        <p className="mt-1 text-xs text-slate-500">Payments are processed securely by Stripe. We never store your card details.</p>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
          <div ref={cardMountRef} className="min-h-10" />
          {loadingPlan ? (
            <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
              <Loader2 size={14} className="animate-spin" /> Loading secure payment form...
            </div>
          ) : null}
        </div>
      </div>

      {plan && plan.configured ? (
        <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
          <ShieldCheck size={16} className="mt-0.5 flex-shrink-0 text-emerald-600" />
          <span>Your card will be charged once per course in your cart. Total: <strong className="text-slate-900">{formatPrice(total)}</strong>.</span>
        </div>
      ) : null}

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
          <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={pay}
        disabled={!ready || paying || !plan?.configured}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#A0192F] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? <Loader2 size={17} className="animate-spin" /> : <Lock size={17} />}
        {paying ? progress || "Processing payment..." : `Pay ${formatPrice(total)} securely`}
      </button>
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-500">
        <ShieldCheck size={12} /> PCI-compliant payment powered by Stripe
      </p>
    </div>
  );
}

function CheckoutPage({ cart, onRemove, onPaid }) {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getClientSession());
  const [mode, setMode] = useState(() => (getClientSession() ? "payment" : "register"));
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getCountries();
        if (mounted) setCountries(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Unable to load countries.");
      } finally {
        if (mounted) setCountriesLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (cart.length === 0) {
    return <Navigate to="/store/cart" replace />;
  }

  const handleRegistered = registeredSession => {
    setSession(registeredSession);
    setMode("payment");
  };

  const handleSignedIn = signedInSession => {
    setSession(signedInSession);
    setMode("payment");
  };

  const handleUseAnother = () => {
    clearSession();
    setSession(null);
    setMode("register");
  };

  const handlePaid = () => {
    const summary = {
      items: cart,
      total: cartTotal(cart),
      name: session?.name || session?.username || "",
      email: session?.email || "",
      paidAt: new Date().toISOString()
    };
    onPaid();
    navigate("/store/success", { replace: true, state: summary });
  };

  const primaryCourse = cart[0];

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#C41E3A]">Secure checkout</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {mode === "payment" ? "Complete your payment" : "Create your account"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            {mode === "payment"
              ? "Enter your card details to unlock the courses in your cart."
              : "Register with the same details used in the Crash Course mobile app, then pay securely with Stripe."}
          </p>
        </div>
        <Link to="/store/cart" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#C41E3A] hover:text-[#C41E3A]">
          <ArrowLeft size={15} /> Back to cart
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {mode === "payment" && session ? (
            <PaymentStep
              cart={cart}
              session={session}
              onSuccess={handlePaid}
              onUseAnotherAccount={handleUseAnother}
            />
          ) : mode === "login" ? (
            <SignInForm onSignedIn={handleSignedIn} onCancel={() => setMode("register")} />
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <UserPlus size={17} className="text-[#C41E3A]" /> Personal information
                </h2>
                <button type="button" onClick={() => setMode("login")} className="text-xs font-semibold text-[#C41E3A] hover:underline">
                  Already registered? Sign in
                </button>
              </div>
              {error ? (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
                  <AlertCircle size={17} className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}
              <RegisterForm
                cart={cart}
                countries={countries}
                countriesLoading={countriesLoading}
                onRegistered={handleRegistered}
              />
            </>
          )}
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Your cart</h2>
          <div className="mt-4 space-y-3">
            {cart.map(course => (
              <div key={course.courseId} className="flex items-start gap-3">
                <div className="h-12 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <CourseImage course={course} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">{course.courseName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatPrice(course.saleRate)}</p>
                </div>
                {mode !== "payment" ? (
                  <button type="button" onClick={() => onRemove(course.courseId)} className="text-slate-400 hover:text-[#C41E3A]" aria-label={`Remove ${course.courseName}`}>
                    <X size={14} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-semibold text-slate-700">Total</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">{formatPrice(cartTotal(cart))}</span>
          </div>
          <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
            <p className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-emerald-600" /> Secure Stripe payment</p>
            <p className="flex items-center gap-1.5"><Smartphone size={13} className="text-emerald-600" /> Course access in the mobile app</p>
            {primaryCourse ? <p className="flex items-center gap-1.5"><BookOpen size={13} className="text-emerald-600" /> Registration course: {primaryCourse.courseName}</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function SuccessPage({ cart }) {
  const location = useLocation();
  const summary = location.state;
  const items = Array.isArray(summary?.items) && summary.items.length > 0 ? summary.items : cart;
  const total = summary?.total ?? cartTotal(items);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 px-6 py-10 text-center text-white sm:px-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur">
            <CheckCircle2 size={34} />
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight">Payment successful</h1>
          <p className="mt-2 text-sm text-emerald-50">
            Thank you{summary?.name ? `, ${summary.name}` : ""}. Your course access is ready.
          </p>
        </div>
        <div className="px-6 py-8 sm:px-10">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Order summary</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {items.map(course => (
              <div key={course.courseId} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{course.courseName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{course.courseCode || "Course"}</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">{formatPrice(course.saleRate)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-end justify-between border-t border-slate-200 pt-4">
            <span className="text-sm font-semibold text-slate-700">Total paid</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900">{formatPrice(total)}</span>
          </div>
          {summary?.email ? (
            <p className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3.5 text-xs leading-relaxed text-slate-600">
              <Mail size={15} className="mt-0.5 flex-shrink-0 text-[#C41E3A]" />
              A receipt has been sent to <strong>{summary.email}</strong>. Sign in to the Crash Course mobile app with your username to start learning.
            </p>
          ) : null}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link to="/store" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C41E3A] px-5 py-3 text-sm font-bold text-white hover:bg-[#A0192F]">
              Browse more courses <ArrowRight size={16} />
            </Link>
            <Link to="/store/cart" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[#C41E3A] hover:text-[#C41E3A]">
              <ShoppingCart size={16} /> View cart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Storefront() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState(() => getCart());

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getPublicCourses();
      setCourses(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleAdd = course => {
    setCart(current => addToCart(current, course));
  };

  const handleBuy = course => {
    const next = addToCart(cart, course);
    setCart(next);
    navigate("/store/cart");
  };

  const handleRemove = courseId => {
    setCart(current => removeFromCart(current, courseId));
  };

  const handleCheckout = () => {
    navigate("/store/checkout");
  };

  const handlePaid = () => {
    setCart(clearCart());
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-['Inter',sans-serif] text-slate-900">
      <Header cartCount={cart.length} />
      <main>
        <Routes>
          <Route
            index
            element={
              <Catalog
                courses={courses}
                loading={loading}
                error={error}
                onReload={loadCourses}
                cart={cart}
                onAdd={handleAdd}
                onBuy={handleBuy}
              />
            }
          />
          <Route path="cart" element={<CartPage cart={cart} onRemove={handleRemove} onCheckout={handleCheckout} />} />
          <Route path="checkout" element={<CheckoutPage cart={cart} onRemove={handleRemove} onPaid={handlePaid} />} />
          <Route path="success" element={<SuccessPage cart={cart} />} />
          <Route path="login" element={<ClientLoginPage />} />
          <Route path="account" element={<ClientAccountPage />} />
          <Route path="*" element={<Navigate to="/store" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
