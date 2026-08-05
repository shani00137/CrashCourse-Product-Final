import { useState, useRef } from "react";
import {
  LayoutDashboard, Users, BookOpen, ClipboardList, FileText, Award,
  Settings, Shield, Smartphone, Database, Camera, Lock, ChevronLeft,
  ChevronRight, Bell, Search, LogOut, User, Menu, X, Plus, Download,
  Eye, Edit2, Trash2, Check, Clock, AlertCircle, TrendingUp, TrendingDown,
  DollarSign, BookMarked, Upload, Filter, MoreHorizontal, ChevronDown,
  FileSpreadsheet, File, Video, Mic, CheckCircle, XCircle, RefreshCw,
  Home, ArrowRight, Star, Phone, Mail, MapPin, Calendar, Hash,
  BarChart2, PieChart, Activity, Info, Layers
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen =
  | "login" | "dashboard" | "applicants" | "applicant-detail"
  | "registration" | "invoice" | "courses" | "question-bank"
  | "create-test" | "mobile-users" | "roles" | "user-accounts"
  | "certificates" | "screenshots" | "backup" | "change-password" | "settings";

// ─── Data ────────────────────────────────────────────────────────────────────
const applicants = [
  { id: "MDS-2024-0123", name: "Zara Ahmed", avatar: "ZA", mobile: "+971 50 234 5678", country: "UAE", course: "Medical Dental Science", status: "Active", address: "Dubai, UAE" },
  { id: "MDS-2024-0124", name: "Khalid Al-Rashid", avatar: "KR", mobile: "+971 55 876 5432", country: "Saudi Arabia", course: "Healthcare Management", status: "Pending", address: "Abu Dhabi, UAE" },
  { id: "MDS-2024-0125", name: "Priya Nair", avatar: "PN", mobile: "+971 52 345 6789", country: "India", course: "Nursing Administration", status: "Active", address: "Sharjah, UAE" },
  { id: "MDS-2024-0126", name: "Omar Hassan", avatar: "OH", mobile: "+971 54 987 6543", country: "Egypt", course: "Medical Dental Science", status: "Expired", address: "Ajman, UAE" },
  { id: "MDS-2024-0127", name: "Sofia Martinez", avatar: "SM", mobile: "+971 56 123 4567", country: "Philippines", course: "Healthcare Management", status: "Active", address: "Dubai, UAE" },
  { id: "MDS-2024-0128", name: "Ahmed Al-Farsi", avatar: "AF", mobile: "+971 50 654 3210", country: "Oman", course: "Nursing Administration", status: "Pending", address: "Ras Al Khaimah, UAE" },
  { id: "MDS-2024-0129", name: "Lin Wei", avatar: "LW", mobile: "+971 52 789 0123", country: "China", course: "Medical Dental Science", status: "Active", address: "Dubai, UAE" },
  { id: "MDS-2024-0130", name: "Fatima Malik", avatar: "FM", mobile: "+971 55 321 0987", country: "Pakistan", course: "Healthcare Management", status: "Pending", address: "Fujairah, UAE" },
];

const monthlyData = [
  { month: "Jan", registrations: 42, revenue: 84000 },
  { month: "Feb", registrations: 58, revenue: 116000 },
  { month: "Mar", registrations: 73, revenue: 146000 },
  { month: "Apr", registrations: 61, revenue: 122000 },
  { month: "May", registrations: 89, revenue: 178000 },
  { month: "Jun", registrations: 95, revenue: 190000 },
  { month: "Jul", registrations: 112, revenue: 224000 },
  { month: "Aug", registrations: 87, revenue: 174000 },
];

const courses = [
  { code: "MDS-101", name: "Medical Dental Science Foundation", attachments: ["PDF", "Video"], status: "Active" },
  { code: "HCM-201", name: "Healthcare Management & Leadership", attachments: ["PDF", "Audio"], status: "Active" },
  { code: "NRS-301", name: "Nursing Administration & Practice", attachments: ["PDF"], status: "Active" },
  { code: "PHM-101", name: "Pharmacy & Clinical Practice", attachments: ["Video", "Audio"], status: "Inactive" },
  { code: "RAD-201", name: "Radiology & Diagnostic Imaging", attachments: ["PDF", "Video"], status: "Active" },
];

const questions = [
  {
    id: 1, course: "MDS-101", exercise: "Module 3",
    question: "Which of the following is the primary function of the mitral valve in the human heart?",
    options: ["Controls blood flow between right atrium and right ventricle", "Controls blood flow between left atrium and left ventricle", "Controls blood flow between left ventricle and aorta", "Controls blood flow between right ventricle and pulmonary artery"],
    correct: 1
  },
  {
    id: 2, course: "HCM-201", exercise: "Module 1",
    question: "According to the DHA healthcare regulations, what is the minimum required continuing medical education (CME) hours per year?",
    options: ["10 hours", "20 hours", "30 hours", "50 hours"],
    correct: 2
  },
  {
    id: 3, course: "MDS-101", exercise: "Module 5",
    question: "The DHCC licensing framework requires which of the following documents for initial registration?",
    options: ["Only passport and degree certificate", "Passport, degree, good standing letter, and experience certificate", "Passport and good standing letter only", "Degree certificate and experience letter only"],
    correct: 1
  },
];

const testRecords = [
  { applicant: "Zara Ahmed", course: "MDS-101", date: "2024-10-15", questions: 40, result: 87.5, status: "Passed" },
  { applicant: "Khalid Al-Rashid", course: "HCM-201", date: "2024-10-12", questions: 35, result: 62.8, status: "Failed" },
  { applicant: "Priya Nair", course: "NRS-301", date: "2024-10-18", questions: 40, result: 92.5, status: "Passed" },
  { applicant: "Omar Hassan", course: "MDS-101", date: "2024-10-10", questions: 40, result: null, status: "Pending" },
  { applicant: "Sofia Martinez", course: "HCM-201", date: "2024-10-20", questions: 35, result: 78.3, status: "Passed" },
];

const invoices = [
  { no: "INV-2024-0089", date: "2024-10-01", service: "Registration Fee", amount: 1500, paid: 1500, balance: 0, currency: "AED", status: "Paid" },
  { no: "INV-2024-0090", date: "2024-10-05", service: "Exam Fee - MDS-101", amount: 800, paid: 0, balance: 800, currency: "AED", status: "Unpaid" },
  { no: "INV-2024-0091", date: "2024-10-12", service: "Document Verification", amount: 350, paid: 350, balance: 0, currency: "AED", status: "Paid" },
  { no: "INV-2024-0092", date: "2024-10-20", service: "Certificate Issuance", amount: 250, paid: 125, balance: 125, currency: "AED", status: "Partial" },
];

const mobileUsers = [
  { user: "Zara Ahmed", id: "APP-001", device: "iPhone 14 Pro", status: "Active", lastLogin: "2024-10-21 09:14" },
  { user: "Khalid Al-Rashid", id: "APP-002", device: "Samsung Galaxy S23", status: "Active", lastLogin: "2024-10-20 17:32" },
  { user: "Priya Nair", id: "APP-003", device: "iPhone 13", status: "Inactive", lastLogin: "2024-09-15 11:05" },
  { user: "Omar Hassan", id: "APP-004", device: "OnePlus 11", status: "Blocked", lastLogin: "2024-08-30 08:44" },
];

const userAccounts = [
  { no: "USR-001", role: "Super Admin", username: "admin.system", email: "admin@dhcc.ae", created: "2024-01-01", menu: "Full Access", status: "Active" },
  { no: "USR-002", role: "Admin Staff", username: "sarah.johnson", email: "sarah.j@dhcc.ae", created: "2024-03-15", menu: "Applicants, Courses", status: "Active" },
  { no: "USR-003", role: "Exam Manager", username: "exam.manager", email: "exams@dhcc.ae", created: "2024-04-20", menu: "Exams, Questions", status: "Active" },
  { no: "USR-004", role: "Finance", username: "finance.ops", email: "finance@dhcc.ae", created: "2024-05-10", menu: "Invoices, Reports", status: "Inactive" },
];

const screenshots = [
  { user: "Zara Ahmed", timestamp: "2024-10-21 09:42:15", id: 1 },
  { user: "Khalid Al-Rashid", timestamp: "2024-10-20 14:18:33", id: 2 },
  { user: "Priya Nair", timestamp: "2024-10-20 11:05:47", id: 3 },
  { user: "Sofia Martinez", timestamp: "2024-10-19 16:33:22", id: 4 },
  { user: "Ahmed Al-Farsi", timestamp: "2024-10-18 10:12:08", id: 5 },
  { user: "Lin Wei", timestamp: "2024-10-17 15:45:55", id: 6 },
];

const backups = [
  { file: "backup_2024_10_21_0300.sql.gz", created: "2024-10-21 03:00", size: "142 MB" },
  { file: "backup_2024_10_20_0300.sql.gz", created: "2024-10-20 03:00", size: "139 MB" },
  { file: "backup_2024_10_19_0300.sql.gz", created: "2024-10-19 03:00", size: "137 MB" },
  { file: "backup_2024_10_18_0300.sql.gz", created: "2024-10-18 03:00", size: "135 MB" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Passed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border border-amber-200",
    Partial: "bg-blue-50 text-blue-700 border border-blue-200",
    Uploaded: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    Review: "bg-blue-50 text-blue-700 border border-blue-200",
    Expired: "bg-red-50 text-red-700 border border-red-200",
    Failed: "bg-red-50 text-red-700 border border-red-200",
    Unpaid: "bg-red-50 text-red-700 border border-red-200",
    Blocked: "bg-red-50 text-red-700 border border-red-200",
    Inactive: "bg-gray-100 text-gray-600 border border-gray-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function Avatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-14 h-14 text-lg" };
  return (
    <div className={`${sizes[size]} rounded-full bg-teal-100 text-teal-700 font-semibold flex items-center justify-center flex-shrink-0`}>
      {initials}
    </div>
  );
}

function Btn({ children, variant = "primary", onClick, className = "", icon }: {
  children?: React.ReactNode; variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  onClick?: () => void; className?: string; icon?: React.ReactNode;
}) {
  const styles = {
    primary: "bg-[#0E7C7B] text-white hover:bg-[#0a6665] shadow-sm",
    secondary: "bg-[#F4A425] text-[#1A202C] hover:bg-[#e09520] shadow-sm",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    ghost: "bg-transparent text-[#718096] hover:bg-gray-100",
    outline: "border border-[#0E7C7B] text-[#0E7C7B] hover:bg-[#E6F4F4] bg-white",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${styles[variant]} ${className}`}
    >
      {icon}{children}
    </button>
  );
}

function Input({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
      />
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">{label}</label>
      <select className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition appearance-none">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] border border-[rgba(0,0,0,0.06)] ${className}`}>
      {children}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(0,0,0,0.08)]">
          <h3 className="text-base font-semibold text-[#1A202C]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────
const navGroups = [
  {
    label: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", screen: "dashboard" as Screen }]
  },
  {
    label: "Applicants",
    items: [
      { icon: Users, label: "Applicants", screen: "applicants" as Screen },
      { icon: FileText, label: "Registration", screen: "registration" as Screen },
      { icon: DollarSign, label: "Invoices", screen: "invoice" as Screen },
    ]
  },
  {
    label: "Courses & Exams",
    items: [
      { icon: BookOpen, label: "Courses", screen: "courses" as Screen },
      { icon: ClipboardList, label: "Question Bank", screen: "question-bank" as Screen },
      { icon: BookMarked, label: "Create Test", screen: "create-test" as Screen },
    ]
  },
  {
    label: "Users & Access",
    items: [
      { icon: Smartphone, label: "Mobile Users", screen: "mobile-users" as Screen },
      { icon: Shield, label: "Roles & Permissions", screen: "roles" as Screen },
      { icon: User, label: "User Accounts", screen: "user-accounts" as Screen },
    ]
  },
  {
    label: "Reports & System",
    items: [
      { icon: Award, label: "Certificates", screen: "certificates" as Screen },
      { icon: Camera, label: "Screenshots", screen: "screenshots" as Screen },
      { icon: Database, label: "Backup DB", screen: "backup" as Screen },
      { icon: Lock, label: "Change Password", screen: "change-password" as Screen },
      { icon: Settings, label: "Settings", screen: "settings" as Screen },
    ]
  }
];

// ─── Screens ─────────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen flex font-['Inter',sans-serif]">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#0E7C7B] via-[#0a6665] to-[#065655] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-64 h-64 rounded-full border border-white/30" />
          <div className="absolute top-40 right-20 w-48 h-48 rounded-full border border-white/20" />
          <div className="absolute bottom-32 left-10 w-80 h-80 rounded-full border border-white/15" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Activity size={22} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">HealthEdu Pro</span>
          </div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            DHA & DHCC<br />License Management
          </h1>
          <p className="text-teal-100 text-base leading-relaxed max-w-sm">
            Streamlining healthcare education licensing, MCQ examinations, and professional credential verification across the UAE.
          </p>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: "Applicants", value: "4,820+" },
            { label: "Courses", value: "38" },
            { label: "Issued Certs", value: "3,200+" },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-4">
              <div className="text-white text-2xl font-bold">{s.value}</div>
              <div className="text-teal-200 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 bg-[#F7FAFC] flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Activity size={24} className="text-[#0E7C7B]" />
            <span className="font-bold text-lg text-[#1A202C]">HealthEdu Pro</span>
          </div>
          <h2 className="text-2xl font-semibold text-[#1A202C] mb-1">Welcome back</h2>
          <p className="text-[#718096] text-sm mb-8">Sign in to your admin account</p>

          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="admin@dhcc.ae"
                    defaultValue="admin@dhcc.ae"
                    className="h-10 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    defaultValue="password"
                    className="h-10 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#718096] cursor-pointer">
                  <input type="checkbox" className="rounded" />Remember me
                </label>
                <a href="#" className="text-[#0E7C7B] hover:underline">Forgot password?</a>
              </div>
              <button
                onClick={onLogin}
                className="h-11 w-full rounded-lg bg-[#0E7C7B] text-white font-semibold text-sm hover:bg-[#0a6665] transition-all shadow-sm mt-1"
              >
                Sign In
              </button>
            </div>
          </Card>
          <p className="text-center text-[#718096] text-xs mt-6">
            © 2024 HealthEdu Pro · Dubai Healthcare City Authority
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const stats = [
    { label: "Total Students", value: "4,820", trend: "+12.4%", up: true, icon: Users, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Active Courses", value: "38", trend: "+3 this month", up: true, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Paid", value: "AED 1.24M", trend: "+8.7%", up: true, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Pending Review", value: "142", trend: "−18 this week", up: false, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1A202C]">Dashboard</h1>
          <p className="text-sm text-[#718096] mt-0.5">Tuesday, 21 October 2024</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<Filter size={14} />}>Filter</Btn>
          <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setScreen("registration")}>Add Applicant</Btn>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#718096] font-medium mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-[#1A202C] leading-none">{s.value}</p>
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${s.up ? "text-emerald-600" : "text-amber-600"}`}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {s.trend}
                </div>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon size={18} className={s.color} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1A202C]">Monthly Registrations</h3>
              <p className="text-xs text-[#718096]">Jan–Aug 2024</p>
            </div>
            <BarChart2 size={16} className="text-[#718096]" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={monthlyData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#718096" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#718096" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #EDF2F7" }} />
              <Bar dataKey="registrations" fill="#0E7C7B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#1A202C]">Revenue Trend</h3>
              <p className="text-xs text-[#718096]">AED — Jan–Aug 2024</p>
            </div>
            <Activity size={16} className="text-[#718096]" />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDF2F7" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#718096" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#718096" }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #EDF2F7" }} formatter={(v: number) => [`AED ${v.toLocaleString()}`, "Revenue"]} />
              <Line type="monotone" dataKey="revenue" stroke="#F4A425" strokeWidth={2.5} dot={{ fill: "#F4A425", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent applicants */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-[#1A202C]">Recent Applicants</h3>
          <button onClick={() => setScreen("applicants")} className="text-xs text-[#0E7C7B] font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.05)] bg-[#F7FAFC]">
                {["Reg. No", "Applicant", "Course", "Country", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-2.5 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applicants.slice(0, 5).map((a, i) => (
                <tr key={a.id} className={`border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors ${i % 2 === 0 ? "" : ""}`}>
                  <td className="px-5 py-3 font-mono text-xs text-[#718096]">{a.id}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={a.avatar} />
                      <span className="font-medium text-[#1A202C]">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[#718096]">{a.course}</td>
                  <td className="px-5 py-3 text-[#718096]">{a.country}</td>
                  <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3">
                    <button onClick={() => setScreen("applicant-detail")} className="text-[#0E7C7B] hover:text-[#0a6665] transition">
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Add Applicant", desc: "Register a new applicant", icon: Plus, screen: "registration" as Screen, color: "bg-teal-500" },
          { label: "Create Exam", desc: "Generate new MCQ test", icon: ClipboardList, screen: "create-test" as Screen, color: "bg-blue-500" },
          { label: "Upload Docs", desc: "Verify applicant documents", icon: Upload, screen: "applicant-detail" as Screen, color: "bg-amber-500" },
        ].map(q => (
          <button key={q.label} onClick={() => setScreen(q.screen)}
            className="bg-white border border-[rgba(0,0,0,0.06)] rounded-xl p-4 flex items-center gap-3 text-left hover:border-[#0E7C7B] hover:shadow-md transition-all group">
            <div className={`w-9 h-9 rounded-xl ${q.color} flex items-center justify-center flex-shrink-0`}>
              <q.icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1A202C] group-hover:text-[#0E7C7B] transition">{q.label}</p>
              <p className="text-xs text-[#718096]">{q.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ApplicantsScreen({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = applicants.filter(a =>
    (statusFilter === "All" || a.status === statusFilter) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.id.includes(search))
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Applicants</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setScreen("registration")}>Add Applicant</Btn>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or reg. no…"
              className="h-9 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
            />
          </div>
          {["All", "Active", "Pending", "Expired"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3.5 h-9 rounded-lg text-sm font-medium transition ${statusFilter === s ? "bg-[#0E7C7B] text-white" : "bg-[#EDF2F7] text-[#718096] hover:bg-[#E2E8F0]"}`}>
              {s}
            </button>
          ))}
          <select className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#718096] focus:outline-none focus:border-[#0E7C7B] transition">
            <option>All Countries</option>
            <option>UAE</option><option>India</option><option>Philippines</option>
          </select>
          <select className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#718096] focus:outline-none focus:border-[#0E7C7B] transition">
            <option>All Courses</option>
            <option>MDS-101</option><option>HCM-201</option><option>NRS-301</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] sticky top-0">
                {["Reg. No", "Applicant", "Mobile", "Country", "Course", "Status", "Address", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{a.id}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={a.avatar} />
                      <span className="font-medium text-[#1A202C] whitespace-nowrap">{a.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{a.mobile}</td>
                  <td className="px-4 py-3 text-[#718096]">{a.country}</td>
                  <td className="px-4 py-3 text-[#718096] max-w-36 truncate">{a.course}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{a.address}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setScreen("applicant-detail")} className="p-1.5 rounded-lg text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 transition"><Eye size={14} /></button>
                      <button className="p-1.5 rounded-lg text-[#718096] hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={14} /></button>
                      <button className="p-1.5 rounded-lg text-[#718096] hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No applicants found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">Showing {filtered.length} of {applicants.length} applicants</span>
          <div className="flex gap-1">
            {[1, 2, 3, "...", 12].map((p, i) => (
              <button key={i} className={`w-7 h-7 rounded-md text-xs font-medium transition ${p === 1 ? "bg-[#0E7C7B] text-white" : "text-[#718096] hover:bg-gray-100"}`}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ApplicantDetailScreen() {
  const [activeTab, setActiveTab] = useState("documents");
  const docs = [
    { name: "Degree Certificate", status: "Uploaded" },
    { name: "Matric Certificate", status: "Uploaded" },
    { name: "Passport Copy", status: "Review" },
    { name: "Personal Photo", status: "Uploaded" },
    { name: "Experience Letter", status: "Pending" },
    { name: "Medical License", status: "Pending" },
    { name: "Good Standing Letter", status: "Uploaded" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Applicant Detail</h1>

      <div className="grid grid-cols-3 gap-5">
        {/* Left profile card */}
        <Card className="p-6 flex flex-col items-center text-center gap-4">
          <Avatar initials="ZA" size="lg" />
          <div>
            <h2 className="text-base font-semibold text-[#1A202C]">Zara Ahmed</h2>
            <p className="font-mono text-xs text-[#718096] mt-0.5">MDS-2024-0123</p>
          </div>
          <StatusBadge status="Active" />
          <div className="w-full border-t border-[rgba(0,0,0,0.06)] pt-4 flex flex-col gap-3 text-sm text-left">
            {[
              { icon: Phone, value: "+971 50 234 5678" },
              { icon: Mail, value: "zara.ahmed@email.com" },
              { icon: MapPin, value: "Dubai, UAE" },
              { icon: Hash, value: "UAE · MDS-101" },
              { icon: Calendar, value: "Registered: 01 Oct 2024" },
            ].map(({ icon: Icon, value }) => (
              <div key={value} className="flex items-center gap-2.5 text-[#718096]">
                <Icon size={13} className="text-[#0E7C7B] flex-shrink-0" />
                <span className="text-xs">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            <Btn variant="outline" className="flex-1 justify-center text-xs">Edit</Btn>
            <Btn variant="danger" className="flex-1 justify-center text-xs">Block</Btn>
          </div>
        </Card>

        {/* Right tabs */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex border-b border-[rgba(0,0,0,0.06)]">
              {["documents", "courses", "ledger", "invoices"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${activeTab === tab ? "border-[#0E7C7B] text-[#0E7C7B]" : "border-transparent text-[#718096] hover:text-[#1A202C]"}`}>
                  {tab === "courses" ? "Courses & Exams" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === "documents" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[#718096]">Document verification checklist</p>
                    <Btn variant="outline" icon={<Upload size={13} />} className="text-xs">Upload</Btn>
                  </div>
                  {docs.map(d => (
                    <div key={d.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#F7FAFC] transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${d.status === "Uploaded" ? "bg-emerald-50" : d.status === "Review" ? "bg-blue-50" : "bg-amber-50"}`}>
                          {d.status === "Uploaded" ? <CheckCircle size={14} className="text-emerald-600" /> :
                           d.status === "Review" ? <Eye size={14} className="text-blue-600" /> :
                           <Clock size={14} className="text-amber-600" />}
                        </div>
                        <span className="text-sm text-[#1A202C]">{d.name}</span>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "courses" && (
                <div className="flex flex-col gap-3">
                  {[
                    { course: "MDS-101 Medical Dental Science", enrolled: "2024-10-01", exam: "2024-10-15", score: "87.5%", status: "Passed" },
                    { course: "HCM-201 Healthcare Management", enrolled: "2024-10-01", exam: "Pending", score: "—", status: "Pending" },
                  ].map(c => (
                    <div key={c.course} className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] hover:border-[#0E7C7B]/30 transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#1A202C]">{c.course}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="flex gap-6 text-xs text-[#718096]">
                        <span>Enrolled: {c.enrolled}</span>
                        <span>Exam: {c.exam}</span>
                        <span className="font-semibold text-[#1A202C]">Score: {c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "ledger" && (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[rgba(0,0,0,0.06)]">
                    {["Date", "Description", "Debit (AED)", "Credit (AED)", "Balance"].map(h => (
                      <th key={h} className="text-left pb-2 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {[
                      { date: "01 Oct", desc: "Registration Fee", debit: "1,500", credit: "—", bal: "1,500" },
                      { date: "05 Oct", desc: "Payment Received", debit: "—", credit: "1,500", bal: "0" },
                      { date: "10 Oct", desc: "Exam Fee MDS-101", debit: "800", credit: "—", bal: "800" },
                    ].map(r => (
                      <tr key={r.date} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC]">
                        <td className="py-2.5 text-[#718096]">{r.date}</td>
                        <td className="py-2.5 text-[#1A202C]">{r.desc}</td>
                        <td className="py-2.5 text-red-600 font-mono text-xs text-right">{r.debit}</td>
                        <td className="py-2.5 text-emerald-600 font-mono text-xs text-right">{r.credit}</td>
                        <td className="py-2.5 font-mono text-xs text-right text-[#1A202C] font-medium">{r.bal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === "invoices" && (
                <div className="flex flex-col gap-2">
                  {invoices.map(inv => (
                    <div key={inv.no} className="flex items-center justify-between p-3 rounded-xl border border-[rgba(0,0,0,0.07)] hover:border-[#0E7C7B]/30 transition">
                      <div>
                        <p className="text-sm font-medium text-[#1A202C]">{inv.no}</p>
                        <p className="text-xs text-[#718096]">{inv.service} · {inv.date}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1A202C]">AED {inv.amount}</p>
                          <p className="text-xs text-[#718096]">Bal: {inv.balance}</p>
                        </div>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RegistrationScreen() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Student Registration</h1>
      <Card className="p-6">
        <h3 className="text-base font-semibold text-[#1A202C] mb-5">Applicant Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="e.g. Zara Ahmed" />
          <Input label="Mobile Number" type="tel" placeholder="+971 50 000 0000" />
          <Input label="Other Mobile" type="tel" placeholder="+971 55 000 0000" />
          <Input label="Email Address" type="email" placeholder="applicant@email.com" />
          <div className="col-span-2"><Input label="Address" placeholder="Full address" /></div>
          <Select label="Country" options={["Select Country", "UAE", "India", "Philippines", "Pakistan", "Egypt", "Oman", "Saudi Arabia"]} />
          <Select label="Course" options={["Select Course", "MDS-101 Medical Dental Science", "HCM-201 Healthcare Management", "NRS-301 Nursing Administration"]} />
          <Input label="Registration Date" type="date" />
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Applicant Photo</label>
            <div className="h-10 border-2 border-dashed border-[rgba(0,0,0,0.15)] rounded-lg flex items-center gap-2 px-3 text-[#718096] text-sm cursor-pointer hover:border-[#0E7C7B] hover:text-[#0E7C7B] transition">
              <Upload size={14} /><span>Click to upload photo</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-[rgba(0,0,0,0.06)]">
          <Btn variant="ghost">Cancel</Btn>
          <Btn variant="primary">Register Applicant</Btn>
        </div>
      </Card>
    </div>
  );
}

function InvoiceScreen() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Invoices — Zara Ahmed</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Create Invoice</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Invoice No", "Date", "Service", "Amount", "Paid", "Balance", "Currency", "Status", "Action"].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide ${["Amount", "Paid", "Balance"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.no} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{inv.no}</td>
                  <td className="px-4 py-3 text-[#718096]">{inv.date}</td>
                  <td className="px-4 py-3 text-[#1A202C]">{inv.service}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-[#1A202C]">{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-emerald-600">{inv.paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-red-600">{inv.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#718096]">{inv.currency}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 rounded-lg transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex gap-6 text-xs">
            <span className="text-[#718096]">Total Invoiced: <strong className="text-[#1A202C]">AED 2,900</strong></span>
            <span className="text-[#718096]">Total Paid: <strong className="text-emerald-600">AED 1,975</strong></span>
            <span className="text-[#718096]">Outstanding: <strong className="text-red-600">AED 925</strong></span>
          </div>
        </div>
      </Card>
      {showModal && (
        <Modal title="Create Invoice" onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Service Description" placeholder="e.g. Exam Fee - MDS-101" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount (AED)" type="number" placeholder="0.00" />
              <Select label="Currency" options={["AED", "USD", "GBP"]} />
            </div>
            <Input label="Invoice Date" type="date" />
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => setShowModal(false)}>Create Invoice</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CoursesScreen() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Courses</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Add Course</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Course Code", "Course Name", "Attachments", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.code} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#0E7C7B] font-medium">{c.code}</td>
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{c.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {c.attachments.map(a => (
                        <span key={a} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium
                          ${a === "PDF" ? "bg-red-50 text-red-600" : a === "Video" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                          {a === "PDF" ? <File size={10} /> : a === "Video" ? <Video size={10} /> : <Mic size={10} />}
                          {a}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 rounded-lg transition"><Edit2 size={14} /></button>
                      <button className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showModal && (
        <Modal title="Add New Course" onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Course Code" placeholder="e.g. PHY-401" />
            <Input label="Course Name" placeholder="Full course name" />
            <div className="border-2 border-dashed border-[rgba(0,0,0,0.12)] rounded-xl p-8 text-center">
              <Upload size={24} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-[#718096]">Drag & drop files or <span className="text-[#0E7C7B] font-medium cursor-pointer">browse</span></p>
              <p className="text-xs text-gray-400 mt-1">PDF, MP4, MP3 up to 500MB</p>
            </div>
            <Select label="Status" options={["Active", "Inactive"]} />
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary">Create Course</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function QuestionBankScreen() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">MCQ Question Bank</h1>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<FileSpreadsheet size={14} />}>Import Excel</Btn>
          <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Add Question</Btn>
        </div>
      </div>
      <Card className="p-4">
        <div className="flex gap-3">
          <select className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#718096] focus:outline-none focus:border-[#0E7C7B] transition flex-1">
            <option>All Courses</option><option>MDS-101</option><option>HCM-201</option><option>NRS-301</option>
          </select>
          <select className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#718096] focus:outline-none focus:border-[#0E7C7B] transition flex-1">
            <option>All Exercises</option><option>Module 1</option><option>Module 3</option><option>Module 5</option>
          </select>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#718096] bg-[#EDF2F7] px-2 py-0.5 rounded-md">Q{qi + 1}</span>
                <span className="text-xs text-[#0E7C7B] font-medium">{q.course}</span>
                <span className="text-xs text-[#718096]">· {q.exercise}</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={13} /></button>
                <button className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-sm font-medium text-[#1A202C] mb-3 leading-relaxed">{q.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border transition ${oi === q.correct ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.07)] bg-[#F7FAFC]"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${oi === q.correct ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className={oi === q.correct ? "text-emerald-800" : "text-[#718096]"}>{opt}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title="Add MCQ Question" onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-3">
            <Select label="Course" options={["MDS-101", "HCM-201", "NRS-301"]} />
            <Select label="Exercise / Module" options={["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]} />
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Question</label>
              <textarea rows={3} className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]" placeholder="Enter question text…" />
            </div>
            {["Option A", "Option B", "Option C", "Option D"].map(o => <Input key={o} label={o} placeholder={`Enter ${o}`} />)}
            <Select label="Correct Answer" options={["Option A", "Option B", "Option C", "Option D"]} />
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary">Save Question</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function CreateTestScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Create Test</h1>
        <Btn variant="primary" icon={<Plus size={14} />}>Generate Test</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Applicant", "Course", "Test Date", "Questions", "Result %", "Status", "Actions"].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide ${["Result %", "Questions"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {testRecords.map(t => (
                <tr key={t.applicant} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{t.applicant}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{t.course}</td>
                  <td className="px-4 py-3 text-[#718096]">{t.date}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs">{t.questions}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium">
                    {t.result !== null ? (
                      <span className={t.result >= 70 ? "text-emerald-600" : "text-red-600"}>{t.result}%</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 rounded-lg transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function MobileUsersScreen() {
  const [showAddModal, setShowAddModal] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Mobile Users</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowAddModal(true)}>Add User</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["User", "App ID", "Device", "Status", "Last Login", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mobileUsers.map(u => (
                <tr key={u.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={u.user.split(" ").map(n => n[0]).join("")} />
                      <span className="font-medium text-[#1A202C]">{u.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{u.id}</td>
                  <td className="px-4 py-3 text-[#718096]">{u.device}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3 text-[#718096] text-xs font-mono">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Change Password"><Lock size={14} /></button>
                      <button className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {showAddModal && (
        <Modal title="Add Mobile User" onClose={() => setShowAddModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Full Name" placeholder="User full name" />
            <Input label="Email / Username" placeholder="user@email.com" />
            <Input label="Password" type="password" placeholder="••••••••" />
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Btn>
              <Btn variant="primary">Add User</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function RolesScreen() {
  const roles = ["Super Admin", "Admin Staff", "Exam Manager", "Finance", "Viewer"];
  const pages = ["Dashboard", "Applicants", "Courses", "Exams", "Invoices", "Users", "Reports", "Settings"];
  const matrix: Record<string, Record<string, boolean>> = {
    "Super Admin": Object.fromEntries(pages.map(p => [p, true])),
    "Admin Staff": Object.fromEntries(pages.map(p => [p, !["Users", "Settings"].includes(p)])),
    "Exam Manager": Object.fromEntries(pages.map(p => [p, ["Dashboard", "Courses", "Exams"].includes(p)])),
    "Finance": Object.fromEntries(pages.map(p => [p, ["Dashboard", "Invoices", "Reports"].includes(p)])),
    "Viewer": Object.fromEntries(pages.map(p => [p, ["Dashboard"].includes(p)])),
  };
  const [perms, setPerms] = useState(matrix);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Roles & Permissions</h1>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                <th className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">Page / Module</th>
                {roles.map(r => (
                  <th key={r} className="px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map(page => (
                <tr key={page} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{page}</td>
                  {roles.map(role => (
                    <td key={role} className="px-4 py-3 text-center">
                      <button
                        onClick={() => setPerms(prev => ({ ...prev, [role]: { ...prev[role], [page]: !prev[role][page] } }))}
                        className={`w-9 h-5 rounded-full transition-all duration-200 relative ${perms[role]?.[page] ? "bg-[#0E7C7B]" : "bg-gray-200"}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${perms[role]?.[page] ? "left-4" : "left-0.5"}`} />
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <Btn variant="primary">Save Permissions</Btn>
        </div>
      </Card>
    </div>
  );
}

function UserAccountsScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">User Accounts</h1>
        <Btn variant="primary" icon={<Plus size={14} />}>Add User</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["No", "Role", "Username", "Email", "Created On", "Menu Access", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {userAccounts.map(u => (
                <tr key={u.no} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{u.no}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-[#0E7C7B] bg-teal-50 px-2 py-0.5 rounded-md">{u.role}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{u.username}</td>
                  <td className="px-4 py-3 text-[#718096]">{u.email}</td>
                  <td className="px-4 py-3 text-[#718096] text-xs">{u.created}</td>
                  <td className="px-4 py-3 text-[#718096] text-xs max-w-32 truncate">{u.menu}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={14} /></button>
                      <button className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CertificatesScreen() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Certificates</h1>
      <div className="grid grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-[#1A202C] mb-5">Export Certificate</h3>
          <div className="flex flex-col gap-4">
            <Input label="Applicant Name" placeholder="Search applicant…" />
            <Input label="Certificate Serial" placeholder="e.g. CERT-2024-0001" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="From Date" type="date" />
              <Input label="To Date" type="date" />
            </div>
            <Select label="Course" options={["All Courses", "MDS-101", "HCM-201", "NRS-301"]} />
            <Btn variant="primary" icon={<Download size={14} />} className="w-full justify-center">Export Certificates</Btn>
          </div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-xs border-2 border-[#0E7C7B] rounded-2xl p-6 text-center bg-gradient-to-br from-teal-50 to-white">
            <div className="w-12 h-12 bg-[#0E7C7B] rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-white" />
            </div>
            <div className="text-[10px] font-semibold text-[#718096] uppercase tracking-widest mb-1">Certificate of Completion</div>
            <div className="text-sm font-semibold text-[#1A202C] mb-0.5">This certifies that</div>
            <div className="text-base font-bold text-[#0E7C7B] mb-1">Zara Ahmed</div>
            <div className="text-xs text-[#718096] mb-2">has successfully completed</div>
            <div className="text-sm font-semibold text-[#1A202C] mb-2">Medical Dental Science</div>
            <div className="text-[10px] text-[#718096]">Serial: CERT-2024-0089 · Oct 21, 2024</div>
          </div>
          <p className="text-xs text-[#718096]">Certificate preview</p>
        </Card>
      </div>
    </div>
  );
}

function ScreenshotsScreen() {
  const [lightbox, setLightbox] = useState<number | null>(null);
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">User Screenshots</h1>
      <div className="grid grid-cols-3 gap-4">
        {screenshots.map(s => (
          <Card key={s.id} className="overflow-hidden cursor-pointer group" onClick={() => setLightbox(s.id)}>
            <div className="bg-gradient-to-br from-teal-100 to-teal-50 h-36 flex items-center justify-center relative">
              <Camera size={28} className="text-teal-300 group-hover:text-teal-500 transition" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-[#1A202C]">{s.user}</p>
              <p className="text-xs text-[#718096] font-mono mt-0.5">{s.timestamp}</p>
            </div>
          </Card>
        ))}
      </div>
      {lightbox !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8" onClick={() => setLightbox(null)}>
          <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-teal-100 to-teal-50 h-64 flex items-center justify-center">
              <Camera size={48} className="text-teal-300" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-[#1A202C]">{screenshots.find(s => s.id === lightbox)?.user}</p>
                <p className="text-xs text-[#718096] font-mono">{screenshots.find(s => s.id === lightbox)?.timestamp}</p>
              </div>
              <button onClick={() => setLightbox(null)} className="p-2 text-gray-400 hover:text-gray-600 transition"><X size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackupScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Database Backup</h1>
        <Btn variant="primary" icon={<RefreshCw size={14} />}>New Backup</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Backup File", "Created Date", "Size", "Download"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.file} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-[#0E7C7B]" />
                      <span className="font-mono text-xs text-[#1A202C]">{b.file}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#718096]">{b.created}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{b.size}</td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1.5 text-[#0E7C7B] hover:text-[#0a6665] text-xs font-medium transition">
                      <Download size={13} />Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ChangePasswordScreen() {
  const [pwd, setPwd] = useState("");
  const strength = pwd.length === 0 ? 0 : pwd.length < 6 ? 1 : pwd.length < 10 ? 2 : pwd.length < 14 ? 3 : 4;
  const colors = ["bg-gray-200", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return (
    <div className="flex flex-col gap-5 items-center">
      <h1 className="text-xl font-semibold text-[#1A202C] self-start">Change Password</h1>
      <Card className="p-8 w-full max-w-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Current Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="h-10 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">New Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} className="h-10 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]" placeholder="Min. 8 characters" />
            </div>
            {pwd.length > 0 && (
              <div className="mt-1.5">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? colors[strength] : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className="text-xs text-[#718096]">Strength: <span className="font-medium">{labels[strength]}</span></p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Confirm Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="password" className="h-10 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]" />
            </div>
          </div>
          <Btn variant="primary" className="w-full justify-center mt-2">Update Password</Btn>
        </div>
      </Card>
    </div>
  );
}

function SettingsScreen() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Settings & Privacy</h1>
      <Card className="p-6">
        <h3 className="text-base font-semibold text-[#1A202C] mb-5">General Settings</h3>
        <div className="flex flex-col gap-5">
          {[
            { label: "System Name", value: "HealthEdu Pro - DHCC Admin" },
            { label: "Organization", value: "Dubai Healthcare City Authority" },
            { label: "Contact Email", value: "admin@dhcc.ae" },
            { label: "Timezone", value: "Asia/Dubai (UTC+4)" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-3 border-b border-[rgba(0,0,0,0.05)]">
              <div>
                <p className="text-sm font-medium text-[#1A202C]">{s.label}</p>
                <p className="text-xs text-[#718096] mt-0.5">{s.value}</p>
              </div>
              <Btn variant="outline" className="text-xs">Edit</Btn>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-base font-semibold text-[#1A202C] mb-4">Privacy & Data</h3>
        {[
          { label: "Auto-backup enabled", enabled: true },
          { label: "User activity logging", enabled: true },
          { label: "Session screenshots", enabled: false },
          { label: "Email notifications", enabled: true },
        ].map(s => (
          <div key={s.label} className="flex items-center justify-between py-3 border-b border-[rgba(0,0,0,0.05)]">
            <span className="text-sm text-[#1A202C]">{s.label}</span>
            <div className={`w-9 h-5 rounded-full relative cursor-pointer transition-all ${s.enabled ? "bg-[#0E7C7B]" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${s.enabled ? "left-4" : "left-0.5"}`} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── Shell (Sidebar + Header) ─────────────────────────────────────────────────
function AdminShell({ screen, setScreen }: { screen: Screen; setScreen: (s: Screen) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const breadcrumb: Record<Screen, string[]> = {
    dashboard: ["Dashboard"],
    applicants: ["Applicants", "List"],
    "applicant-detail": ["Applicants", "Zara Ahmed"],
    registration: ["Applicants", "Registration"],
    invoice: ["Applicants", "Invoices"],
    courses: ["Courses & Exams", "Courses"],
    "question-bank": ["Courses & Exams", "Question Bank"],
    "create-test": ["Courses & Exams", "Create Test"],
    "mobile-users": ["Users & Access", "Mobile Users"],
    roles: ["Users & Access", "Roles & Permissions"],
    "user-accounts": ["Users & Access", "User Accounts"],
    certificates: ["Reports & System", "Certificates"],
    screenshots: ["Reports & System", "Screenshots"],
    backup: ["Reports & System", "Backup DB"],
    "change-password": ["Reports & System", "Change Password"],
    settings: ["Reports & System", "Settings"],
    login: ["Login"],
  };

  const content: Record<Screen, React.ReactNode> = {
    login: null,
    dashboard: <DashboardScreen setScreen={setScreen} />,
    applicants: <ApplicantsScreen setScreen={setScreen} />,
    "applicant-detail": <ApplicantDetailScreen />,
    registration: <RegistrationScreen />,
    invoice: <InvoiceScreen />,
    courses: <CoursesScreen />,
    "question-bank": <QuestionBankScreen />,
    "create-test": <CreateTestScreen />,
    "mobile-users": <MobileUsersScreen />,
    roles: <RolesScreen />,
    "user-accounts": <UserAccountsScreen />,
    certificates: <CertificatesScreen />,
    screenshots: <ScreenshotsScreen />,
    backup: <BackupScreen />,
    "change-password": <ChangePasswordScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex font-['Inter',sans-serif] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-56" : "w-14"} bg-white border-r border-[rgba(0,0,0,0.07)] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-4 border-b border-[rgba(0,0,0,0.07)] ${!sidebarOpen ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-[#0E7C7B] flex items-center justify-center flex-shrink-0">
            <Activity size={16} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-sm text-[#1A202C] tracking-tight">HealthEdu Pro</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          {navGroups.map(group => (
            <div key={group.label} className="mb-1">
              {sidebarOpen && (
                <p className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest px-2 py-1.5 mt-2">{group.label}</p>
              )}
              {group.items.map(item => {
                const active = screen === item.screen;
                return (
                  <button
                    key={item.label}
                    onClick={() => setScreen(item.screen)}
                    title={!sidebarOpen ? item.label : undefined}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all mb-0.5
                      ${active ? "bg-[#E6F4F4] text-[#0E7C7B] font-semibold" : "text-[#718096] hover:bg-[#F7FAFC] hover:text-[#1A202C]"}
                      ${!sidebarOpen ? "justify-center" : ""}`}
                  >
                    <item.icon size={16} className={`flex-shrink-0 ${active ? "text-[#0E7C7B]" : ""}`} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-[rgba(0,0,0,0.07)]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-[#718096] hover:bg-[#F7FAFC] transition"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[rgba(0,0,0,0.07)] h-14 flex items-center px-5 gap-4 flex-shrink-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-[#718096] flex-1">
            <Home size={12} />
            {breadcrumb[screen].map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={10} />}
                <span className={i === breadcrumb[screen].length - 1 ? "text-[#1A202C] font-medium" : ""}>{crumb}</span>
              </span>
            ))}
          </nav>

          {/* Global search */}
          <div className="relative w-56">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchVal} onChange={e => setSearchVal(e.target.value)}
              placeholder="Search applicants…"
              className="h-8 w-full pl-8 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-[#F7FAFC] text-xs focus:outline-none focus:border-[#0E7C7B] focus:bg-white transition"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 text-[#718096] hover:text-[#1A202C] hover:bg-gray-100 rounded-lg transition">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F4A425] rounded-full border-2 border-white" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-[rgba(0,0,0,0.08)] z-20">
                <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A202C]">Notifications</span>
                  <span className="text-xs bg-[#F4A425] text-white px-1.5 py-0.5 rounded-full">3 new</span>
                </div>
                {[
                  { msg: "Zara Ahmed submitted documents for review", time: "5 min ago", color: "bg-blue-50" },
                  { msg: "New invoice generated for MDS-2024-0126", time: "1 hr ago", color: "bg-amber-50" },
                  { msg: "Backup completed successfully", time: "3 hr ago", color: "bg-emerald-50" },
                ].map((n, i) => (
                  <div key={i} className={`px-4 py-3 border-b border-[rgba(0,0,0,0.04)] hover:bg-gray-50 cursor-pointer`}>
                    <p className="text-xs text-[#1A202C] leading-relaxed">{n.msg}</p>
                    <p className="text-[10px] text-[#718096] mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avatar dropdown */}
          <div className="flex items-center gap-2 pl-2 border-l border-[rgba(0,0,0,0.08)]">
            <Avatar initials="SA" size="sm" />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-[#1A202C] leading-none">System Admin</p>
              <p className="text-[10px] text-[#718096] mt-0.5">Super Admin</p>
            </div>
            <ChevronDown size={12} className="text-[#718096]" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {content[screen]}
        </main>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return <LoginScreen onLogin={() => { setAuthed(true); setScreen("dashboard"); }} />;
  }

  return <AdminShell screen={screen} setScreen={setScreen} />;
}
