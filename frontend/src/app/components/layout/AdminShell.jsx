import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Award,
  Settings,
  Shield,
  Smartphone,
  Database,
  Camera,
  Lock,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Home,
  User,
  DollarSign,
  BookMarked,
  Activity,
  FileUp,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import { Avatar } from "../shared/ui";
import { DashboardScreen } from "../views/dashboard/Dashboard";
import { ApplicantsScreen } from "../views/applicants/Applicants";
import { ApplicantDetailScreen } from "../views/applicants/ApplicantDetail";
import { RegistrationScreen } from "../views/registration/Registration";
import { InvoiceScreen } from "../views/applicants/Invoices";
import { CoursesScreen } from "../views/courses/Courses";
import { QuestionBankScreen } from "../views/courses/QuestionBank";
import { QuestionFormScreen } from "../views/courses/QuestionForm";
import { GenerateAIQuestionScreen } from "../views/courses/GenerateAIQuestion";
import { UploadFromPdfScreen } from "../views/courses/UploadFromPdf";
import { CreateTestScreen } from "../views/courses/CreateTest";
import { MobileUsersScreen } from "../views/users/MobileUsers";
import { RolesScreen } from "../views/users/Roles";
import { UserAccountsScreen } from "../views/users/UserAccounts";
import { ChangePasswordScreen } from "../views/users/ChangePassword";
import { CertificatesScreen } from "../views/reports/Certificates";
import { ScreenshotsScreen } from "../views/reports/Screenshots";
import { BackupScreen } from "../views/reports/Backup";
import { SettingsScreen } from "../views/settings/Settings";

const navGroups = [
  {
    label: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", screen: "dashboard" }],
  },
  {
    label: "Applicants",
    items: [
      { icon: Users, label: "Applicants", screen: "applicants" },
      { icon: FileText, label: "Registration", screen: "registration" },
      { icon: DollarSign, label: "Invoices", screen: "invoice" },
    ],
  },
  {
    label: "Courses & Exams",
    items: [
      { icon: BookOpen, label: "Courses", screen: "courses" },
    ],
  },
  {
    label: "Questions",
    items: [
      { icon: ClipboardList, label: "Question Bank", screen: "question-bank" },
      { icon: PlusCircle, label: "Add Question", screen: "question-form" },
      { icon: FileUp, label: "Upload from PDF", screen: "upload-from-pdf" },
      { icon: Sparkles, label: "Generate with AI", screen: "generate-ai-question" },
      { icon: BookMarked, label: "Create Test", screen: "create-test" },
    ],
  },
  {
    label: "Users & Access",
    items: [
      { icon: Smartphone, label: "Mobile Users", screen: "mobile-users" },
      { icon: Shield, label: "Roles & Permissions", screen: "roles" },
      { icon: User, label: "User Accounts", screen: "user-accounts" },
    ],
  },
  {
    label: "Reports & System",
    items: [
      { icon: Award, label: "Certificates", screen: "certificates" },
      { icon: Camera, label: "Screenshots", screen: "screenshots" },
      { icon: Database, label: "Backup DB", screen: "backup" },
      { icon: Lock, label: "Change Password", screen: "change-password" },
      { icon: Settings, label: "Settings", screen: "settings" },
    ],
  },
];

export function AdminShell({ screen, setScreen, user, onLogout, selectedApplicant, editingApplicant, questionForm, onSelectApplicant, onEditApplicant, onAddApplicant, onAddQuestion, onEditQuestion, onToggleApplicantActive }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const breadcrumb = {
    dashboard: ["Dashboard"],
    applicants: ["Applicants", "List"],
    "applicant-detail": ["Applicants", "Zara Ahmed"],
    registration: ["Applicants", "Registration"],
    invoice: ["Applicants", "Invoices"],
    courses: ["Courses & Exams", "Courses"],
    "question-bank": ["Questions", "Question Bank"],
    "question-form": ["Questions", questionForm?.question?.questionId ? "Edit Question" : "Add Question"],
    "generate-ai-question": ["Questions", "Generate with AI"],
    "upload-from-pdf": ["Questions", "Upload from PDF"],
    "create-test": ["Questions", "Create Test"],
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
  const content = {
    login: null,
    dashboard: <DashboardScreen setScreen={setScreen} />,
    applicants: (
      <ApplicantsScreen
        setScreen={setScreen}
        onSelectApplicant={onSelectApplicant}
        onEditApplicant={onEditApplicant}
        onAddApplicant={onAddApplicant}
      />
    ),
    "applicant-detail": (
      <ApplicantDetailScreen
        applicant={selectedApplicant}
        onBack={() => setScreen("applicants")}
        onEdit={onEditApplicant}
        onToggleActive={onToggleApplicantActive}
      />
    ),
    registration: <RegistrationScreen applicant={editingApplicant} onDone={() => setScreen("applicants")} />,
    invoice: <InvoiceScreen />,
    courses: <CoursesScreen />,
    "question-bank": <QuestionBankScreen setScreen={setScreen} onEdit={onEditQuestion} />,
    "question-form": <QuestionFormScreen question={questionForm?.question ?? null} onBack={() => setScreen("question-bank")} />,
    "generate-ai-question": <GenerateAIQuestionScreen onBack={() => setScreen("question-bank")} />,
    "upload-from-pdf": <UploadFromPdfScreen onBack={() => setScreen("question-bank")} />,
    "create-test": <CreateTestScreen user={user} />,
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
              {sidebarOpen && <p className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-widest px-2 py-1.5 mt-2">{group.label}</p>}
              {group.items.map(item => {
                const active = screen === item.screen;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      if (item.screen === "registration") return onAddApplicant();
                      if (item.screen === "question-form") return onAddQuestion();
                      setScreen(item.screen);
                    }}
                    title={!sidebarOpen ? item.label : void 0}
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
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
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

          {/* User + logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-[rgba(0,0,0,0.08)]">
            <Avatar initials={(user?.userName?.[0] ?? "S").toUpperCase()} size="sm" />
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-[#1A202C] leading-none">{user?.userName ?? "System Admin"}</p>
              <p className="text-[10px] text-[#718096] mt-0.5">{user?.roleName ?? "Super Admin"}</p>
            </div>
            <button onClick={onLogout} title="Sign out" className="p-2 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition">
              <LogOut size={15} />
            </button>
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
