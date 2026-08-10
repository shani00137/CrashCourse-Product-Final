import { useState } from "react";
import { Btn, Card } from "../../shared/ui";

export function RolesScreen() {
  const roles = ["Super Admin", "Admin Staff", "Exam Manager", "Finance", "Viewer"];
  const pages = ["Dashboard", "Applicants", "Courses", "Exams", "Invoices", "Users", "Reports", "Settings"];
  const matrix = {
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
