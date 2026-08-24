import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Btn, BouncingDots, Card, Input, Modal, SearchableSelect, Select, StatusBadge } from "../../shared/ui";
import { ServiceMultiSelect } from "../../shared/LookupSelect";
import { useApplicationStatuses, useServices } from "../../../../hooks/useLookups";
import {
  getActiveCourses,
  getApplicants,
  getCountries,
  saveApplicant
} from "../../../../services/applicantService";
import {
  deleteApplicantInvoice,
  getAllApplicantInvoices,
  getApplicantDetail,
  getApplicantInvoice,
  getApplicantTransactions,
  saveApplicantInvoice,
  setApplicantStatus
} from "../../../../services/applicantInvoiceService";

const CURRENCIES = ["AED", "SAR", "USD", "GBP", "EUR"];

const emptyForm = () => ({
  service: "",
  amount: "",
  paidAmount: "",
  currency: "AED",
  remarks: "",
  serviceList: []
});

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(value) {
  return toNumber(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

function invoiceStatus(inv) {
  const amount = toNumber(inv.amount);
  const paid = toNumber(inv.paidAmount);
  if (amount > 0 && paid >= amount) return "Paid";
  if (paid <= 0) return "Unpaid";
  return "Partial";
}

function validateForm(form) {
  const errors = {};
  const amount = toNumber(form.amount);
  const paidAmount = toNumber(form.paidAmount || 0);
  if (!form.service.trim()) errors.service = "Service is required.";
  if (form.amount === "" || form.amount === null || amount <= 0) {
    errors.amount = "Enter an amount greater than 0.";
  }
  if (form.paidAmount !== "" && form.paidAmount !== null && paidAmount < 0) {
    errors.paidAmount = "Paid amount cannot be negative.";
  } else if (form.amount !== "" && amount > 0 && paidAmount > amount) {
    errors.paidAmount = "Paid amount cannot exceed the invoice amount.";
  }
  if (!form.currency.trim()) errors.currency = "Currency is required.";
  form.serviceList.forEach((item, i) => {
    const key = `line-${i}`;
    if (!item.service.trim() && item.amount === "") return;
    if (!item.service.trim()) errors[key] = "Service is required for this line.";
    else if (item.amount === "" || toNumber(item.amount) <= 0) errors[key] = "Enter an amount greater than 0.";
  });
  return errors;
}

export function InvoiceScreen({ applicant }) {
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(
    applicant && applicant.applicantId ? {
      applicantId: applicant.applicantId,
      label: `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim() || `#${applicant.applicantId}`
    } : null
  );
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [modalApplicant, setModalApplicant] = useState(null);

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { services } = useServices();
  const selectedServiceIds = form.service
    ? form.service.split(",").map((n) => n.trim()).map((name) => services.find((s) => s.serviceName === name)?.serviceId).filter((id) => id != null)
    : [];

  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({ fullName: "", mobile: "", email: "", countryId: 0, courseId: 0 });
  const [regCountries, setRegCountries] = useState([]);
  const [regCourses, setRegCourses] = useState([]);
  const [regSaving, setRegSaving] = useState(false);
  const [regError, setRegError] = useState(null);

  const { statuses } = useApplicationStatuses();
  const [drawerApplicant, setDrawerApplicant] = useState(null);
  const [drawerDetail, setDrawerDetail] = useState(null);
  const [drawerTxns, setDrawerTxns] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const openDrawer = (applicant) => {
    const applicantId = applicant.applicantId;
    if (!applicantId) return;
    setDrawerApplicant({
      applicantId,
      label: `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim() || `#${applicantId}`
    });
    setDrawerDetail(null);
    setDrawerTxns([]);
    setDrawerError(null);
    setDrawerLoading(true);
    Promise.all([
      getApplicantDetail(applicantId),
      getApplicantTransactions(applicantId)
    ])
      .then(([detail, txns]) => {
        setDrawerDetail(detail ?? {});
        setDrawerTxns(Array.isArray(txns) ? txns : []);
      })
      .catch((err) => setDrawerError(err instanceof Error ? err.message : "Failed to load applicant."))
      .finally(() => setDrawerLoading(false));
  };

  const handleStatusChange = async (e) => {
    const newId = Number(e.target.value);
    if (!drawerApplicant || !newId) return;
    setStatusSaving(true);
    try {
      const res = await setApplicantStatus(drawerApplicant.applicantId, newId);
      const name = res?.statusName ?? statuses.find((s) => s.applicationStatusId === newId)?.statusName ?? "";
      setDrawerDetail((d) => ({ ...d, applicationStatusId: newId, statusName: name }));
      toast.success(res?.message || "Status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  const openReg = () => {
    setRegForm({ fullName: "", mobile: "", email: "", countryId: 0, courseId: 0 });
    setRegError(null);
    setShowRegModal(true);
    getCountries().then((res) => setRegCountries(Array.isArray(res) ? res : [])).catch(() => setRegCountries([]));
    getActiveCourses().then((res) => setRegCourses(Array.isArray(res) ? res : [])).catch(() => setRegCourses([]));
  };

  const handleRegSubmit = async () => {
    setRegError(null);
    const nameParts = regForm.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || "";
    if (!firstName) { setRegError("Please enter the applicant's full name."); return; }
    if (!regForm.mobile.trim()) { setRegError("Please enter a mobile number."); return; }
    if (!regForm.email.trim()) { setRegError("Please enter an email address."); return; }
    if (!regForm.countryId) { setRegError("Please select a country."); return; }
    if (!regForm.courseId) { setRegError("Please select a course."); return; }
    const regDate = new Date();
    const expiry = new Date(regDate);
    expiry.setFullYear(expiry.getFullYear() + 1);
    setRegSaving(true);
    try {
      const res = await saveApplicant({
        applicantId: 0,
        registrationNo: "",
        firstName,
        lastName,
        mobile: regForm.mobile.trim(),
        otherMobile: "",
        email: regForm.email.trim(),
        address: "",
        photoUrl: null,
        registrationDate: regDate.toISOString(),
        expiryDate: expiry.toISOString(),
        isActive: true,
        countryId: regForm.countryId,
        courseId: regForm.courseId
      });
      if (typeof res === "string" && res.startsWith("System.")) {
        setRegError("Server error while saving. Please try again.");
        return;
      }
      const data = await getApplicants({ pageNumber: 1, pageSize: 500, status: "All" });
      const list = data?.data ?? (Array.isArray(data) ? data : []);
      setApplicants(list);
      const created = list.find((a) =>
        `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim().toLowerCase() === regForm.fullName.trim().toLowerCase() &&
        (a.mobile ?? "") === regForm.mobile.trim()
      ) || list[list.length - 1];
      if (created) {
        setModalApplicant({ applicantId: created.applicantId, label: `${created.firstName ?? ""} ${created.lastName ?? ""}`.trim() });
        setFormErrors((errs) => { const n = { ...errs }; delete n.applicant; return n; });
      }
      setShowRegModal(false);
      toast.success("Applicant registered.");
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Failed to save applicant.");
    } finally {
      setRegSaving(false);
    }
  };

  useEffect(() => {
    if (applicant && applicant.applicantId) {
      setSelectedApplicant({
        applicantId: applicant.applicantId,
        label: `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim() || `#${applicant.applicantId}`
      });
    }
  }, [applicant]);

  useEffect(() => {
    getApplicants({ pageNumber: 1, pageSize: 500, status: "All" })
      .then((res) => setApplicants(res?.data ?? (Array.isArray(res) ? res : [])))
      .catch(() => setApplicants([]));
  }, []);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const request = selectedApplicant
      ? getApplicantInvoice(selectedApplicant.applicantId)
      : getAllApplicantInvoices();
    request
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load invoices.");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedApplicant]);

  useEffect(() => load(), [load]);

  const totals = rows.reduce(
    (acc, inv) => ({
      invoiced: acc.invoiced + toNumber(inv.amount),
      paid: acc.paid + toNumber(inv.paidAmount),
      outstanding: acc.outstanding + toNumber(inv.balance)
    }),
    { invoiced: 0, paid: 0, outstanding: 0 }
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormErrors({});
    setModalApplicant(selectedApplicant);
    setShowModal(true);
  };

  const openEdit = (inv) => {
    setEditing(inv);
    setForm({
      service: inv.service ?? "",
      amount: inv.amount ?? "",
      paidAmount: inv.paidAmount ?? "",
      currency: inv.currency || "AED",
      remarks: inv.remarks ?? "",
      serviceList: (inv.serviceList ?? []).map((l) => ({ service: l.service ?? "", amount: l.amount ?? "" }))
    });
    setFormErrors({});
    setModalApplicant({
      applicantId: inv.applicantId,
      label: `${inv.firstName ?? ""} ${inv.lastName ?? ""}`.trim() || `#${inv.applicantId}`
    });
    setShowModal(true);
  };

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFormErrors((errs) => {
      if (!(field in errs)) return errs;
      const next = { ...errs };
      delete next[field];
      return next;
    });
  };

  const setLine = (index, field) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const serviceList = f.serviceList.map((item, i) => (i === index ? { ...item, [field]: value } : item));
      return { ...f, serviceList };
    });
    setFormErrors((errs) => {
      if (!(`line-${index}` in errs)) return errs;
      const next = { ...errs };
      delete next[`line-${index}`];
      return next;
    });
  };

  const addLine = () => setForm((f) => ({ ...f, serviceList: [...f.serviceList, { service: "", amount: "" }] }));
  const removeLine = (index) => setForm((f) => ({ ...f, serviceList: f.serviceList.filter((_, i) => i !== index) }));

  const handleSubmit = async () => {
    if (!modalApplicant?.applicantId) {
      setFormErrors((errs) => ({ ...errs, applicant: "Please select an applicant for this invoice." }));
      return;
    }
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    const amount = toNumber(form.amount);
    const paidAmount = toNumber(form.paidAmount || 0);
    const serviceList = form.serviceList
      .filter((item) => item.service.trim() && item.amount !== "")
      .map((item) => ({ service: item.service.trim(), amount: toNumber(item.amount) }));

    setSaving(true);
    try {
      const res = await saveApplicantInvoice({
        invoiceId: editing ? editing.invoiceId : 0,
        invoiceNo: editing ? editing.invoiceNo : null,
        applicantId: modalApplicant.applicantId,
        service: form.service.trim(),
        amount,
        paidAmount,
        balance: Math.max(amount - paidAmount, 0),
        remarks: form.remarks.trim(),
        currency: form.currency,
        serviceList
      });
      toast.success(res?.message || (editing ? "Invoice updated." : "Invoice created."));
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save the invoice.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await deleteApplicantInvoice(toDelete.invoiceId);
      toast.success(res?.message || "Invoice deleted.");
      setToDelete(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete the invoice.");
    } finally {
      setDeleting(false);
    }
  };

  const amount = toNumber(form.amount);
  const paidAmount = toNumber(form.paidAmount || 0);
  const derivedBalance = form.amount !== "" && amount > 0 ? Math.max(amount - paidAmount, 0) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-[#1A202C]">Invoices</h1>
          <span className="text-sm text-[#718096]">
            {selectedApplicant ? selectedApplicant.label : "All invoices"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <SearchableSelect
            options={applicants.map((a) => ({
              id: a.applicantId,
              label: `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() + (a.registrationNo ? ` · ${a.registrationNo}` : "")
            }))}
            value={selectedApplicant?.applicantId ?? null}
            onSelect={(id) => {
              const found = applicants.find((a) => a.applicantId === id);
              setSelectedApplicant(found
                ? { applicantId: found.applicantId, label: `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim() }
                : null);
            }}
            allLabel="Select an applicant"
            placeholder="Search applicant…"
          />
          <Btn variant="primary" icon={<Plus size={14} />} onClick={openAdd}>
            Create Invoice
          </Btn>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Invoice No", "Applicant", "Date", "Service", "Amount", "Paid", "Balance", "Currency", "Status", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide ${["Amount", "Paid", "Balance"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.invoiceId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{inv.invoiceNo}</td>
                  <td className="px-4 py-3 text-[#1A202C] font-medium">
                    {inv.firstName || inv.lastName ? (
                      <button
                        onClick={() => openDrawer(inv)}
                        title="View applicant details"
                        className="text-left hover:text-[#0E7C7B] hover:underline transition"
                      >
                        {`${inv.firstName ?? ""} ${inv.lastName ?? ""}`.trim()}
                      </button>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{formatDate(inv.dateTime)}</td>
                  <td className="px-4 py-3 text-[#1A202C] max-w-64 truncate" title={inv.service}>
                    {inv.service || "—"}
                    {(inv.serviceList?.length ?? 0) > 0 && (
                      <span className="ml-2 text-[10px] text-gray-400 font-medium">+{(inv.serviceList?.length ?? 0)} items</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-[#1A202C]">{fmtMoney(inv.amount)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-emerald-600">{fmtMoney(inv.paidAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-red-600">{fmtMoney(inv.balance)}</td>
                  <td className="px-4 py-3 text-[#718096]">{inv.currency}</td>
                  <td className="px-4 py-3"><StatusBadge status={invoiceStatus(inv)} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        title="Edit invoice"
                        onClick={() => openEdit(inv)}
                        className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        title="Delete invoice"
                        onClick={() => setToDelete(inv)}
                        className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <BouncingDots label="Loading invoices…" />}
          {!loading && error && (
            <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
              <button onClick={load} className="mt-3 text-sm font-medium text-[#0E7C7B] hover:underline">Retry</button>
            </div>
          )}
          {!loading && !error && rows.length === 0 && (
            <div className="py-16 text-center">
              <FileText size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">{selectedApplicant ? "No invoices for this applicant" : "No invoices found"}</p>
              <p className="text-xs text-gray-400 mt-1">{selectedApplicant ? 'Use "Create Invoice" to add the first one' : 'Use "Create Invoice" to add the first invoice'}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {rows.length} invoice{rows.length === 1 ? "" : "s"}
          </span>
          <div className="flex flex-wrap gap-6 text-xs">
            <span className="text-[#718096]">Total Invoiced: <strong className="text-[#1A202C]">{fmtMoney(totals.invoiced)}</strong></span>
            <span className="text-[#718096]">Total Paid: <strong className="text-emerald-600">{fmtMoney(totals.paid)}</strong></span>
            <span className="text-[#718096]">Outstanding: <strong className="text-red-600">{fmtMoney(totals.outstanding)}</strong></span>
          </div>
        </div>
      </Card>

      {showModal && (
        <Modal
          title={editing ? `Edit Invoice ${editing.invoiceNo}` : "Create Invoice"}
          onClose={() => setShowModal(false)}
          className="max-w-xl"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Applicant</label>
              {editing ? (
                <div className="h-10 flex items-center px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-gray-50 text-sm text-[#1A202C]">
                  {modalApplicant?.label}
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <SearchableSelect
                        options={applicants.map((a) => ({
                          id: a.applicantId,
                          label: `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() + (a.registrationNo ? ` · ${a.registrationNo}` : "")
                        }))}
                        value={modalApplicant?.applicantId ?? null}
                        onSelect={(id) => {
                          const found = applicants.find((a) => a.applicantId === id);
                          setModalApplicant(found
                            ? { applicantId: found.applicantId, label: `${found.firstName ?? ""} ${found.lastName ?? ""}`.trim() }
                            : null);
                          setFormErrors((errs) => {
                            if (!("applicant" in errs)) return errs;
                            const next = { ...errs };
                            delete next.applicant;
                            return next;
                          });
                        }}
                        allLabel="Select an applicant"
                        placeholder="Search applicant…"
                      />
                    </div>
                    <Btn variant="ghost" onClick={openReg} disabled={!!editing} className="whitespace-nowrap">
                      + Register new
                    </Btn>
                  </div>
                  {formErrors.applicant && <p className="text-xs text-red-600">{formErrors.applicant}</p>}
                </>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <ServiceMultiSelect
                services={services}
                value={selectedServiceIds}
                onChange={(ids) => {
                  const names = ids
                    .map((id) => services.find((s) => s.serviceId === id)?.serviceName ?? "")
                    .filter(Boolean)
                    .join(", ");
                  setForm((f) => ({ ...f, service: names }));
                  setFormErrors((errs) => {
                    if (!("service" in errs)) return errs;
                    const next = { ...errs };
                    delete next.service;
                    return next;
                  });
                }}
                label="Service"
                placeholder="Select services…"
                allLabel="Clear services"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={setField("amount")}
                  placeholder="0.00"
                  className={`h-10 px-3 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition ${formErrors.amount ? "border-red-400" : "border-[rgba(0,0,0,0.12)]"}`}
                />
                {formErrors.amount && <p className="text-xs text-red-600">{formErrors.amount}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Paid Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.paidAmount}
                  onChange={setField("paidAmount")}
                  placeholder="0.00"
                  className={`h-10 px-3 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition ${formErrors.paidAmount ? "border-red-400" : "border-[rgba(0,0,0,0.12)]"}`}
                />
                {formErrors.paidAmount && <p className="text-xs text-red-600">{formErrors.paidAmount}</p>}
              </div>
              <Select label="Currency" options={CURRENCIES} value={form.currency} onChange={(v) => setForm((f) => ({ ...f, currency: v }))} />
            </div>

            {derivedBalance !== null && (
              <div className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-teal-50 border border-teal-100 text-sm">
                <span className="text-[#0E7C7B] font-medium">Balance</span>
                <span className="font-mono font-semibold text-[#0E7C7B]">{fmtMoney(derivedBalance)}</span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Remarks</label>
              <textarea
                value={form.remarks}
                onChange={setField("remarks")}
                rows={2}
                placeholder="Optional notes"
                className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Line Items</label>
                <button onClick={addLine} className="text-xs font-medium text-[#0E7C7B] hover:underline">+ Add line item</button>
              </div>
              {form.serviceList.length === 0 && (
                <p className="text-xs text-gray-400">No line items. Add itemized services if needed.</p>
              )}
              {form.serviceList.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <input
                      value={item.service}
                      onChange={setLine(i, "service")}
                      placeholder="Line item service"
                      className={`h-9 flex-1 px-3 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition ${formErrors[`line-${i}`] ? "border-red-400" : "border-[rgba(0,0,0,0.12)]"}`}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.amount}
                      onChange={setLine(i, "amount")}
                      placeholder="0.00"
                      className={`h-9 w-28 px-3 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition ${formErrors[`line-${i}`] ? "border-red-400" : "border-[rgba(0,0,0,0.12)]"}`}
                    />
                    <button
                      onClick={() => removeLine(i)}
                      title="Remove line item"
                      className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {formErrors[`line-${i}`] && <p className="text-xs text-red-600">{formErrors[`line-${i}`]}</p>}
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowModal(false)} disabled={saving}>Cancel</Btn>
              <Btn variant="primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving…" : editing ? "Save Changes" : "Create Invoice"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <Modal title="Delete Invoice" onClose={() => !deleting && setToDelete(null)} className="max-w-md">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#1A202C] leading-relaxed">
              Are you sure you want to delete invoice <span className="font-mono font-semibold">{toDelete.invoiceNo}</span>?
              The matching ledger entry will also be removed. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Btn variant="ghost" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete Invoice"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {showRegModal && (
        <Modal title="Register New Applicant" onClose={() => !regSaving && setShowRegModal(false)} className="max-w-lg">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Full Name</label>
              <input
                value={regForm.fullName}
                onChange={(e) => setRegForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="e.g. Zara Ahmed"
                className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Mobile</label>
                <input
                  type="tel"
                  value={regForm.mobile}
                  onChange={(e) => setRegForm((f) => ({ ...f, mobile: e.target.value }))}
                  placeholder="+971 50 000 0000"
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Email</label>
                <input
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="applicant@email.com"
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Country</label>
                <select
                  value={regForm.countryId}
                  onChange={(e) => setRegForm((f) => ({ ...f, countryId: Number(e.target.value) }))}
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] appearance-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                >
                  <option value={0}>Select Country</option>
                  {regCountries.map((c) => <option key={c.countryId} value={c.countryId}>{c.coutryName}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Course</label>
                <select
                  value={regForm.courseId}
                  onChange={(e) => setRegForm((f) => ({ ...f, courseId: Number(e.target.value) }))}
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] appearance-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                >
                  <option value={0}>Select Course</option>
                  {regCourses.map((c) => <option key={c.courseId} value={c.courseId}>{c.courseName}</option>)}
                </select>
              </div>
            </div>
            {regError && <p className="text-xs text-red-600">{regError}</p>}
            <div className="flex gap-2 justify-end mt-1">
              <Btn variant="ghost" onClick={() => setShowRegModal(false)} disabled={regSaving}>Cancel</Btn>
              <Btn variant="primary" onClick={handleRegSubmit} disabled={regSaving}>
                {regSaving ? "Saving…" : "Register & Select"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {drawerApplicant && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/30" onClick={() => setDrawerApplicant(null)} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <div>
                <h2 className="text-base font-semibold text-[#1A202C]">{drawerApplicant.label}</h2>
                <p className="text-xs text-[#718096]">Applicant details</p>
              </div>
              <button
                onClick={() => setDrawerApplicant(null)}
                className="p-2 text-[#718096] hover:text-[#1A202C] hover:bg-gray-100 rounded-lg transition"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {drawerLoading && <BouncingDots label="Loading applicant…" />}
              {drawerError && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <AlertCircle size={14} /> {drawerError}
                </div>
              )}

              {!drawerLoading && drawerDetail && (
                <>
                  <section className="grid grid-cols-2 gap-3">
                    <InfoItem label="Registration No" value={drawerDetail.registrationNo} />
                    <InfoItem label="Mobile" value={drawerDetail.mobile} />
                    <InfoItem label="Email" value={drawerDetail.email} />
                    <InfoItem label="Country" value={drawerDetail.country} />
                    <div className="col-span-2">
                      <InfoItem label="Course" value={drawerDetail.course} />
                    </div>
                  </section>

                  <section className="flex flex-col gap-1">
                    <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Status</label>
                    <select
                      value={drawerDetail.applicationStatusId ?? ""}
                      onChange={handleStatusChange}
                      disabled={statusSaving}
                      className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] appearance-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition disabled:opacity-60"
                    >
                      <option value="">Select status</option>
                      {statuses.map((s) => (
                        <option key={s.applicationStatusId} value={s.applicationStatusId}>{s.statusName}</option>
                      ))}
                    </select>
                  </section>

                  <section className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Ledger / Transactions</h3>
                      {drawerTxns.length > 0 && (
                        <span className="text-[11px] text-[#718096]">
                          Bal: {fmtMoney(
                            drawerTxns.reduce((a, t) => a + (Number(t.debit) || 0) - (Number(t.credit) || 0), 0)
                          )}
                        </span>
                      )}
                    </div>
                    {drawerTxns.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No transactions yet.</p>
                    ) : (
                      <div className="overflow-x-auto border border-[rgba(0,0,0,0.06)] rounded-lg">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-[#F7FAFC] text-[11px] uppercase tracking-wide text-[#718096]">
                              <th className="text-left px-3 py-2">Reference</th>
                              <th className="text-right px-3 py-2">Debit</th>
                              <th className="text-right px-3 py-2">Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drawerTxns.map((t, i) => (
                              <tr key={i} className="border-t border-[rgba(0,0,0,0.04)]">
                                <td className="px-3 py-2 text-[#1A202C]">
                                  <div className="font-mono text-xs">{t.reference}</div>
                                  <div className="text-[10px] text-[#718096]">{formatDate(t.dateTime)}</div>
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-xs text-red-600">{fmtMoney(t.debit)}</td>
                                <td className="px-3 py-2 text-right font-mono text-xs text-emerald-600">{fmtMoney(t.credit)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-[#718096]">{label}</span>
      <span className="text-sm text-[#1A202C] font-medium break-words">{value || "—"}</span>
    </div>
  );
}
