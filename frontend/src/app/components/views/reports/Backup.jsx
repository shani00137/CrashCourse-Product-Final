import { Download, RefreshCw } from "lucide-react";
import { Btn, Card } from "../../shared/ui";
import { backups } from "../../../data/mockData";
import { Database } from "lucide-react";

export function BackupScreen() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Database Backup</h1>
        <Btn variant="primary" icon={<RefreshCw size={14} />}>New Backup</Btn>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                {["Backup File", "Created Date", "Size", "Download"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {backups.map(b => (
                <tr key={b.file} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Database size={14} className="text-[#0E7C7B]" />
                      <span className="font-mono text-xs text-[#1A202C]">{b.file}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#718096]">{b.created}</td>
                  <td className="px-4 py-3 font-mono text-xs text-[#718096]">{b.size}</td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-1.5 text-[#0E7C7B] hover:text-[#0a6665] text-xs font-medium transition">
                      <Download size={13} />Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
