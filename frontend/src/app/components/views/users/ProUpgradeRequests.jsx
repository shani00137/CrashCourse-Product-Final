import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Crown, RefreshCw, Search, X } from "lucide-react";
import { Avatar, BouncingDots, Btn, Card, Modal, StatusBadge } from "../../shared/ui";
import {
  getProUpgradeRequests,
  approveProUpgrade,
  rejectProUpgrade,
} from "../../../../services/proUpgradeService";

const FILTERS = ["All", "Pending", "Approved", "Rejected"];

const fmtDateTime = (v) => (v ? new Date(v).toLocaleString() : "—");
const fmtDay = (v) => (v ? String(v).slice(0, 10) : "—");
const displayName = (r) =>
  `${r.firstName ?? ""} ${r.lastName ?? ""}`.trim() || r.userName || "—";
const initials = (r) =>
  (((r.firstName?.[0] ?? "") + (r.lastName?.[0] ?? "")).toUpperCase()) ||
  (r.userName?.[0] ?? "").toUpperCase() ||
  "NA";

/** Trial when registration→expiry is ~5 days and not yet expired (same rule the app uses). */
function planOf(r) {
  const start = r.registrationDate ? new Date(r.registrationDate).getTime() : NaN;
  const end = r.expiryDate ? new Date(r.expiryDate).getTime() : NaN;
  if (Number.isNaN(start) || Number.isNaN(end)) return "—";
  if (Date.now() >= end) return "Expired";
  const spanDays = (end - start) / (24 * 60 * 60 * 1000);
  return spanDays <= 6 ? "Trial" : "Pro";
}

/**
 * Admin approval queue for "upgrade to Pro" requests sent by trial users in
 * the mobile app. The user's plan NEVER changes until the owner clicks
 * Approve here — approval is handled by ProUpgradeRequest/Approve, which
 * extends the expiry (the app then reads the account as Pro).
 */
