import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, FileText, TrendingUp, TrendingDown, DollarSign, Search, X, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Btn, BouncingDots, Card } from "../../shared/ui";
import { getAllApplicantInvoices } from "../../../../services/applicantInvoiceService";
import { useServices } from "../../../../hooks/useLookups";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(v) {
  return toNumber(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ProfitLossScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [detailInv, setDetailInv] = useState(null);
  const pageSize = 15;

  const { services } = useServices();

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllApplicantInvoices()
      .then((data) => {
        if (cancelled) return;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load invoices.");
        setRows([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);

  const enriched = rows.map((inv) => {
    const list = inv.serviceList ?? [];
    const totalSale = list.reduce((s, i) => s + toNumber(i.amount), 0);
    const totalPurchase = list.reduce((s, i) => s + toNumber(i.purchaseAmount), 0);
    return { ...inv, totalSale, totalPurchase, profit: totalSale - totalPurchase };
  });

  const filtered = enriched.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (inv.invoiceNo ?? "").toLowerCase().includes(q) ||
      ((inv.firstName ?? "") + " " + (inv.lastName ?? "")).toLowerCase().includes(q) ||
      (inv.service ?? "").toLowerCase().includes(q)
    );
  });

  const totalSaleAll = enriched.reduce((s, i) => s + i.totalSale, 0);
  const totalPurchaseAll = enriched.reduce((s, i) => s + i.totalPurchase, 0);
  const totalProfitAll = enriched.reduce((s, i) => s + i.profit, 0);
  const totalPaidAll = enriched.reduce((s, i) => s + toNumber(i.paidAmount), 0);
  const totalOutstanding = enriched.reduce((s, i) => s + toNumber(i.balance), 0);

  const currencyBreakdown = useMemo(() => {
    const map = {};
    enriched.forEach((inv) => {
      const cur = inv.currency || "AED";
      if (!map[cur]) map[cur] = { currency: cur, revenue: 0, purchase: 0, profit: 0, paid: 0, outstanding: 0, count: 0 };
      map[cur].revenue += inv.totalSale;
      map[cur].purchase += inv.totalPurchase;
      map[cur].profit += inv.profit;
      map[cur].paid += toNumber(inv.paidAmount);
      map[cur].outstanding += toNumber(inv.balance);
      map[cur].count += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [enriched]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  useEffect(() => { setPage(1); }, [search]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1000,height=700");
    if (!printWindow) return;

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    let currencyRows = "";
    currencyBreakdown.forEach((row) => {
      currencyRows += `
        <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
          <td style="padding:10px 12px;font-weight:600">${row.currency}</td>
          <td style="padding:10px 12px;text-align:center;color:#718096">${row.count}</td>
          <td style="padding:10px 12px;text-align:right;font-family:monospace">${fmtMoney(row.revenue)}</td>
          <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#c05621">${fmtMoney(row.purchase)}</td>
          <td style="padding:10px 12px;text-align:right;font-family:monospace;font-weight:600;color:${row.profit >= 0 ? "#059669" : "#dc2626"}">${fmtMoney(row.profit)}</td>
          <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#2563eb">${fmtMoney(row.paid)}</td>
          <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#dc2626">${fmtMoney(row.outstanding)}</td>
        </tr>`;
    });

    let invoiceRows = "";
    enriched.forEach((inv, idx) => {
      invoiceRows += `
        <tr style="border-bottom:1px solid rgba(0,0,0,0.04)">
          <td style="padding:8px 12px;color:#718096">${idx + 1}</td>
          <td style="padding:8px 12px;font-weight:500">${inv.invoiceNo ?? "—"}</td>
          <td style="padding:8px 12px">${(inv.firstName ?? "") + " " + (inv.lastName ?? "")}</td>
          <td style="padding:8px 12px">${inv.service ?? ""}</td>
          <td style="padding:8px 12px">${inv.currency ?? ""}</td>
          <td style="padding:8px 12px;text-align:right;font-family:monospace">${fmtMoney(inv.totalSale)}</td>
          <td style="padding:8px 12px;text-align:right;font-family:monospace;color:#c05621">${fmtMoney(inv.totalPurchase)}</td>
          <td style="padding:8px 12px;text-align:right;font-family:monospace;font-weight:500;color:${inv.profit >= 0 ? "#059669" : "#dc2626"}">${fmtMoney(inv.profit)}</td>
          <td style="padding:8px 12px;text-align:right;font-family:monospace;color:#2563eb">${fmtMoney(toNumber(inv.paidAmount))}</td>
          <td style="padding:8px 12px;text-align:right;font-family:monospace;color:#dc2626">${fmtMoney(toNumber(inv.balance))}</td>
        </tr>`;
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Profit & Loss Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 30px; color: #1a202c; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #0E7C7B; }
          .header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          .header p { font-size: 12px; color: #718096; }
          .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 28px; }
          .summary-card { background: #f7fafc; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; padding: 14px; text-align: center; }
          .summary-card .label { font-size: 10px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px; margin-bottom: 4px; }
          .summary-card .value { font-size: 16px; font-weight: 700; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid rgba(0,0,0,0.08); }
          table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px; }
          th { background: #f7fafc; text-transform: uppercase; font-size: 10px; color: #718096; letter-spacing: 0.5px; text-align: left; padding: 10px 12px; border-bottom: 2px solid rgba(0,0,0,0.08); }
          th:last-child, td:last-child { text-align: right; }
          .footer { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
          .signature { text-align: center; padding-top: 60px; border-top: 1px solid #cbd5e0; font-size: 12px; color: #718096; }
          @media print {
            body { padding: 15px; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Profit & Loss Report</h1>
          <p>Generated on ${dateStr}</p>
        </div>

        <div class="summary">
          <div class="summary-card"><div class="label">Total Revenue</div><div class="value" style="color:#0E7C7B">${fmtMoney(totalSaleAll)}</div></div>
          <div class="summary-card"><div class="label">Total Purchase</div><div class="value" style="color:#c05621">${fmtMoney(totalPurchaseAll)}</div></div>
          <div class="summary-card"><div class="label">Net Profit</div><div class="value" style="color:${totalProfitAll >= 0 ? "#059669" : "#dc2626"}">${fmtMoney(totalProfitAll)}</div></div>
          <div class="summary-card"><div class="label">Total Paid</div><div class="value" style="color:#2563eb">${fmtMoney(totalPaidAll)}</div></div>
          <div class="summary-card"><div class="label">Outstanding</div><div class="value" style="color:#dc2626">${fmtMoney(totalOutstanding)}</div></div>
        </div>

        ${currencyBreakdown.length > 0 ? `
        <div class="section-title">Profit by Currency</div>
        <table>
          <thead><tr>
            <th>Currency</th><th style="text-align:center">Invoices</th><th style="text-align:right">Revenue</th><th style="text-align:right">Purchase</th><th style="text-align:right">Profit</th><th style="text-align:right">Paid</th><th style="text-align:right">Outstanding</th>
          </tr></thead>
          <tbody>${currencyRows}</tbody>
          <tfoot><tr style="border-top:2px solid rgba(0,0,0,0.08);font-weight:700">
            <td style="padding:10px 12px">Total</td>
            <td style="padding:10px 12px;text-align:center;color:#718096">${enriched.length}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace">${fmtMoney(totalSaleAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#c05621">${fmtMoney(totalPurchaseAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:${totalProfitAll >= 0 ? "#059669" : "#dc2626"}">${fmtMoney(totalProfitAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#2563eb">${fmtMoney(totalPaidAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#dc2626">${fmtMoney(totalOutstanding)}</td>
          </tr></tfoot>
        </table>` : ""}

        <div class="section-title">Invoice Details</div>
        <table>
          <thead><tr>
            <th>#</th><th>Invoice No</th><th>Customer</th><th>Service</th><th>Currency</th><th style="text-align:right">Revenue</th><th style="text-align:right">Purchase</th><th style="text-align:right">Profit</th><th style="text-align:right">Paid</th><th style="text-align:right">Outstanding</th>
          </tr></thead>
          <tbody>${invoiceRows}</tbody>
          <tfoot><tr style="border-top:2px solid rgba(0,0,0,0.08);font-weight:700">
            <td colspan="5" style="padding:10px 12px">Total</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace">${fmtMoney(totalSaleAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#c05621">${fmtMoney(totalPurchaseAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:${totalProfitAll >= 0 ? "#059669" : "#dc2626"}">${fmtMoney(totalProfitAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#2563eb">${fmtMoney(totalPaidAll)}</td>
            <td style="padding:10px 12px;text-align:right;font-family:monospace;color:#dc2626">${fmtMoney(totalOutstanding)}</td>
          </tr></tfoot>
        </table>

        <div class="footer">
          <div class="signature">Prepared by</div>
          <div class="signature">Authorized by</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 400);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Profit & Loss</h1>
        <Btn variant="primary" onClick={handlePrint} disabled={enriched.length === 0} className="flex items-center gap-2">
          <Printer size={14} /> Print Report
        </Btn>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Revenue", value: fmtMoney(totalSaleAll), icon: DollarSign, color: "text-[#0E7C7B]", bg: "bg-teal-50" },
          { label: "Total Purchase", value: fmtMoney(totalPurchaseAll), icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Net Profit", value: fmtMoney(totalProfitAll), icon: TrendingUp, color: totalProfitAll >= 0 ? "text-emerald-600" : "text-red-600", bg: totalProfitAll >= 0 ? "bg-emerald-50" : "bg-red-50" },
          { label: "Total Paid", value: fmtMoney(totalPaidAll), icon: DollarSign, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Outstanding", value: fmtMoney(totalOutstanding), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
              <div>
                <p className="text-sm text-[#718096] uppercase tracking-wide">{card.label}</p>
                <p className={`text-xs font-semibold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Currency-wise Profit */}
      {currencyBreakdown.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] uppercase tracking-wide mb-4">Profit by Currency</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-sm uppercase text-[#718096] border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left py-2 px-3">Currency</th>
                  <th className="text-right py-2 px-3">Invoices</th>
                  <th className="text-right py-2 px-3">Revenue</th>
                  <th className="text-right py-2 px-3">Purchase</th>
                  <th className="text-right py-2 px-3">Profit</th>
                  <th className="text-right py-2 px-3">Paid</th>
                  <th className="text-right py-2 px-3">Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {currencyBreakdown.map((row) => (
                  <tr key={row.currency} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-md bg-teal-50 flex items-center justify-center text-sm font-bold text-[#0E7C7B]">{row.currency[0]}</span>
                        <span className="font-semibold text-[#1A202C]">{row.currency}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-[#718096]">{row.count}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-[#1A202C]">{fmtMoney(row.revenue)}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-orange-600">{fmtMoney(row.purchase)}</td>
                    <td className={`py-3 px-3 text-right font-mono text-xs font-medium ${row.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(row.profit)}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-blue-600">{fmtMoney(row.paid)}</td>
                    <td className="py-3 px-3 text-right font-mono text-xs text-red-600">{fmtMoney(row.outstanding)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[rgba(0,0,0,0.08)] bg-[#F7FAFC]">
                  <td className="py-3 px-3 font-semibold text-[#1A202C]">Total</td>
                  <td className="py-3 px-3 text-right text-[#718096]">{enriched.length}</td>
                  <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-[#1A202C]">{fmtMoney(totalSaleAll)}</td>
                  <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-orange-600">{fmtMoney(totalPurchaseAll)}</td>
                  <td className={`py-3 px-3 text-right font-mono text-xs font-semibold ${totalProfitAll >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(totalProfitAll)}</td>
                  <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-blue-600">{fmtMoney(totalPaidAll)}</td>
                  <td className="py-3 px-3 text-right font-mono text-xs font-semibold text-red-600">{fmtMoney(totalOutstanding)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="p-4">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice, applicant, or service…"
            className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-xs focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
        </div>
      </Card>

      {/* Detail Modal */}
      {detailInv && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setDetailInv(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#1A202C]">{detailInv.invoiceNo}</h2>
                <p className="text-xs text-[#718096]">{(detailInv.firstName || "") + " " + (detailInv.lastName || "")}</p>
              </div>
              <button onClick={() => setDetailInv(null)} className="p-1.5 rounded-lg text-[#718096] hover:bg-gray-100"><X size={16} /></button>
            </div>
            <table className="w-full text-xs mb-4">
              <thead>
                <tr className="text-sm uppercase text-[#718096] border-b border-[rgba(0,0,0,0.06)]">
                  <th className="text-left py-2">Service</th>
                  <th className="text-right py-2">Sale</th>
                  <th className="text-right py-2">Purchase</th>
                  <th className="text-right py-2">Profit</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {(detailInv.serviceList ?? []).map((item, i) => {
                  const sale = toNumber(item.amount);
                  const purchase = toNumber(item.purchaseAmount);
                  return (
                    <tr key={i} className="border-b border-[rgba(0,0,0,0.04)]">
                      <td className="py-2 text-[#1A202C]">{item.service}</td>
                      <td className="py-2 text-right font-mono">{fmtMoney(sale)}</td>
                      <td className="py-2 text-right font-mono">{fmtMoney(purchase)}</td>
                      <td className={`py-2 text-right font-mono ${sale - purchase >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(sale - purchase)}</td>
                      <td className="py-2 text-center">
                        <span className={`text-sm font-medium px-1.5 py-0.5 rounded-full ${item.isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                          {item.isCompleted ? "Completed" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-teal-50 p-3">
                <p className="text-sm text-[#718096] uppercase">Revenue</p>
                <p className="text-xs font-semibold text-[#0E7C7B]">{fmtMoney(detailInv.totalSale)}</p>
              </div>
              <div className="rounded-lg bg-orange-50 p-3">
                <p className="text-sm text-[#718096] uppercase">Purchase</p>
                <p className="text-xs font-semibold text-orange-600">{fmtMoney(detailInv.totalPurchase)}</p>
              </div>
              <div className={`rounded-lg p-3 ${detailInv.profit >= 0 ? "bg-emerald-50" : "bg-red-50"}`}>
                <p className="text-sm text-[#718096] uppercase">Profit</p>
                <p className={`text-xs font-semibold ${detailInv.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(detailInv.profit)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Invoice No", "Applicant", "Date", "Revenue", "Purchase", "Profit", "Paid", "Balance", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-sm font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap ${["Revenue", "Purchase", "Profit", "Paid", "Balance"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((inv) => (
                <tr key={inv.invoiceId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{inv.invoiceNo}</td>
                  <td className="px-4 py-3 text-[#1A202C] font-medium">{(inv.firstName || "") + " " + (inv.lastName || "")}</td>
                  <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{inv.dateTime ? new Date(inv.dateTime).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-[#1A202C]">{fmtMoney(inv.totalSale)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-orange-600">{fmtMoney(inv.totalPurchase)}</td>
                  <td className={`px-4 py-3 text-right font-mono text-xs font-medium ${inv.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(inv.profit)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-blue-600">{fmtMoney(inv.paidAmount)}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-red-600">{fmtMoney(inv.balance)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDetailInv(inv)} className="text-xs font-medium text-[#0E7C7B] hover:underline">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <BouncingDots label="Loading…" />}
          {!loading && error && (
            <div className="py-10 text-center">
              <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="py-16 text-center">
              <FileText size={36} className="mx-auto text-gray-300 mb-3" />
              <p className="text-[#718096] font-medium">No invoices found</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <span className="text-xs text-[#718096]">
            {loading ? "Loading…" : filtered.length === 0 ? "No results" : `Showing ${start + 1}–${Math.min(start + pageSize, filtered.length)} of ${filtered.length}`}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(safePage - 1)} disabled={safePage <= 1} className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} className="mx-auto" /></button>
            <span className="px-2 text-xs text-[#718096] whitespace-nowrap">Page {safePage} of {totalPages}</span>
            <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages} className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} className="mx-auto" /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export { ProfitLossScreen };
