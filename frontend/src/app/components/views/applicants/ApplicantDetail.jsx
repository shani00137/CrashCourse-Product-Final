import { useEffect, useState } from "react";
import {
  ArrowRight, Upload, Eye, CheckCircle, Clock, Phone, Mail, MapPin, Hash, Calendar, FileText, AlertCircle,
} from "lucide-react";
import { Avatar, Btn, BouncingDots, Card, StatusBadge } from "../../shared/ui";
import { getApplicantInvoice } from "../../../../services/applicantInvoiceService";

export function ApplicantDetailScreen({ applicant, onBack, onEdit, onToggleActive, onManageInvoices }) {
  const [activeTab, setActiveTab] = useState("documents");
  const [toggling, setToggling] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);
  const docs = [
    { name: "Degree Certificate", status: "Uploaded" },
    { name: "Matric Certificate", status: "Uploaded" },
    { name: "Passport Copy", status: "Review" },
    { name: "Personal Photo", status: "Uploaded" },
    { name: "Experience Letter", status: "Pending" },
    { name: "Medical License", status: "Pending" },
    { name: "Good Standing Letter", status: "Uploaded" },
  ];

  const name = applicant ? `${applicant.firstName} ${applicant.lastName}` : "Applicant";
  const initials = applicant
    ? ((applicant.firstName?.[0] ?? "") + (applicant.lastName?.[0] ?? "")).toUpperCase() || "NA"
    : "NA";
  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  useEffect(() => {
    if (!applicant?.applicantId) return;
    let cancelled = false;
    setInvoicesLoading(true);
    setInvoicesError(null);
    getApplicantInvoice(applicant.applicantId)
      .then((data) => {
        if (cancelled) return;
        setInvoices(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setInvoicesError(err instanceof Error ? err.message : "Failed to load invoices.");
        setInvoices([]);
      })
      .finally(() => {
        if (!cancelled) setInvoicesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [applicant?.applicantId]);

  const invoiceStatus = (inv) => {
    const amount = Number(inv.amount) || 0;
    const paid = Number(inv.paidAmount) || 0;
    if (amount > 0 && paid >= amount) return "Paid";
    if (paid <= 0) return "Unpaid";
    return "Partial";
  };
  const money = (v) => (Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleToggle = async () => {
    if (!applicant || toggling) return;
    setToggling(true);
    try {
      await onToggleActive(applicant);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Applicant Detail</h1>
        <Btn variant="outline" icon={<ArrowRight size={14} className="rotate-180" />} onClick={onBack}>Back to list</Btn>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Left profile card */}
        <Card className="p-6 flex flex-col items-center text-center gap-4">
          <Avatar initials={initials} size="lg" />
          <div>
            <h2 className="text-base font-semibold text-[#1A202C]">{name}</h2>
            <p className="font-mono text-xs text-[#718096] mt-0.5">{applicant?.registrationNo ?? applicant?.applicantId ?? "—"}</p>
          </div>
          <StatusBadge status={applicant?.isActive ? "Active" : "Expired"} />
          <div className="w-full border-t border-[rgba(0,0,0,0.06)] pt-4 flex flex-col gap-3 text-sm text-left">
            {[
              { icon: Phone, value: applicant?.mobile ?? "—" },
              { icon: Mail, value: applicant?.email ?? "—" },
              { icon: MapPin, value: applicant?.address ?? "—" },
              { icon: Hash, value: `${applicant?.coutryName ?? "—"} · ${applicant?.courseMD?.courseName ?? "—"}` },
              { icon: Calendar, value: `Registered: ${fmt(applicant?.registrationDate)}` },
              { icon: Clock, value: `Expires: ${fmt(applicant?.expiryDate)}` },
            ].map(({ icon: Icon, value }) => (
              <div key={value} className="flex items-center gap-2.5 text-[#718096]">
                <Icon size={13} className="text-[#0E7C7B] flex-shrink-0" />
                <span className="text-xs">{value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 w-full">
            <Btn variant="outline" className="flex-1 justify-center text-xs" onClick={() => applicant && onEdit(applicant)}>Edit</Btn>
            <Btn variant={applicant?.isActive ? "danger" : "primary"} className="flex-1 justify-center text-xs" onClick={handleToggle} disabled={!applicant || toggling}>
              {toggling ? "…" : applicant?.isActive ? "Block" : "Activate"}
            </Btn>
          </div>
        </Card>

        {/* Right tabs */}
        <div className="col-span-2 flex flex-col gap-4">
          <Card>
            <div className="flex border-b border-[rgba(0,0,0,0.06)]">
              {["documents", "courses", "ledger", "invoices"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium capitalize transition border-b-2 -mb-px ${activeTab === tab ? "border-[#0E7C7B] text-[#0E7C7B]" : "border-transparent text-[#718096] hover:text-[#1A202C]"}`}>
                  {tab === "courses" ? "Courses & Exams" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === "documents" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-[#718096]">Document verification checklist</p>
                    <Btn variant="outline" icon={<Upload size={13} />} className="text-xs">Upload</Btn>
                  </div>
                  {docs.map(d => (
                    <div key={d.name} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#F7FAFC] transition">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${d.status === "Uploaded" ? "bg-emerald-50" : d.status === "Review" ? "bg-blue-50" : "bg-amber-50"}`}>
                          {d.status === "Uploaded" ? <CheckCircle size={14} className="text-emerald-600" /> :
                           d.status === "Review" ? <Eye size={14} className="text-blue-600" /> :
                           <Clock size={14} className="text-amber-600" />}
                        </div>
                        <span className="text-sm text-[#1A202C]">{d.name}</span>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "courses" && (
                <div className="flex flex-col gap-3">
                  {[
                    { course: "MDS-101 Medical Dental Science", enrolled: "2024-10-01", exam: "2024-10-15", score: "87.5%", status: "Passed" },
                    { course: "HCM-201 Healthcare Management", enrolled: "2024-10-01", exam: "Pending", score: "—", status: "Pending" },
                  ].map(c => (
                    <div key={c.course} className="p-4 rounded-xl border border-[rgba(0,0,0,0.08)] hover:border-[#0E7C7B]/30 transition">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#1A202C]">{c.course}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="flex gap-6 text-xs text-[#718096]">
                        <span>Enrolled: {c.enrolled}</span>
                        <span>Exam: {c.exam}</span>
                        <span className="font-semibold text-[#1A202C]">Score: {c.score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "ledger" && (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-[rgba(0,0,0,0.06)]">
                    {["Date", "Description", "Debit (AED)", "Credit (AED)", "Balance"].map(h => (
                      <th key={h} className="text-left pb-2 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {[
                      { date: "01 Oct", desc: "Registration Fee", debit: "1,500", credit: "—", bal: "1,500" },
                      { date: "05 Oct", desc: "Payment Received", debit: "—", credit: "1,500", bal: "0" },
                      { date: "10 Oct", desc: "Exam Fee MDS-101", debit: "800", credit: "—", bal: "800" },
                    ].map(r => (
                      <tr key={r.date} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC]">
                        <td className="py-2.5 text-[#718096]">{r.date}</td>
                        <td className="py-2.5 text-[#1A202C]">{r.desc}</td>
                        <td className="py-2.5 text-red-600 font-mono text-xs text-right">{r.debit}</td>
                        <td className="py-2.5 text-emerald-600 font-mono text-xs text-right">{r.credit}</td>
                        <td className="py-2.5 font-mono text-xs text-right text-[#1A202C] font-medium">{r.bal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {activeTab === "invoices" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-[#718096]">
                      {invoicesLoading ? "Loading invoices…" : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
                    </p>
                    <Btn variant="outline" className="text-xs" onClick={() => applicant && onManageInvoices?.(applicant)}>
                      Manage invoices
                    </Btn>
                  </div>
                  {invoicesLoading && <BouncingDots label="Loading invoices…" />}
                  {!invoicesLoading && invoicesError && (
                    <div className="py-8 text-center">
                      <AlertCircle size={26} className="mx-auto text-red-400 mb-2" />
                      <p className="text-sm text-red-600 font-medium">{invoicesError}</p>
                    </div>
                  )}
                  {!invoicesLoading && !invoicesError && invoices.length === 0 && (
                    <div className="py-10 text-center">
                      <FileText size={30} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-[#718096] font-medium">No invoices yet</p>
                    </div>
                  )}
                  {!invoicesLoading && !invoicesError && invoices.map(inv => (
                    <div key={inv.invoiceId} className="flex items-center justify-between p-3 rounded-xl border border-[rgba(0,0,0,0.07)] hover:border-[#0E7C7B]/30 transition">
                      <div>
                        <p className="text-sm font-medium text-[#1A202C] font-mono">{inv.invoiceNo}</p>
                        <p className="text-xs text-[#718096]">{inv.service || "—"} · {fmt(inv.dateTime)}</p>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#1A202C]">{inv.currency} {money(inv.amount)}</p>
                          <p className="text-xs text-[#718096]">Bal: {money(inv.balance)}</p>
                        </div>
                        <StatusBadge status={invoiceStatus(inv)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
