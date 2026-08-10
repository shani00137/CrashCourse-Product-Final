import { useState } from "react";
import { Plus, Lock, Trash2 } from "lucide-react";
import { Avatar, Btn, Card, Input, Modal, StatusBadge } from "../../shared/ui";
import { mobileUsers } from "../../../data/mockData";

export function MobileUsersScreen() {
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
