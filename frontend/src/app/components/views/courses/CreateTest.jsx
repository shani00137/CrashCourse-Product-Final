import { Plus, Eye, Download } from "lucide-react";
import { Btn, Card, StatusBadge } from "../../shared/ui";
import { testRecords } from "../../../data/mockData";

export function CreateTestScreen() {
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
