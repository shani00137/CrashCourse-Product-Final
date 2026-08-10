import { useState } from "react";
import { Plus, Eye, Download } from "lucide-react";
import { Btn, Card, Input, Modal, Select, StatusBadge } from "../../shared/ui";
import { invoices } from "../../../data/mockData";

export function InvoiceScreen() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Invoices — Zara Ahmed</h1>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Create Invoice</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Invoice No", "Date", "Service", "Amount", "Paid", "Balance", "Currency", "Status", "Action"].map(h => (
                  <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide ${["Amount", "Paid", "Balance"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.no} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{inv.no}</td>
                  <td className="px-4 py-3 text-[#718096]">{inv.date}</td>
                  <td className="px-4 py-3 text-[#1A202C]">{inv.service}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-[#1A202C]">{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-emerald-600">{inv.paid.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-red-600">{inv.balance.toLocaleString()}</td>
                  <td className="px-4 py-3 text-[#718096]">{inv.currency}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 rounded-lg transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Download size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(0,0,0,0.06)]">
          <div className="flex gap-6 text-xs">
            <span className="text-[#718096]">Total Invoiced: <strong className="text-[#1A202C]">AED 2,900</strong></span>
            <span className="text-[#718096]">Total Paid: <strong className="text-emerald-600">AED 1,975</strong></span>
            <span className="text-[#718096]">Outstanding: <strong className="text-red-600">AED 925</strong></span>
          </div>
        </div>
      </Card>
      {showModal && (
        <Modal title="Create Invoice" onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-4">
            <Input label="Service Description" placeholder="e.g. Exam Fee - MDS-101" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Amount (AED)" type="number" placeholder="0.00" />
              <Select label="Currency" options={["AED", "USD", "GBP"]} />
            </div>
            <Input label="Invoice Date" type="date" />
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={() => setShowModal(false)}>Create Invoice</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