export function ProUpgradeRequestsScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [approveTarget, setApproveTarget] = useState(null);
  const [approveMonths, setApproveMonths] = useState(12);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);

  const closeTimer = useRef(null);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getProUpgradeRequests(filter)
      .then((res) => {
        if (cancelled) return;
        setRows(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load upgrade requests.");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [filter]);

  useEffect(() => load(), [load]);

  function closeActionModals() {
    setApproveTarget(null);
    setRejectTarget(null);
    setActionError("");
  }

  async function handleApprove() {
    if (!approveTarget) return;
    setActionBusy(true);
    setActionError("");
    try {
      const res = await approveProUpgrade({
        proUpgradeRequestId: approveTarget.proUpgradeRequestId,
        months: Number(approveMonths) || 12,
      });
      if (res && typeof res === "object" && res.succeeded !== false) {
        setMessage(`${displayName(approveTarget)} is now Pro (${approveMonths} months). The user was emailed.`);
        setApproveTarget(null);
        load();
      } else {
        setActionError(
          res && typeof res.message === "string" && res.message
            ? res.message
            : "Failed to approve the request."
        );
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to approve the request.");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setActionBusy(true);
    setActionError("");
    try {
      const res = await rejectProUpgrade({
        proUpgradeRequestId: rejectTarget.proUpgradeRequestId,
      });
      if (res && typeof res === "object" && res.succeeded !== false) {
        setMessage(`Request from ${displayName(rejectTarget)} rejected. Plan unchanged.`);
        setRejectTarget(null);
        load();
      } else {
        setActionError(
          res && typeof res.message === "string" && res.message
            ? res.message
            : "Failed to reject the request."
        );
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to reject the request.");
    } finally {
      setActionBusy(false);
    }
  }

  const q = search.trim().toLowerCase();
  const visible = q
    ? rows.filter((r) =>
        [r.firstName, r.lastName, r.userName, r.email, r.mobile, r.course]
          .map((v) => (v ?? "").toString().toLowerCase())
          .some((v) => v.includes(q))
      )
    : rows;
  const pendingCount = rows.filter((r) => r.status === "Pending").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-[#1A202C]">Pro Upgrade Requests</h1>
          <p className="text-xs text-[#718096] mt-1">
            Trial users request Pro from the app — the plan changes only after you approve it here.
          </p>
        </div>
        <Btn variant="outline" icon={<RefreshCw size={14} />} onClick={() => load()}>
          Refresh
        </Btn>
      </div>

      {message && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2">
          {message}
        </div>
      )}

      {/* Status filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => {
          const active = filter === f;
          const count = f === "All" ? rows.length : rows.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => { setFilter(f); setMessage(""); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                active
                  ? "bg-[#C41E3A] text-white border-[#C41E3A]"
                  : "bg-white text-[#4A5568] border-[rgba(0,0,0,0.12)] hover:border-[#C41E3A]"
              }`}
            >
              {f}
              {f === "Pending" && pendingCount > 0 && !active ? ` (${pendingCount})` : ""}
            </button>
          );
        })}
        <div className="relative ml-auto">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, username, email…"
            className="h-9 w-64 pl-9 pr-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A] transition"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["User", "Username", "Email", "Course", "Current Plan", "Requested On", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.proUpgradeRequestId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar initials={initials(r)} />
                      <div className="flex flex-col">
                        <span className="font-medium text-[#1A202C]">{displayName(r)}</span>
                        <span className="text-xs text-[#718096]">{r.mobile || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{r.userName || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#718096] max-w-48 truncate">{r.email || "—"}</td>
                  <td className="px-4 py-3 text-xs text-[#718096] max-w-40 truncate">{r.course || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      planOf(r) === "Trial"
                        ? "bg-amber-50 text-amber-700"
                        : planOf(r) === "Pro"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {planOf(r) === "Trial" ? "Trial" : planOf(r) === "Pro" ? "Pro" : planOf(r)}
                    </span>
                    <span className="block text-[10px] text-[#A0AEC0] mt-0.5">exp: {fmtDay(r.expiryDate)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#718096] font-mono">{fmtDateTime(r.requestedOn)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status || "Pending"} />
                    {r.resolvedOn && (
                      <span className="block text-[10px] text-[#A0AEC0] mt-0.5">{fmtDay(r.resolvedOn)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "Pending" ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setActionError(""); setApproveMonths(12); setApproveTarget(r); }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Approve — activate Pro for this user"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => { setActionError(""); setRejectTarget(r); }}
                          className="p-1.5 text-[#C41E3A] hover:bg-red-50 rounded-lg transition"
                          title="Reject — plan stays unchanged"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#A0AEC0]">
                        {r.status === "Approved" ? `+${r.approvedMonths ?? 12} mo` : "No change"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <BouncingDots label="Loading upgrade requests…" />}
          {!loading && error && (
            <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
            </div>
          )}
          {!loading && !error && visible.length === 0 && (
            <div className="py-16 text-center">
              <Crown size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No {filter !== "All" ? filter.toLowerCase() + " " : ""}requests found</p>
              <p className="text-xs text-gray-400 mt-1">
                {search.trim() ? "Try clearing your search" : "Requests sent by trial users in the app appear here."}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── Approve modal ─────────────────────────────────────── */}
      {approveTarget && (
        <Modal
          title="Approve Pro Upgrade"
          onClose={() => { if (!actionBusy) closeActionModals(); }}
          className="max-w-lg"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Avatar initials={initials(approveTarget)} size="md" />
              <div>
                <p className="text-sm font-semibold text-[#1A202C]">{displayName(approveTarget)}</p>
                <p className="text-xs text-[#718096]">{approveTarget.email || approveTarget.userName}</p>
              </div>
            </div>

            <div className="rounded-lg bg-[#F7FAFC] border border-[rgba(0,0,0,0.07)] px-3 py-2.5 text-xs text-[#4A5568] flex flex-col gap-1">
              <span>Current plan: <b>{planOf(approveTarget)}</b> · expires {fmtDay(approveTarget.expiryDate)}</span>
              <span>Course: {approveTarget.course || "—"}</span>
              <span>Requested: {fmtDateTime(approveTarget.requestedOn)}</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">
                Pro plan duration
              </label>
              <select
                value={approveMonths}
                onChange={(e) => setApproveMonths(Number(e.target.value))}
                className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A] transition appearance-none"
              >
                <option value={1}>1 month</option>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>

            <p className="text-xs text-[#718096] leading-relaxed">
              Approving extends this user's expiry by the selected duration — the app then reads the
              account as <b>Pro</b>. The user receives a confirmation email.
            </p>

            {actionError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} /> {actionError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={closeActionModals} disabled={actionBusy}>
                Cancel
              </Btn>
              <Btn variant="primary" onClick={handleApprove} disabled={actionBusy} icon={<Check size={14} />}>
                {actionBusy ? "Approving…" : `Approve ${approveMonths} mo`}
              </Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Reject modal ──────────────────────────────────────── */}
      {rejectTarget && (
        <Modal
          title="Reject Upgrade Request"
          onClose={() => { if (!actionBusy) closeActionModals(); }}
          className="max-w-md"
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#4A5568] leading-relaxed">
              Reject the upgrade request from <b>{displayName(rejectTarget)}</b>? Their plan stays
              unchanged (they remain on trial) and they receive a notification email.
            </p>
            {actionError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                <AlertCircle size={14} /> {actionError}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={closeActionModals} disabled={actionBusy}>
                Cancel
              </Btn>
              <Btn variant="danger" onClick={handleReject} disabled={actionBusy} icon={<X size={14} />}>
                {actionBusy ? "Rejecting…" : "Reject Request"}
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
