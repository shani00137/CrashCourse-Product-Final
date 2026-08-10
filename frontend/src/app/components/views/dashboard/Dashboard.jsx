import {
  Users, BookOpen, DollarSign, Clock, TrendingUp, TrendingDown,
  Filter, Plus, BarChart2, Activity, ArrowRight, Eye, Upload, ClipboardList,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Btn, Avatar, Card, StatusBadge } from "../../shared/ui";
import { applicants, monthlyData } from "../../../data/mockData";

export function DashboardScreen({ setScreen }) {
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
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #EDF2F7" }} formatter={v => [`AED ${v.toLocaleString()}`, "Revenue"]} />
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
              {applicants.slice(0, 5).map(a => (
                <tr key={a.id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
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
          { label: "Add Applicant", desc: "Register a new applicant", icon: Plus, screen: "registration", color: "bg-teal-500" },
          { label: "Create Exam", desc: "Generate new MCQ test", icon: ClipboardList, screen: "create-test", color: "bg-blue-500" },
          { label: "Upload Docs", desc: "Verify applicant documents", icon: Upload, screen: "applicant-detail", color: "bg-amber-500" },
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
