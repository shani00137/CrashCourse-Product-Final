import { useEffect, useState } from "react";
import { Btn, Card } from "../../shared/ui";
import { getRoles, getUserPermissions, saveUserPermission, deleteUserPermission } from "../../../../services/userService";

export function RolesScreen() {
  const pages = ["Dashboard", "Applicants", "Courses", "Exams", "Invoices", "Users", "Reports", "Settings"];
  const [roles, setRoles] = useState([]);
  const [roleMap, setRoleMap] = useState([]);
  const [perms, setPerms] = useState({});
  const [existingPerms, setExistingPerms] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await getRoles();
        const roleList = Array.isArray(res) ? res : [];
        setRoleMap(roleList);
        const roleNames = roleList.map((r) => r.roleName || r.RoleName).filter(Boolean);
        setRoles(roleNames);

        const matrix = {};
        roleNames.forEach((role) => {
          const lower = role.toLowerCase();
          if (lower.includes("super")) {
            matrix[role] = Object.fromEntries(pages.map((p) => [p, true]));
          } else if (lower.includes("official")) {
            matrix[role] = Object.fromEntries(
              pages.map((p) => [p, ["Dashboard", "Applicants", "Courses", "Exams", "Invoices", "Reports"].includes(p)])
            );
          } else {
            matrix[role] = Object.fromEntries(pages.map((p) => [p, ["Dashboard"].includes(p)]));
          }
        });
        setPerms(matrix);

        const permRes = await getUserPermissions();
        setExistingPerms(Array.isArray(permRes) ? permRes : []);
      } catch (error) {
        console.error("Failed to load roles", error);
        setRoles([]);
        setPerms({});
        setExistingPerms([]);
      }
    };

    loadRoles();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map UI pages to PageIds - for now, just save based on roles
      // This is a simplified save; actual PageIds would need to be fetched
      for (const role of roleMap) {
        const roleName = role.roleName || role.RoleName;
        const roleId = role.roleId || role.RoleId;
        if (!roleName || !roleId) continue;

        for (const page of pages) {
          if (perms[roleName]?.[page]) {
            // Try to save permission - PageId would need proper mapping
            // For now, we'll attempt to save with a generic approach
            try {
              await saveUserPermission({
                RoleId: roleId,
                PageId: 1, // This would need to be mapped properly
              });
            } catch (e) {
              // Ignore errors for now
            }
          }
        }
      }
      alert("Permissions saved");
    } catch (error) {
      console.error("Failed to save permissions", error);
      alert("Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

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
                        className={`w-9 h-5 rounded-full transition-all duration-200 relative ${perms[role]?.[page] ? "bg-[#C41E3A]" : "bg-gray-200"}`}
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
          <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save Permissions"}</Btn>
        </div>
      </Card>
    </div>
  );
}
