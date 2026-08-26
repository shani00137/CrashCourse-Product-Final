import { X } from "lucide-react";
import { Btn } from "../../shared/ui";

function PrintInvoice({ invoice, onClose }) {
  if (!invoice) return null;

  const serviceList = invoice.serviceList ?? [];
  const totalSale = serviceList.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const totalPurchase = serviceList.reduce((s, i) => s + (Number(i.purchaseAmount) || 0), 0);
  const profit = totalSale - totalPurchase;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=800,height=1000");
    let serviceRows = "";
    serviceList.forEach((item, i) => {
      const statusColor = item.isCompleted ? "#059669" : "#d97706";
      const statusBg = item.isCompleted ? "#ecfdf5" : "#fffbeb";
      const statusText = item.isCompleted ? "Completed" : "Pending";
      serviceRows += `
        <tr style="border-bottom:1px solid rgba(0,0,0,0.06)">
          <td style="padding:10px 14px">${i + 1}</td>
          <td style="padding:10px 14px">${item.service || "—"}</td>
          <td style="padding:10px 14px;text-align:right;font-family:monospace">${Number(item.amount || 0).toFixed(2)}</td>
          <td style="padding:10px 14px;text-align:center">
            <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:20px;background:${statusBg};color:${statusColor};font-size:11px;font-weight:600">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${statusColor}"></span>
              ${statusText}
            </span>
          </td>
        </tr>`;
    });

    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice ${invoice.invoiceNo}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a1a; padding: 40px; }
    .invoice-container { max-width: 750px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #0E7C7B; padding-bottom: 20px; }
    .company-name { font-size: 24px; font-weight: 700; color: #0E7C7B; letter-spacing: -0.5px; }
    .company-sub { font-size: 11px; color: #718096; margin-top: 4px; }
    .invoice-title { font-size: 28px; font-weight: 700; color: #1a1a1a; text-align: right; }
    .invoice-no { font-size: 13px; color: #718096; margin-top: 4px; text-align: right; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .info-box { background: #f7fafc; border-radius: 8px; padding: 16px; border: 1px solid rgba(0,0,0,0.06); }
    .info-label { font-size: 10px; font-weight: 600; color: #718096; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .info-value { font-size: 13px; color: #1a1a1a; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #0E7C7B; color: white; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 14px; text-align: left; }
    th:last-child, th:nth-child(3) { text-align: right; }
    th:nth-child(4) { text-align: center; }
    td { padding: 10px 14px; font-size: 13px; border-bottom: 1px solid rgba(0,0,0,0.06); }
    td:last-child, td:nth-child(3) { text-align: right; font-family: 'Courier New', monospace; }
    tr:nth-child(even) { background: #f7fafc; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 30px; }
    .totals-box { width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
    .totals-row.total { border-top: 2px solid #0E7C7B; font-weight: 700; font-size: 15px; padding-top: 12px; margin-top: 4px; }
    .totals-row .label { color: #718096; }
    .totals-row .value { font-family: 'Courier New', monospace; color: #1a1a1a; }
    .footer { margin-top: 40px; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 20px; }
    .signature-section { display: flex; justify-content: space-between; margin-top: 30px; }
    .signature-box { width: 200px; }
    .signature-line { border-top: 1px solid #1a1a1a; margin-top: 60px; padding-top: 8px; font-size: 11px; color: #718096; }
    .notes { font-size: 11px; color: #718096; margin-top: 20px; line-height: 1.6; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <div>
        <div class="company-name">HealthEdu Pro</div>
        <div class="company-sub">Medical Education & Certification Services</div>
      </div>
      <div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-no">${invoice.invoiceNo || "—"}</div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">Bill To</div>
        <div class="info-value">${(invoice.firstName || "") + " " + (invoice.lastName || "")}</div>
      </div>
      <div class="info-box">
        <div class="info-label">Invoice Details</div>
        <div class="info-value">Date: ${invoice.dateTime ? new Date(invoice.dateTime).toLocaleDateString() : "—"}</div>
        <div class="info-value" style="margin-top:2px">Currency: ${invoice.currency || "AED"}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:30px">#</th>
          <th>Service</th>
          <th style="text-align:right">Sale Price</th>
          <th style="text-align:center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${serviceRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span class="label">Subtotal</span>
          <span class="value">${totalSale.toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span class="label">Paid Amount</span>
          <span class="value">${Number(invoice.paidAmount || 0).toFixed(2)}</span>
        </div>
        <div class="totals-row">
          <span class="label">Balance Due</span>
          <span class="value">${Number(invoice.balance || 0).toFixed(2)}</span>
        </div>
        <div class="totals-row total">
          <span class="label">Total</span>
          <span class="value">${totalSale.toFixed(2)} ${invoice.currency || ""}</span>
        </div>
      </div>
    </div>

    ${invoice.remarks ? `<div class="notes"><strong>Remarks:</strong> ${invoice.remarks}</div>` : ""}

    <div class="footer">
      <div class="signature-section">
        <div class="signature-box">
          <div class="signature-line">Customer Signature</div>
        </div>
        <div class="signature-box" style="text-align:right">
          <div class="signature-line" style="border-top:none;text-align:right">Authorized Signature</div>
        </div>
      </div>
    </div>

    <div style="text-align:center;margin-top:30px" class="no-print">
      <button onclick="window.print()" style="padding:10px 24px;background:#0E7C7B;color:white;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:600">Print Invoice</button>
      <button onclick="window.close()" style="padding:10px 24px;background:#e2e8f0;color:#1a1a1a;border:none;border-radius:8px;font-size:13px;cursor:pointer;margin-left:8px">Close</button>
    </div>
  </div>
</body>
</html>`);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A202C]">Print Invoice</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#718096] hover:bg-gray-100"><X size={16} /></button>
        </div>

        <div className="border border-[rgba(0,0,0,0.08)] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-[#1A202C]">HealthEdu Pro</p>
              <p className="text-[15px] text-[#718096]">Invoice {invoice.invoiceNo}</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] text-[#718096]">Date</p>
              <p className="text-xs text-[#1A202C]">{invoice.dateTime ? new Date(invoice.dateTime).toLocaleDateString() : "—"}</p>
            </div>
          </div>
          <div className="mb-3">
            <p className="text-[15px] text-[#718096] uppercase">Customer</p>
            <p className="text-xs font-medium text-[#1A202C]">{(invoice.firstName || "") + " " + (invoice.lastName || "")}</p>
          </div>
          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="text-[15px] uppercase text-[#718096] border-b border-[rgba(0,0,0,0.06)]">
                <th className="text-left py-2">Service</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-center py-2 w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceList.map((item, i) => (
                <tr key={i} className="border-b border-[rgba(0,0,0,0.04)]">
                  <td className="py-2 text-[#1A202C]">{item.service}</td>
                  <td className="py-2 text-right font-mono">{Number(item.amount || 0).toFixed(2)}</td>
                  <td className="py-2 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[15px] font-semibold ${item.isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.isCompleted ? "bg-emerald-500" : "bg-amber-400"}`}></span>
                      {item.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between text-xs font-semibold text-[#1A202C] border-t border-[rgba(0,0,0,0.06)] pt-2">
            <span>Total</span>
            <span className="font-mono">{totalSale.toFixed(2)} {invoice.currency || ""}</span>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={handlePrint}>Print Invoice</Btn>
        </div>
      </div>
    </div>
  );
}

export { PrintInvoice };
