import { Btn, Card } from "../../shared/ui";

export function SettingsScreen() {
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
