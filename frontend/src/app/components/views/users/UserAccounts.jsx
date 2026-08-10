import { Plus, Edit2, Trash2 } from "lucide-react";
import { Btn, Card, StatusBadge } from "../../shared/ui";
import { userAccounts } from "../../../data/mockData";

export function UserAccountsScreen() {
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
