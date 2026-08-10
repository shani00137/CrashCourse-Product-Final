import { Award, Download } from "lucide-react";
import { Btn, Card, Input, Select } from "../../shared/ui";

export function CertificatesScreen() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold text-[#1A202C]">Certificates</h1>
      <div className="grid grid-cols-2 gap-5">
        <Card className="p-6">
          <h3 className="text-base font-semibold text-[#1A202C] mb-5">Export Certificate</h3>
          <div className="flex flex-col gap-4">
            <Input label="Applicant Name" placeholder="Search applicant…" />
            <Input label="Certificate Serial" placeholder="e.g. CERT-2024-0001" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="From Date" type="date" />
              <Input label="To Date" type="date" />
            </div>
            <Select label="Course" options={["All Courses", "MDS-101", "HCM-201", "NRS-301"]} />
            <Btn variant="primary" icon={<Download size={14} />} className="w-full justify-center">Export Certificates</Btn>
          </div>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center gap-4">
          <div className="w-full max-w-xs border-2 border-[#0E7C7B] rounded-2xl p-6 text-center bg-gradient-to-br from-teal-50 to-white">
            <div className="w-12 h-12 bg-[#0E7C7B] rounded-full flex items-center justify-center mx-auto mb-3">
              <Award size={24} className="text-white" />
            </div>
            <div className="text-[10px] font-semibold text-[#718096] uppercase tracking-widest mb-1">Certificate of Completion</div>
            <div className="text-sm font-semibold text-[#1A202C] mb-0.5">This certifies that</div>
            <div className="text-base font-bold text-[#0E7C7B] mb-1">Zara Ahmed</div>
            <div className="text-xs text-[#718096] mb-2">has successfully completed</div>
            <div className="text-sm font-semibold text-[#1A202C] mb-2">Medical Dental Science</div>
            <div className="text-[10px] text-[#718096]">Serial: CERT-2024-0089 · Oct 21, 2024</div>
          </div>
          <p className="text-xs text-[#718096]">Certificate preview</p>
        </Card>
      </div>
    </div>
  );
}
