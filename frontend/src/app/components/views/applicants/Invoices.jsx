import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, AlertCircle, FileText, ArrowRight, Printer, Loader2, Check } from "lucide-react";
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
  completeService,
  deleteApplicantInvoice,
  getAllApplicantInvoices,
  getApplicantDetail,
  getApplicantInvoice,
  getApplicantStatusHistory,
  getApplicantTransactions,
  recordApplicantPayment,
  saveApplicantInvoice,
  setApplicantStatus
} from "../../../../services/applicantInvoiceService";
import { PrintInvoice } from "./PrintInvoice";

const CURRENCIES = ["AED", "SAR", "USD", "GBP", "EUR"];
const STATUS_CHANGE_CATEGORIES = ["Payment Issue", "Docs Pending", "Manual Review", "Other"];

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

function subtotalOf(serviceList) {
  return (serviceList ?? []).reduce((sum, r) => {
    if (r.amount === "" || r.amount == null) return sum;
    const n = Number(r.amount);
    return sum + (Number.isFinite(n) && n > 0 ? n : 0);
  }, 0);
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
  const openPaymentModal = () => {
    if (ledgerOutstanding <= 0) return;
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (paymentSaving) return;
    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentError("");
  };

  const handlePayment = async () => {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a payment amount greater than zero.");
      return;
    }
    if (amount > ledgerOutstanding + 0.000001) {
      setPaymentError("Payment cannot exceed the outstanding balance.");
      return;
    }

    setPaymentSaving(true);
    setPaymentError("");
    try {
      const res = await recordApplicantPayment(drawerApplicant.applicantId, {
        amount,
        remarks: paymentRemarks.trim() || undefined
      });
      const txns = await getApplicantTransactions(drawerApplicant.applicantId);
      setDrawerTxns(Array.isArray(txns) ? txns : []);
      load();
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentRemarks("");
      toast.success(res?.message || "Payment recorded successfully.");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

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
  const [drawerHistory, setDrawerHistory] = useState([]);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerError, setDrawerError] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [statusReason, setStatusReason] = useState("");
  const [statusCategory, setStatusCategory] = useState("Other");
  const [statusReasonError, setStatusReasonError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);

  const [printInvoice, setPrintInvoice] = useState(null);

  const [completeModalItem, setCompleteModalItem] = useState(null);
  const [completePurchaseAmount, setCompletePurchaseAmount] = useState("");
  const [completeSaving, setCompleteSaving] = useState(false);
  const [completeStep, setCompleteStep] = useState("details");

  const openDrawer = (applicant) => {
    const applicantId = applicant.applicantId;
    if (!applicantId) return;
    setDrawerApplicant({
      applicantId,
      label: `${applicant.firstName ?? ""} ${applicant.lastName ?? ""}`.trim() || `#${applicantId}`
    });
    setDrawerDetail(null);
    setDrawerTxns([]);
    setDrawerHistory([]);
    setDrawerError(null);
    setDrawerLoading(true);
    Promise.all([
      getApplicantDetail(applicantId),
      getApplicantTransactions(applicantId),
      getApplicantStatusHistory(applicantId).catch(() => [])
    ])
      .then(([detail, txns, history]) => {
        setDrawerDetail(detail ?? {});
        setDrawerTxns(Array.isArray(txns) ? txns : []);
        setDrawerHistory(Array.isArray(history) ? history : []);
      })
      .catch((err) => setDrawerError(err instanceof Error ? err.message : "Failed to load applicant."))
      .finally(() => setDrawerLoading(false));
  };

  const handleStatusSelect = (e) => {
    const newId = Number(e.target.value);
    if (!drawerApplicant || !newId || newId === drawerDetail?.applicationStatusId) return;
    setPendingStatus({
      statusId: newId,
      statusName: statuses.find((s) => s.applicationStatusId === newId)?.statusName ?? ""
    });
    setStatusReason("");
    setStatusCategory("Other");
    setStatusReasonError("");
  };

  const closeStatusModal = () => {
    if (statusSaving) return;
    setPendingStatus(null);
    setStatusReason("");
    setStatusReasonError("");
  };

  const handleStatusChange = async () => {
    if (!drawerApplicant || !pendingStatus) return;
    const reason = statusReason.trim();
    if (reason.length < 10) {
      setStatusReasonError("Enter a reason of at least 10 characters.");
      return;
    }
    setStatusSaving(true);
    try {
      const res = await setApplicantStatus(drawerApplicant.applicantId, pendingStatus.statusId, {
        reason,
        category: statusCategory
      });
      const name = res?.statusName ?? pendingStatus.statusName;
      setDrawerDetail((d) => ({ ...d, applicationStatusId: pendingStatus.statusId, statusName: name }));
      const history = await getApplicantStatusHistory(drawerApplicant.applicantId).catch(() => []);
      setDrawerHistory(Array.isArray(history) ? history : []);
      toast.success(res?.message || "Status updated.");
      setPendingStatus(null);
      setStatusReason("");
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

  const openCompleteModal = (item) => {
    const catalog = services.find((s) => s.serviceName === (item.service ?? "").trim());
    const suggested = catalog && Number(catalog.purchasePrice) > 0 ? Number(catalog.purchasePrice) : "";
    setCompleteModalItem(item);
    setCompletePurchaseAmount(suggested === "" ? "" : String(suggested));
    setCompleteStep("details");
  };

  const continueComplete = () => {
    if (!completeModalItem) return;
    const amt = Number(completePurchaseAmount);
    if (completePurchaseAmount === "" || !Number.isFinite(amt) || amt < 0) {
      toast.error("Enter the total purchase amount spent on this service.");
      return;
    }
    setCompleteStep("confirm");
  };

  const handleCompleteService = async () => {
    if (!completeModalItem) return;
    const amt = Number(completePurchaseAmount);
    if (!Number.isFinite(amt) || amt < 0) {
      toast.error("Enter a valid purchase amount.");
      return;
    }
    setCompleteSaving(true);
    try {
      await completeService(completeModalItem.certificateInoviceId, { purchaseAmount: amt });
      toast.success("Service completed and purchase recorded.");
      const txns = drawerApplicant
        ? await getApplicantTransactions(drawerApplicant.applicantId).catch(() => null)
        : null;
      if (txns) setDrawerTxns(Array.isArray(txns) ? txns : []);
      setCompleteModalItem(null);
      setCompletePurchaseAmount("");
      setCompleteStep("details");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to complete service.");
    } finally {
      setCompleteSaving(false);
    }
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

  const setLineAmount = (index) => (e) => {
    const value = e.target.value;
    setForm((f) => {
      const serviceList = f.serviceList.map((item, i) => (i === index ? { ...item, amount: value } : item));
      const subtotal = subtotalOf(serviceList);
      return { ...f, serviceList, amount: subtotal > 0 ? String(subtotal) : f.amount };
    });
    setFormErrors((errs) => {
      if (!(`line-${index}` in errs)) return errs;
      const next = { ...errs };
      delete next[`line-${index}`];
      return next;
    });
  };

  const addLine = () => setForm((f) => ({ ...f, serviceList: [...f.serviceList, { service: "", amount: "" }] }));
  const removeLine = (index) => setForm((f) => {
    const serviceList = f.serviceList.filter((_, i) => i !== index);
    const removed = f.serviceList[index];
    let service = f.service;
    if (removed) {
      const rmName = (removed.service ?? "").trim();
      const isCatalog = services.some((s) => s.serviceName === rmName);
      if (isCatalog && rmName && service) {
        service = service.split(",").map((n) => n.trim()).filter((n) => n && n !== rmName).join(", ");
      }
    }
    const subtotal = subtotalOf(serviceList);
    return { ...f, serviceList, service, amount: subtotal > 0 ? String(subtotal) : f.amount };
  });

  const handleServiceSelection = (ids) => {
    const selected = ids
      .map((id) => services.find((s) => s.serviceId === id))
      .filter(Boolean);
    const selectedNames = new Set(selected.map((s) => s.serviceName));
    setForm((f) => {
      const kept = f.serviceList.filter((r) => {
        const nm = (r.service ?? "").trim();
        if (!nm) return false;
        const isCatalog = services.some((s) => s.serviceName === nm);
        return isCatalog ? selectedNames.has(nm) : true;
      });
      const keptNames = new Set(kept.map((r) => r.service.trim()));
      const added = selected
        .filter((s) => !keptNames.has(s.serviceName))
        .map((s) => ({ service: s.serviceName, amount: String(Number(s.salePrice ?? 0)) }));
      const serviceList = [...kept, ...added];
      const subtotal = subtotalOf(serviceList);
      return {
        ...f,
        service: [...selectedNames].join(", "),
        serviceList,
        amount: subtotal > 0 ? String(subtotal) : f.amount
      };
    });
    setFormErrors((errs) => {
      if (!("service" in errs)) return errs;
      const next = { ...errs };
      delete next.service;
      return next;
    });
  };

  const setLineService = (index) => (e) => {
    const value = e.target.value;
    const matched = services.find((s) => s.serviceName === value.trim());
    setForm((f) => {
      const serviceList = f.serviceList.map((item, i) => {
        if (i !== index) return item;
        return matched
          ? { ...item, service: value, amount: String(Number(matched.salePrice ?? 0)) }
          : { ...item, service: value };
      });
      const subtotal = subtotalOf(serviceList);
      return { ...f, serviceList, amount: subtotal > 0 ? String(subtotal) : f.amount };
    });
    setFormErrors((errs) => {
      if (!(`line-${index}` in errs)) return errs;
      const next = { ...errs };
      delete next[`line-${index}`];
      return next;
    });
  };

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
    const openPaymentModal = () => {
    if (ledgerOutstanding <= 0) return;
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (paymentSaving) return;
    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentError("");
  };

  const handlePayment = async () => {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a payment amount greater than zero.");
      return;
    }
    if (amount > ledgerOutstanding + 0.000001) {
      setPaymentError("Payment cannot exceed the outstanding balance.");
      return;
    }

    setPaymentSaving(true);
    setPaymentError("");
    try {
      const res = await recordApplicantPayment(drawerApplicant.applicantId, {
        amount,
        remarks: paymentRemarks.trim() || undefined
      });
      const txns = await getApplicantTransactions(drawerApplicant.applicantId);
      setDrawerTxns(Array.isArray(txns) ? txns : []);
      load();
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentRemarks("");
      toast.success(res?.message || "Payment recorded successfully.");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

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

  const openPaymentModal = () => {
    if (ledgerOutstanding <= 0) return;
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (paymentSaving) return;
    setShowPaymentModal(false);
    setPaymentAmount("");
    setPaymentRemarks("");
    setPaymentError("");
  };

  const handlePayment = async () => {
    const amount = Number(paymentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError("Enter a payment amount greater than zero.");
      return;
    }
    if (amount > ledgerOutstanding + 0.000001) {
      setPaymentError("Payment cannot exceed the outstanding balance.");
      return;
    }

    setPaymentSaving(true);
    setPaymentError("");
    try {
      const res = await recordApplicantPayment(drawerApplicant.applicantId, {
        amount,
        remarks: paymentRemarks.trim() || undefined
      });
      const txns = await getApplicantTransactions(drawerApplicant.applicantId);
      setDrawerTxns(Array.isArray(txns) ? txns : []);
      load();
      setShowPaymentModal(false);
      setPaymentAmount("");
      setPaymentRemarks("");
      toast.success(res?.message || "Payment recorded successfully.");
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to record payment.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const amount = toNumber(form.amount);
  const paidAmount = toNumber(form.paidAmount || 0);
  const derivedBalance = form.amount !== "" && amount > 0 ? Math.max(amount - paidAmount, 0) : null;
  const ledgerInvoiced = drawerTxns.reduce((a, t) => a + (Number(t.debit) || 0), 0);
  const ledgerPaid = drawerTxns.reduce((a, t) => a + (Number(t.credit) || 0), 0);
  const ledgerOutstanding = ledgerInvoiced - ledgerPaid;
  const lastTxnDate = drawerTxns.reduce((latest, t) => {
    if (!t.dateTime) return latest;
    const d = new Date(t.dateTime);
    if (Number.isNaN(d.getTime())) return latest;
    return !latest || d > latest ? d : latest;
  }, null);

  if (drawerApplicant) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-[#1A202C]">{drawerApplicant.label}</h1>
            <p className="text-sm text-[#718096]">Applicant details</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="primary" onClick={openPaymentModal} disabled={drawerLoading || ledgerOutstanding <= 0}>
              Pay
            </Btn>
            <Btn variant="outline" icon={<ArrowRight size={14} className="rotate-180" />} onClick={() => setDrawerApplicant(null)}>
              Back to invoices
            </Btn>
          </div>
        </div>

        <Card>
          <div className="p-5 flex flex-col gap-5">
            {drawerLoading && <BouncingDots label="Loading applicant…" />}
            {drawerError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {drawerError}
              </div>
            )}

            {!drawerLoading && drawerDetail && (
              <>
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoItem label="Registration No" value={drawerDetail.registrationNo} />
                  <InfoItem label="Mobile" value={drawerDetail.mobile} />
                  <InfoItem label="Email" value={drawerDetail.email} />
                  <InfoItem label="Country" value={drawerDetail.country} />
                  <div className="col-span-2 md:col-span-4">
                    <InfoItem label="Course" value={drawerDetail.course} />
                  </div>
                </section>

                <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] px-3 py-3">
                    <InfoItem label="Total Invoiced" value={fmtMoney(ledgerInvoiced)} />
                  </div>
                  <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] px-3 py-3">
                    <InfoItem label="Total Paid" value={fmtMoney(ledgerPaid)} />
                  </div>
                  <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] px-3 py-3">
                    <InfoItem label="Outstanding" value={fmtMoney(ledgerOutstanding)} />
                  </div>
                  <div className="rounded-lg border border-[rgba(0,0,0,0.06)] bg-[#F7FAFC] px-3 py-3">
                    <InfoItem label="Last Transaction" value={lastTxnDate ? lastTxnDate.toLocaleDateString() : "—"} />
                  </div>
                </section>

                <section className="flex flex-col gap-1 max-w-sm">
                  <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Status</label>
                  <select
                    value={drawerDetail.applicationStatusId ?? ""}
                    onChange={handleStatusSelect}
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
                <section className="flex flex-col gap-2">
                  <h3 className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Status History</h3>
                  {drawerHistory.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No status changes recorded yet.</p>
                  ) : (
                    <div className="overflow-x-auto border border-[rgba(0,0,0,0.06)] rounded-lg">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#F7FAFC] text-[11px] uppercase tracking-wide text-[#718096]">
                            <th className="text-left px-3 py-2">When</th>
                            <th className="text-left px-3 py-2">Change</th>
                            <th className="text-left px-3 py-2">Reason</th>
                            <th className="text-left px-3 py-2">By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {drawerHistory.map((h) => (
                            <tr key={h.historyId} className="border-t border-[rgba(0,0,0,0.04)]">
                              <td className="px-3 py-2 text-[10px] text-[#718096] whitespace-nowrap">{formatDate(h.changedAt)}</td>
                              <td className="px-3 py-2 text-xs text-[#1A202C]">
                                {(h.oldStatusName || "—")} → {(h.newStatusName || "—")}
                                {h.category && <span className="ml-2 text-[10px] text-[#718096]">{h.category}</span>}
                              </td>
                              <td className="px-3 py-2 text-xs text-[#1A202C]">{h.reason}</td>
                              <td className="px-3 py-2 text-xs text-[#718096]">{h.changedBy || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                <section className="flex flex-col gap-3">
                  <h3 className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Services Timeline</h3>
                  {rows.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No services yet.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {rows.filter(inv => inv.applicantId === drawerApplicant?.applicantId).map((inv) => (
                        <div key={inv.invoiceId} className="flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs text-[#718096]">
                            <span className="font-mono font-semibold">{inv.invoiceNo}</span>
                            <span>·</span>
                            <span>{formatDate(inv.dateTime)}</span>
                            <span>·</span>
                            <span>{inv.currency}</span>
                          </div>
                          {(inv.serviceList ?? []).length === 0 ? (
                            <p className="text-xs text-gray-400 pl-4">No line items</p>
                          ) : (
                            <div className="flex flex-col">
                              {(inv.serviceList ?? []).map((item, idx) => {
                                const isCompleted = item.isCompleted;
                                const isLast = idx === (inv.serviceList ?? []).length - 1;
                                return (
                                  <div key={item.certificateInoviceId ?? idx} className="relative flex gap-4 pb-5 last:pb-0">
                                    <div className="relative flex flex-col items-center">
                                      <span className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors ${isCompleted ? "bg-[#0E7C7B] text-white ring-4 ring-teal-100" : "border-2 border-amber-400 bg-white"}`}>
                                        {isCompleted
                                          ? <Check size={13} strokeWidth={3} />
                                          : <span className="h-2 w-2 rounded-full bg-amber-400" />}
                                      </span>
                                      {!isLast && <span className={`absolute top-7 bottom-0 w-0.5 ${isCompleted ? "bg-emerald-200" : "bg-gray-200"}`} />}
                                    </div>
                                    <div className="flex-1 min-w-0 pt-0.5 flex flex-col gap-1">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className={`text-sm font-medium truncate ${isCompleted ? "text-[#1A202C]" : "text-[#718096]"}`}>{item.service}</span>
                                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                            {isCompleted ? "Completed" : "Pending"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0">
                                          <span className="text-sm font-mono text-[#1A202C]">{fmtMoney(item.amount)} {inv.currency}</span>
                                          {!isCompleted && (
                                            <button
                                              onClick={() => openCompleteModal(item)}
                                              className="text-[10px] font-semibold px-2.5 py-1 text-[#0E7C7B] bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition whitespace-nowrap"
                                            >
                                              Mark done
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                      {isCompleted && item.purchaseAmount != null && (
                                        <div className="text-xs text-[#718096]">
                                          Purchase: <span className="font-mono text-[#1A202C]">{fmtMoney(item.purchaseAmount)}</span>
                                          <span className="ml-2 text-emerald-600 font-medium">Profit {fmtMoney(Number(item.amount ?? 0) - Number(item.purchaseAmount ?? 0))}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </Card>

        {showPaymentModal && (
          <Modal title="Record payment" onClose={closePaymentModal} className="max-w-md">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0E7C7B]">Current outstanding balance</p>
                <p className="mt-1 text-2xl font-semibold text-[#1A202C]">{fmtMoney(ledgerOutstanding)}</p>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="payment-amount" className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">
                  Payment amount
                </label>
                <input
                  id="payment-amount"
                  type="number"
                  min="0.01"
                  max={ledgerOutstanding}
                  step="0.01"
                  inputMode="decimal"
                  autoFocus
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(e.target.value);
                    if (paymentError) setPaymentError("");
                  }}
                  placeholder="0.00"
                  className={'h-10 px-3 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition ' + (paymentError ? "border-red-400" : "border-[rgba(0,0,0,0.12)]")}
                />
                {paymentError && <p className="text-xs text-red-600">{paymentError}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="payment-remarks" className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">
                  Remarks <span className="font-normal normal-case text-[#718096]">(optional)</span>
                </label>
                <textarea
                  id="payment-remarks"
                  rows={2}
                  maxLength={250}
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  placeholder="Payment method or reference"
                  className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                <Btn variant="ghost" onClick={closePaymentModal} disabled={paymentSaving}>Cancel</Btn>
                <Btn variant="primary" onClick={handlePayment} disabled={paymentSaving || !paymentAmount}>
                  {paymentSaving ? "Recording…" : "Record Payment"}
                </Btn>
              </div>
            </div>
          </Modal>
        )}
        {pendingStatus && (
          <Modal title="Confirm status change" onClose={closeStatusModal} className="max-w-md">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-[#1A202C]">
                {(drawerDetail?.statusName || "No status")} → <strong>{pendingStatus.statusName}</strong>
              </p>


              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Reason</label>
                <textarea
                  value={statusReason}
                  onChange={(e) => {
                    setStatusReason(e.target.value);
                    if (statusReasonError) setStatusReasonError("");
                  }}
                  rows={3}
                  placeholder="Why are you changing this status?"
                  className={`px-3 py-2 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition resize-none ${statusReasonError ? "border-red-400" : "border-[rgba(0,0,0,0.12)]"}`}
                />
                {statusReasonError && <p className="text-xs text-red-600">{statusReasonError}</p>}
              </div>
              <div className="flex gap-2 justify-end">
                <Btn variant="ghost" onClick={closeStatusModal} disabled={statusSaving}>Cancel</Btn>
                <Btn variant="primary" onClick={handleStatusChange} disabled={statusSaving}>
                  {statusSaving ? "Saving…" : "Update Status"}
                </Btn>
              </div>
            </div>
          </Modal>
        )}
        {completeModalItem && (() => {
          const saleAmt = Number(completeModalItem.amount ?? 0);
          const pAmt = completePurchaseAmount === "" ? 0 : Number(completePurchaseAmount);
          const purchaseNum = Number.isFinite(pAmt) ? pAmt : 0;
          const margin = saleAmt - purchaseNum;
          const currency = completeModalItem.currency || "";
          const catalog = services.find((s) => s.serviceName === (completeModalItem.service ?? "").trim());
          const valid = completePurchaseAmount !== "" && Number.isFinite(Number(completePurchaseAmount)) && Number(completePurchaseAmount) >= 0;
          return (
            <Modal title="Complete Service" onClose={() => !completeSaving && setCompleteModalItem(null)} className="max-w-md">
              <div className="flex flex-col gap-4">
                {completeStep === "details" ? (
                  <>
                    <div className="rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F7FAFC] p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-[#1A202C]">{completeModalItem.service}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Pending</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#718096]">Sale amount</span>
                        <span className="font-mono font-semibold text-[#1A202C]">{fmtMoney(saleAmt)} {currency}</span>
                      </div>
                      {catalog && Number(catalog.purchasePrice) > 0 && (
                        <div className="text-[11px] text-[#718096]">
                          Catalog purchase price: <span className="font-mono">{fmtMoney(catalog.purchasePrice)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">
                        Total Purchase Price Spent <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={completePurchaseAmount}
                        onChange={(e) => setCompletePurchaseAmount(e.target.value)}
                        placeholder="0.00"
                        autoFocus
                        className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                      />
                      <p className="text-[11px] text-[#718096]">The purchase amount will be recorded against this service and reflected in the invoice.</p>
                    </div>

                    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${margin > 0 ? "border-emerald-100 bg-emerald-50" : margin < 0 ? "border-red-100 bg-red-50" : "border-[rgba(0,0,0,0.08)] bg-gray-50"}`}>
                      <span className="text-[#718096] font-medium">Margin on this service</span>
                      <span className={`font-mono font-semibold ${margin > 0 ? "text-emerald-600" : margin < 0 ? "text-red-600" : "text-[#1A202C]"}`}>{fmtMoney(margin)}</span>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Btn variant="ghost" onClick={() => setCompleteModalItem(null)} disabled={completeSaving}>Cancel</Btn>
                      <Btn variant="primary" onClick={continueComplete} disabled={!valid}>
                        Continue
                      </Btn>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border border-[rgba(0,0,0,0.08)] overflow-hidden">
                      <div className="px-4 py-2 bg-[#F7FAFC] border-b border-[rgba(0,0,0,0.06)] text-[11px] font-semibold uppercase tracking-wide text-[#718096]">
                        Confirm Completion — {completeModalItem.service}
                      </div>
                      <div className="px-4 py-3 flex flex-col gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#718096]">Sale amount</span>
                          <span className="font-mono font-medium text-[#1A202C]">{fmtMoney(saleAmt)} {currency}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#718096]">Purchase price</span>
                          <span className="font-mono font-medium text-[#1A202C]">{fmtMoney(purchaseNum)} {currency}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.06)] pt-2">
                          <span className="font-semibold text-[#1A202C]">Net margin</span>
                          <span className={`font-mono font-semibold ${margin > 0 ? "text-emerald-600" : margin < 0 ? "text-red-600" : "text-[#1A202C]"}`}>{fmtMoney(margin)} {currency}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
                      <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        This marks the service as completed, records the purchase price above on the invoice, and updates the ledger. This action cannot be undone.
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Btn variant="ghost" onClick={() => setCompleteStep("details")} disabled={completeSaving}>Back</Btn>
                      <Btn variant="primary" onClick={handleCompleteService} disabled={completeSaving}>
                        {completeSaving && <Loader2 size={14} className="animate-spin" />}
                        {completeSaving ? "Completing…" : "Confirm & Complete"}
                      </Btn>
                    </div>
                  </>
                )}
              </div>
            </Modal>
          );
        })()}
      </div>
    );
  }

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
                        title="Print invoice"
                        onClick={() => setPrintInvoice(inv)}
                        className="p-1.5 text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 rounded-lg transition"
                      >
                        <Printer size={14} />
                      </button>
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
          className="max-w-2xl"
        >
          <div className="flex flex-col max-h-[75vh] overflow-y-auto pr-1">
            {/* Invoice header */}
            <div className="flex items-start justify-between px-1 pb-4 mb-4 border-b border-[rgba(0,0,0,0.08)]">
              <div>
                <h2 className="text-2xl font-bold text-[#1A202C] tracking-tight">INVOICE</h2>
                <p className="text-[11px] uppercase tracking-wide text-[#718096] mt-1">Medical Education &amp; Certification Services</p>
              </div>
              <div className="text-right">
                {editing ? (
                  <>
                    <div className="text-sm font-mono font-semibold text-[#1A202C]">{editing.invoiceNo}</div>
                    <div className="text-xs text-[#718096] mt-0.5">{formatDate(editing.dateTime)}</div>
                  </>
                ) : (
                  <div className="text-sm text-[#718096]">New Invoice</div>
                )}
              </div>
            </div>

            {/* Bill to */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Bill To — Applicant</label>
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

            {/* Services */}
            <div className="mt-4 flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Select Services <span className="text-red-500">*</span></label>
              <ServiceMultiSelect
                services={services}
                value={selectedServiceIds}
                onChange={handleServiceSelection}
                placeholder="Search services…"
                allLabel="Clear services"
                required
              />
              {formErrors.service && <p className="text-xs text-red-600">{formErrors.service}</p>}
            </div>

            {/* Line items */}
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Itemized Services</label>
                <button onClick={addLine} className="text-xs font-medium text-[#0E7C7B] hover:underline">+ Add line item</button>
              </div>
              {form.serviceList.length === 0 && (
                <p className="text-xs text-gray-400">No line items yet.</p>
              )}
              <div className="border border-[rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_6.5rem_1.75rem] gap-2 px-3 py-2 bg-[#F7FAFC] text-[10px] font-semibold uppercase tracking-wide text-[#718096]">
                  <span>Service</span><span className="text-right">Price</span><span />
                </div>
                {form.serviceList.map((item, i) => {
                  const matched = services.find((s) => s.serviceName === item.service.trim());
                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="grid grid-cols-[1fr_6.5rem_1.75rem] gap-2 items-center px-3 py-2 border-t border-[rgba(0,0,0,0.06)]">
                        <div className="flex flex-col gap-1">
                          <input
                            value={item.service}
                            onChange={setLineService(i)}
                            placeholder="Type or pick a service"
                            list="invoice-service-options"
                            className="h-9 w-full px-3 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                          />
                          {formErrors[`line-${i}`] && <p className="text-xs text-red-600">{formErrors[`line-${i}`]}</p>}
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={setLineAmount(i)}
                          placeholder="0.00"
                          className={`h-9 w-full px-2 rounded-lg border bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition text-right ${matched ? "text-[#0E7C7B]" : ""}`}
                        />
                        <button
                          onClick={() => removeLine(i)}
                          title="Remove line item"
                          className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition flex-shrink-0 justify-self-end"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {matched && <div className="px-3 pb-1.5 -mt-0.5 text-[11px] text-[#0E7C7B]">Sale price {fmtMoney(matched.salePrice)} — edit if needed</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <datalist id="invoice-service-options">
              {services.map((s) => <option key={s.serviceId} value={s.serviceName} />)}
            </datalist>

            {/* Amount & totals */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Total Amount</label>
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

            {/* Totals */}
            {(derivedBalance !== null || form.amount !== "" || form.paidAmount !== "") && (
              <div className="mt-4 flex flex-col gap-1.5 rounded-lg border border-[rgba(0,0,0,0.08)] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#718096]">Subtotal</span>
                  <span className="font-mono font-medium text-[#1A202C]">{fmtMoney(toNumber(form.amount))}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#718096]">Paid</span>
                  <span className="font-mono font-medium text-emerald-600">- {fmtMoney(toNumber(form.paidAmount))}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.08)] pt-1.5">
                  <span className="font-semibold text-[#1A202C]">Balance Due</span>
                  <span className="font-mono text-lg font-semibold text-[#0E7C7B]">{derivedBalance !== null ? fmtMoney(derivedBalance) : fmtMoney(Math.max(toNumber(form.amount) - toNumber(form.paidAmount), 0))}</span>
                </div>
              </div>
            )}

            {/* Remarks */}
            <div className="mt-4 flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Remarks</label>
              <textarea
                value={form.remarks}
                onChange={setField("remarks")}
                rows={2}
                placeholder="Optional notes"
                className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end border-t border-[rgba(0,0,0,0.08)] mt-5 pt-4">
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

      {printInvoice && (
        <PrintInvoice invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
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
