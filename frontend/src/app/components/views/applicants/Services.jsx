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
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Btn, BouncingDots, Card, Input, Modal } from "../../shared/ui";
import {
  getAllServices,
  saveService,
  updateService,
  deleteService
} from "../../../../services/lookupService";

function ServicesScreen() {
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
  const [formPurchase, setFormPurchase] = useState("");
  const [formSale, setFormSale] = useState("");
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
    getAllServices().then((res) => {
      if (cancelled) return;
      const data = Array.isArray(res) ? res : (res?.data ?? []);
      setRows(data);
      setTotalRecords(data.length);
    }).catch((err) => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "Failed to load services.");
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
    setFormPurchase("");
    setFormSale("");
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setFormName(s.serviceName);
    setFormPurchase(s.purchasePrice != null ? String(s.purchasePrice) : "");
    setFormSale(s.salePrice != null ? String(s.salePrice) : "");
    setFormError(null);
    setFormOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setFormError("Please enter a service name.");
      return;
    }
    const purchase = formPurchase === "" ? 0 : Number(formPurchase);
    const sale = formSale === "" ? 0 : Number(formSale);
    if (isNaN(purchase) || isNaN(sale) || purchase < 0 || sale < 0) {
      setFormError("Prices must be valid non-negative numbers.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editing) {
        const res = await updateService({ serviceId: editing.serviceId, serviceName: name, purchasePrice: purchase, salePrice: sale });
        const msg = typeof res === "string" ? res : "Service updated successfully";
        showToast("success", msg);
      } else {
        const res = await saveService({ serviceName: name, purchasePrice: purchase, salePrice: sale });
        const msg = typeof res === "string" ? res : "Service created successfully";
        showToast("success", msg);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Delete service "${s.serviceName}"?`)) return;
    try {
      const res = await deleteService(s.serviceId);
      const msg = typeof res === "string" ? res : "Deleted successfully";
      showToast("success", msg);
      load();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete service.");
    }
  };

  const searching = search.trim() !== debouncedSearch;

  return <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Services</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={openAdd}>Add Service</Btn>
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
            placeholder="Search service name…"
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
                {["Service Name", "Purchase Price", "Sale Price", "Actions"].map((h) => <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((s) => <tr key={s.serviceId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-medium text-[#1A202C]">{s.serviceName}</td>
                  <td className="px-4 py-3 text-[#718096]">{Number(s.purchasePrice ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-[#718096]">{Number(s.salePrice ?? 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button title="Edit service" onClick={() => openEdit(s)} className="p-1.5 rounded-lg text-[#718096] hover:text-blue-600 hover:bg-blue-50 transition"><Edit2 size={14} /></button>
                      <button title="Delete service" onClick={() => handleDelete(s)} className="p-1.5 rounded-lg text-[#718096] hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
          {loading && <BouncingDots label={rows.length ? "Refreshing results…" : "Loading services…"} />}
          {!loading && error && <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
            </div>}
          {!loading && !error && totalRecords === 0 && <div className="py-16 text-center">
              <FileText size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No services found</p>
              <p className="text-xs text-gray-400 mt-1">{search.trim() ? "Try clearing your search" : "Add a service to get started"}</p>
            </div>}
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {loading ? "Loading…" : totalRecords === 0 ? "No results" : `Showing ${start + 1}–${Math.min(start + pageSize, totalRecords)} of ${totalRecords} service${totalRecords === 1 ? "" : "s"}`}
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
      {formOpen && <Modal title={editing ? "Edit Service" : "Add New Service"} onClose={() => setFormOpen(false)}>
          <form onSubmit={handleSaveService} className="flex flex-col gap-4">
            <Input label="Service Name" placeholder="e.g. Blood Test, X-Ray, MRI" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Purchase Price" type="number" min="0" step="0.01" placeholder="0.00" value={formPurchase} onChange={(e) => setFormPurchase(e.target.value)} />
              <Input label="Sale Price" type="number" min="0" step="0.01" placeholder="0.00" value={formSale} onChange={(e) => setFormSale(e.target.value)} />
            </div>
            {formError && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {formError}
              </div>}
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Btn>
              <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editing ? "Save Changes" : "Create Service"}
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

export { ServicesScreen };