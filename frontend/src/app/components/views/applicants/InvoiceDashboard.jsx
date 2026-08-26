import { useCallback, useEffect, useState, useMemo } from "react";
import { AlertCircle, DollarSign, TrendingUp, TrendingDown, FileText, Users } from "lucide-react";
import { BouncingDots, Card } from "../../shared/ui";
import { getAllApplicantInvoices } from "../../../../services/applicantInvoiceService";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtMoney(v) {
  return toNumber(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const COLORS = ["#0E7C7B", "#F4A425", "#E53E3E", "#3182CE", "#805AD5"];

function InvoiceDashboardScreen() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllApplicantInvoices()
      .then((data) => { if (!cancelled) setRows(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : "Failed to load."); setRows([]); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => load(), [load]);

  const stats = useMemo(() => {
    const enriched = rows.map((inv) => {
      const list = inv.serviceList ?? [];
      const totalSale = list.reduce((s, i) => s + toNumber(i.amount), 0);
      const totalPurchase = list.reduce((s, i) => s + toNumber(i.purchaseAmount), 0);
      return { ...inv, totalSale, totalPurchase, profit: totalSale - totalPurchase };
    });

    const totalRevenue = enriched.reduce((s, i) => s + i.totalSale, 0);
    const totalPurchase = enriched.reduce((s, i) => s + i.totalPurchase, 0);
    const netProfit = totalRevenue - totalPurchase;
    const totalPaid = enriched.reduce((s, i) => s + toNumber(i.paidAmount), 0);
    const totalOutstanding = enriched.reduce((s, i) => s + toNumber(i.balance), 0);
    const uniqueApplicants = new Set(enriched.map((i) => i.applicantId)).size;

    const paidCount = enriched.filter((i) => toNumber(i.paidAmount) >= toNumber(i.amount) && toNumber(i.amount) > 0).length;
    const partialCount = enriched.filter((i) => toNumber(i.paidAmount) > 0 && toNumber(i.paidAmount) < toNumber(i.amount)).length;
    const unpaidCount = enriched.filter((i) => toNumber(i.paidAmount) <= 0).length;

    const monthlyMap = {};
    enriched.forEach((inv) => {
      if (!inv.dateTime) return;
      const d = new Date(inv.dateTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, purchase: 0, profit: 0, count: 0 };
      monthlyMap[key].revenue += toNumber(inv.totalSale);
      monthlyMap[key].purchase += toNumber(inv.totalPurchase);
      monthlyMap[key].profit += toNumber(inv.profit);
      monthlyMap[key].count += 1;
    });
    const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    const serviceMap = {};
    enriched.forEach((inv) => {
      (inv.serviceList ?? []).forEach((item) => {
        const name = item.service || "Unknown";
        if (!serviceMap[name]) serviceMap[name] = { name, revenue: 0, count: 0 };
        serviceMap[name].revenue += toNumber(item.amount);
        serviceMap[name].count += 1;
      });
    });
    const topServices = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    return { totalRevenue, totalPurchase, netProfit, totalPaid, totalOutstanding, uniqueApplicants, paidCount, partialCount, unpaidCount, monthly, topServices, enriched };
  }, [rows]);

  if (loading) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-[#1A202C]">Invoice Dashboard</h1>
        <BouncingDots label="Loading dashboard…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-5">
        <h1 className="text-xl font-semibold text-[#1A202C]">Invoice Dashboard</h1>
        <Card className="py-10 text-center">
          <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Invoice Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Invoices", value: rows.length, icon: FileText, color: "text-[#0E7C7B]", bg: "bg-teal-50" },
          { label: "Applicants", value: stats.uniqueApplicants, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Revenue", value: fmtMoney(stats.totalRevenue), icon: DollarSign, color: "text-[#0E7C7B]", bg: "bg-teal-50" },
          { label: "Purchase Cost", value: fmtMoney(stats.totalPurchase), icon: TrendingDown, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Net Profit", value: fmtMoney(stats.netProfit), icon: TrendingUp, color: stats.netProfit >= 0 ? "text-emerald-600" : "text-red-600", bg: stats.netProfit >= 0 ? "bg-emerald-50" : "bg-red-50" },
          { label: "Outstanding", value: fmtMoney(stats.totalOutstanding), icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
        ].map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon size={14} className={card.color} />
              </div>
              <div>
                <p className="text-sm text-[#718096] uppercase tracking-wide">{card.label}</p>
                <p className={`text-xs font-semibold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Revenue & Profit Chart */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] uppercase tracking-wide mb-4">Monthly Revenue & Profit</h3>
          {stats.monthly.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#718096" }} />
                <YAxis tick={{ fontSize: 11, fill: "#718096" }} />
                <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#0E7C7B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchase" name="Purchase" fill="#F4A425" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#38A169" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Invoice Status Pie */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] uppercase tracking-wide mb-4">Invoice Status</h3>
          {rows.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Paid", value: stats.paidCount },
                    { name: "Partial", value: stats.partialCount },
                    { name: "Unpaid", value: stats.unpaidCount },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1, 2].map((i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => v + " invoices"} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Services by Revenue */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] uppercase tracking-wide mb-4">Top Services by Revenue</h3>
          {stats.topServices.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.topServices} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#718096" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#718096" }} width={120} />
                <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#0E7C7B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Monthly Profit Trend */}
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#1A202C] uppercase tracking-wide mb-4">Profit Trend</h3>
          {stats.monthly.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#718096" }} />
                <YAxis tick={{ fontSize: 11, fill: "#718096" }} />
                <Tooltip formatter={(v) => fmtMoney(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#0E7C7B" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="purchase" name="Purchase" stroke="#F4A425" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#38A169" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Recent Invoices Table */}
      <Card>
        <div className="px-5 py-3 border-b border-[rgba(0,0,0,0.06)]">
          <h3 className="text-sm font-semibold text-[#1A202C] uppercase tracking-wide">Recent Invoices</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Invoice", "Applicant", "Date", "Revenue", "Profit", "Status"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-sm font-semibold text-[#718096] uppercase tracking-wide whitespace-nowrap ${["Revenue", "Profit"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.enriched.slice(0, 10).map((inv) => {
                const amount = toNumber(inv.amount);
                const paid = toNumber(inv.paidAmount);
                const status = amount > 0 && paid >= amount ? "Paid" : paid <= 0 ? "Unpaid" : "Partial";
                return (
                  <tr key={inv.invoiceId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#718096]">{inv.invoiceNo}</td>
                    <td className="px-4 py-3 text-[#1A202C] font-medium">{(inv.firstName || "") + " " + (inv.lastName || "")}</td>
                    <td className="px-4 py-3 text-[#718096] whitespace-nowrap">{inv.dateTime ? new Date(inv.dateTime).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-[#1A202C]">{fmtMoney(inv.totalSale)}</td>
                    <td className={`px-4 py-3 text-right font-mono text-xs font-medium ${inv.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmtMoney(inv.profit)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium px-1.5 py-0.5 rounded-full ${status === "Paid" ? "bg-emerald-50 text-emerald-700" : status === "Unpaid" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export { InvoiceDashboardScreen };
