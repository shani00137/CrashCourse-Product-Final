import { useState } from "react";
import { Lock } from "lucide-react";
import { Btn, Card } from "../../shared/ui";

export function ChangePasswordScreen() {
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
