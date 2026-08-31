import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ListChecks,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Btn, BouncingDots, Card, Input, Modal } from "../../shared/ui";
import {
  getAllApplicationStatuses,
  saveApplicationStatus,
  updateApplicationStatus,
  deleteApplicationStatus
} from "../../../../services/lookupService";

function StatusesScreen() {
  const pageSize = 10;
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formName, setFormName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

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
    getAllApplicationStatuses().then((res) => {
      if (cancelled) return;
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setRows(data);
      setTotalRecords(data.length);
    }).catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "Failed to load statuses.");
      setRows([]);
      setTotalRecords(0);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pagedRows = rows.slice(start, start + pageSize);
  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const openAdd = () => {
    setEditing(null);
    setFormName("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setFormName(s.statusName);
    setFormError(null);
    setFormOpen(true);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setFormError("Please enter a status name.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const res = await updateApplicationStatus({ applicationStatusId: editing.applicationStatusId, statusName: name });
        const msg = typeof res === "string" ? res : "Status updated successfully";
        showToast("success", msg);
      } else {
        const res = await saveApplicationStatus({ statusName: name });
        const msg = typeof res === "string" ? res : "Status created successfully";
        showToast("success", msg);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save status.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete status "${s.statusName}"?`)) return;
    try {
      const res = await deleteApplicationStatus(s.applicationStatusId);
      const msg = typeof res === "string" ? res : "Deleted successfully";
      showToast("success", msg);
      load();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete status.");
    }
  };

  const searching = search.trim() !== debouncedSearch;

  return <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Application Statuses</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={openAdd}>Add Status</Btn>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          {searching ? (
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <span className="block h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            </span>
          ) : (
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          )}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search status name…"
            className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
          />
          {searching && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#718096] pointer-events-none">Searching…</span>}
          {search && !searching && <button
            onClick={() => setSearch("")}
            title="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={13} />
          </button>}
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["#", "Status Name", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((s, i) => <tr key={s.applicationStatusId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 text-[#718096]">{start + i + 1}</td>
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{s.statusName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Edit status" onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#718096] hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={14} /></button>
                      <button title="Delete status" onClick={() => handleDelete(s)} className="p-1.5 rounded-lg text-[#718096] hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
          {loading && <BouncingDots label={rows.length ? "Refreshing results…" : "Loading statuses…"} />}
          {!loading && error && <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
            </div>}
          {!loading && !error && totalRecords === 0 && <div className="py-16 text-center">
              <ListChecks size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No statuses found</p>
              <p className="text-xs text-gray-400 mt-1">{search.trim() ? "Try clearing your search" : "Add a status to get started"}</p>
            </div>}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {loading ? "Loading…" : totalRecords === 0 ? "No results" : `Showing ${start + 1}–${Math.min(start + pageSize, totalRecords)} of ${totalRecords} status${totalRecords === 1 ? "" : "es"}`}
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

      {/* Add / Edit modal */}
      {formOpen && <Modal title={editing ? "Edit Status" : "Add New Status"} onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSaveStatus} className="flex flex-col gap-4">
            <Input label="Status Name" placeholder="e.g. Pending, Processing, Approved" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            {formError && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {formError}
              </div>}
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Btn>
              <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Save Changes" : "Create Status"}
              </Btn>
            </div>
          </form>
        </Modal>}

      {/* Toast */}
      {toast && <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#0E7C7B]" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>}
    </div>;
}

export { StatusesScreen };
