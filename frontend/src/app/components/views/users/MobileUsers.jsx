import { useCallback, useEffect, useState } from "react";
import { Plus, Lock, Trash2, Search, X, ChevronLeft, ChevronRight, AlertCircle, Users } from "lucide-react";
import { Avatar, Btn, BouncingDots, Card, Input, Modal, SearchableSelect, StatusBadge } from "../../shared/ui";
import { getAppUsers, saveAppUser } from "../../../../services/appUserService";
import { getActiveApplicants } from "../../../../services/applicantService";

export function MobileUsersScreen() {
  const pageSize = 20;
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [applicantId, setApplicantId] = useState(null);
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAppUsers({ pageNumber: page, pageSize, searchTerm: debouncedSearch })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data ?? []);
        setTotalRecords(res.totalRecords ?? 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load mobile users.");
        setRows([]);
        setTotalRecords(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch]);

  useEffect(() => load(), [load]);

  async function openAddModal() {
    setShowAddModal(true);
    setMessage("");
    setFormError("");
    setApplicantId(null);
    setUserName("");
    setPassword("");
    if (applicants.length === 0) {
      try {
        const data = await getActiveApplicants();
        setApplicants(Array.isArray(data) ? data : []);
      } catch {
        // applicant list unavailable; the picker stays empty
      }
    }
  }

  async function handleSubmit() {
    if (!applicantId || !userName.trim() || !password.trim()) {
      setFormError("Please select an applicant, enter a username and a password.");
      return;
    }
    setSaving(true);
    setFormError("");
    setMessage("");
    try {
      const msg = await saveAppUser({ applicantId, userName: userName.trim(), password: password.trim() });
      setMessage(msg);
      setApplicantId(null);
      setUserName("");
      setPassword("");
      load();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));
  const initials = (u) => (((u.firstName?.[0] ?? "") + (u.lastName?.[0] ?? "")).toUpperCase()) || (u.userName?.[0] ?? "").toUpperCase() || "NA";
  const displayName = (u) => (u.firstName || u.lastName) ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : (u.userName ?? "—");
  const applicantOptions = applicants.map((a) => ({
    id: a.applicantId,
    label: `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() + (a.registrationNo ? ` · ${a.registrationNo}` : "")
  }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Mobile Users</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={openAddModal}>Add User</Btn>
      </div>
      <Card className="p-4">
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or username…"
            className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
          />
          {search && <button
            onClick={() => setSearch("")}
            title="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={13} />
          </button>}
        </div>
      </Card>
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
              {rows.map(u => (
                <tr key={u.appUserId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={initials(u)} />
                      <span className="font-medium text-[#1A202C]">{displayName(u)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{u.appUserId}</td>
                  <td className="px-4 py-3 text-[#718096] max-w-40 truncate">{u.deviceId || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status ? "Active" : "Inactive"} /></td>
                  <td className="px-4 py-3 text-[#718096] text-xs font-mono">{u.loginOn ? new Date(u.loginOn).toLocaleString() : "—"}</td>
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
          {loading && <BouncingDots label={rows.length ? "Refreshing results…" : "Loading mobile users…"} />}
          {!loading && error && <div className="py-10 text-center">
            <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
            <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
          </div>}
          {!loading && !error && totalRecords === 0 && <div className="py-16 text-center">
            <Users size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-[#718096] font-medium">No mobile users found</p>
            <p className="text-xs text-gray-400 mt-1">{search.trim() ? "Try clearing your search" : "No mobile users registered yet"}</p>
          </div>}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {loading ? "Loading…" : totalRecords === 0 ? "No results" : `Showing ${start + 1}–${Math.min(start + pageSize, totalRecords)} of ${totalRecords} user${totalRecords === 1 ? "" : "s"}`}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} className="mx-auto" />
            </button>
            <span className="px-2 text-xs text-[#718096] whitespace-nowrap">Page {safePage} of {totalPages}</span>
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} className="mx-auto" />
            </button>
          </div>
        </div>
      </Card>
      {showAddModal && (
        <Modal title="Add Mobile User" onClose={() => setShowAddModal(false)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Applicant</label>
              <SearchableSelect
                options={applicantOptions}
                value={applicantId}
                onSelect={setApplicantId}
                allLabel="Select an applicant"
                placeholder="Search applicant…"
              />
            </div>
            <Input label="Username" placeholder="Login username" value={userName} onChange={e => setUserName(e.target.value)} />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            {message && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">{message}</div>}
            {formError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{formError}</div>}
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleSubmit} disabled={saving}>{saving ? "Saving…" : "Add User"}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
