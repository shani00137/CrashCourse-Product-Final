import { useState } from "react";
import { Activity, AlertCircle, Lock, User } from "lucide-react";
import * as auth from "../../../../services/authService";
import { Card } from "../../shared/ui";

export function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("admin@dhcc.ae");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const user = await auth.login(username.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="admin@dhcc.ae"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
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
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-10 w-full pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#718096] cursor-pointer">
                  <input type="checkbox" className="rounded" />Remember me
                </label>
                <a href="#" className="text-[#0E7C7B] hover:underline">Forgot password?</a>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0E7C7B] text-white font-semibold text-sm hover:bg-[#0a6665] transition-all shadow-sm mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </Card>
          <p className="text-center text-[#718096] text-xs mt-6">
            © 2024 HealthEdu Pro · Dubai Healthcare City Authority
          </p>
        </div>
      </div>
    </div>
  );
}
