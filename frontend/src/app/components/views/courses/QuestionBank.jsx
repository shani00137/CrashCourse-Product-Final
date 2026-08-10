import { useState } from "react";
import { FileSpreadsheet, Plus, Edit2, Trash2 } from "lucide-react";
import { Btn, Card, Input, Modal, Select } from "../../shared/ui";
import { questions } from "../../../data/mockData";

export function QuestionBankScreen() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">MCQ Question Bank</h1>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<FileSpreadsheet size={14} />}>Import Excel</Btn>
          <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setShowModal(true)}>Add Question</Btn>
        </div>
      </div>
      <Card className="p-4">
        <div className="flex gap-3">
          <select className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#718096] focus:outline-none focus:border-[#0E7C7B] transition flex-1">
            <option>All Courses</option><option>MDS-101</option><option>HCM-201</option><option>NRS-301</option>
          </select>
          <select className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#718096] focus:outline-none focus:border-[#0E7C7B] transition flex-1">
            <option>All Exercises</option><option>Module 1</option><option>Module 3</option><option>Module 5</option>
          </select>
        </div>
      </Card>
      <div className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <Card key={q.id} className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#718096] bg-[#EDF2F7] px-2 py-0.5 rounded-md">Q{qi + 1}</span>
                <span className="text-xs text-[#0E7C7B] font-medium">{q.course}</span>
                <span className="text-xs text-[#718096]">· {q.exercise}</span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={13} /></button>
                <button className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={13} /></button>
              </div>
            </div>
            <p className="text-sm font-medium text-[#1A202C] mb-3 leading-relaxed">{q.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border transition ${oi === q.correct ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.07)] bg-[#F7FAFC]"}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${oi === q.correct ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className={oi === q.correct ? "text-emerald-800" : "text-[#718096]"}>{opt}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      {showModal && (
        <Modal title="Add MCQ Question" onClose={() => setShowModal(false)}>
          <div className="flex flex-col gap-3">
            <Select label="Course" options={["MDS-101", "HCM-201", "NRS-301"]} />
            <Select label="Exercise / Module" options={["Module 1", "Module 2", "Module 3", "Module 4", "Module 5"]} />
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Question</label>
              <textarea rows={3} className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]" placeholder="Enter question text…" />
            </div>
            {["Option A", "Option B", "Option C", "Option D"].map(o => <Input key={o} label={o} placeholder={`Enter ${o}`} />)}
            <Select label="Correct Answer" options={["Option A", "Option B", "Option C", "Option D"]} />
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn variant="primary">Save Question</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
