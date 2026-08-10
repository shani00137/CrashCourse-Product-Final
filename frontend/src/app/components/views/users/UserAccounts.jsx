import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Btn, BouncingDots, Card, Input, Modal, SearchableSelect, StatusBadge } from "../../shared/ui";
import { getAdminUsers, getRoles, saveUser } from "../../../../services/userService";

export function UserAccountsScreen() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData] = await Promise.all([getAdminUsers(), getRoles()]);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !roleId) {
      setFormError("Please fill in all fields and select a role.");
      return;
    }
    setSaving(true);
    setFormError("");
    setMessage("");
    try {
      const msg = await saveUser({ userName: name.trim(), email: email.trim(), roleId });
      setMessage(msg);
      setName("");
      setEmail("");
      setRoleId(null);
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const roleOptions = roles.map(r => ({ id: r.roleId, label: r.roleName }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">User Accounts</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={() => { setShowAddModal(true); setMessage(""); setFormError(""); }}>Add User</Btn>
      </div>
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</div>}
      <Card>
        {loading ? (
          <BouncingDots label="Loading users\u2026" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                  {["No", "Role", "Username", "Email", "Created On", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-[#718096]">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u.userNo} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#718096]">{u.userNo}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-[#0E7C7B] bg-teal-50 px-2 py-0.5 rounded-md">{u.roleName}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1A202C]">{u.userName}</td>
                    <td className="px-4 py-3 text-[#718096]">{u.email}</td>
                    <td className="px-4 py-3 text-[#718096] text-xs">{u.createdDate ? new Date(u.createdDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={u.status ? "Active" : "Inactive"} /></td>
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
        )}
      </Card>
      {showAddModal && (
        <Modal title="Add User Account" onClose={() => setShowAddModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Username" placeholder="Enter username" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Email" type="email" placeholder="user@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Role</label>
              <SearchableSelect
                options={roleOptions}
                value={roleId}
                onSelect={setRoleId}
                allLabel="Select a role"
                placeholder="Search roles\u2026"
              />
            </div>
            {message && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">{message}</div>}
            {formError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{formError}</div>}
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving\u2026" : "Add User"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
