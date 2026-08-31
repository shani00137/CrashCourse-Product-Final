import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  BookOpen,
  Loader2,
  CheckCircle,
  Sparkles,
  FileUp,
  Download
} from "lucide-react";
import { Btn, BouncingDots, Card, SearchableSelect } from "../../shared/ui";
import { getAllQuestions, deleteQuestion, importQuestions, downloadQuestionModel } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";
import { htmlToText } from "../../../../utils/html";

export function QuestionBankScreen({ setScreen, onEdit }) {
  const pageSize = 10;
  const [rows, setRows] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  useEffect(() => {
    getActiveCourses().then(list => setCourses(Array.isArray(list) ? list : [])).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [search, courseId]);

  const load = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAllQuestions({ pageNumber: page, pageSize, courseId, searchTerm: debouncedSearch }).then(res => {
      if (cancelled) return;
      setRows(res.data ?? []);
      setTotalRecords(res.totalRecords ?? 0);
    }).catch(err => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "Failed to load questions.");
      setRows([]);
      setTotalRecords(0);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, courseId]);

  useEffect(() => load(), [load]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const goToPage = (p) => setPage(Math.max(1, Math.min(p, totalPages)));

  const handleDelete = async (q) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    setDeletingId(q.questionId);
    try {
      const msg = await deleteQuestion(q.questionId);
      showToast("success", msg || "Question deleted successfully");
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        load();
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete question.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xls" && ext !== "xlsx") {
      showToast("error", "Please select a valid Excel file (.xls or .xlsx)");
      return;
    }
    setImporting(true);
    setImportMsg(null);
    try {
      const res = await importQuestions(file);
      const msg = typeof res === "string" ? res : "Import completed";
      setImportMsg({ type: "success", text: msg });
      showToast("success", msg);
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Import failed";
      setImportMsg({ type: "error", text: msg });
      showToast("error", msg);
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadQuestionModel("Question");
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Download failed");
    }
  };

  const courseOptions = courses.map(c => ({ id: c.courseId, label: `${c.courseCode} — ${c.courseName}` }));
  const searching = search.trim() !== debouncedSearch;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">MCQ Question Bank</h1>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleImportFile} className="hidden" />
          <Btn variant="outline" icon={importing ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />} onClick={() => fileInputRef.current?.click()} disabled={importing}>
            {importing ? "Importing..." : "Import Excel"}
          </Btn>
          <Btn variant="outline" icon={<Download size={14} />} onClick={handleDownloadTemplate}>Template</Btn>
          <Btn variant="outline" icon={<FileUp size={14} />} onClick={() => setScreen("upload-from-pdf")}>Upload from PDF</Btn>
          <Btn variant="outline" icon={<Sparkles size={14} />} onClick={() => setScreen("generate-ai-question")}>Generate with AI</Btn>
          <Btn variant="primary" icon={<Plus size={14} />} onClick={() => setScreen("question-form")}>Add Question</Btn>
        </div>
      </div>
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            {searching ? (
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <span className="block h-3.5 w-3.5 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
              </span>
            ) : (
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            )}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search question content…"
              className="h-9 w-full pl-9 pr-8 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
            />
            {searching && <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] font-medium text-[#718096] pointer-events-none">Searching…</span>}
            {search && !searching && (
              <button onClick={() => setSearch("")} title="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition">
                <X size={13} />
              </button>
            )}
          </div>
          <SearchableSelect
            options={courseOptions}
            value={courseId}
            onSelect={setCourseId}
            allLabel="All Courses"
            placeholder="Search courses…"
          />
        </div>
      </Card>

      {importMsg && (
        <div className={`flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg border ${importMsg.type === "success" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-600 bg-red-50 border-red-100"}`}>
          {importMsg.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {importMsg.text}
          <button onClick={() => setImportMsg(null)} className="ml-auto p-0.5 hover:opacity-70"><X size={12} /></button>
        </div>
      )}

      {loading && <Card className="p-4"><BouncingDots label={rows.length ? "Refreshing results…" : "Loading questions…"} /></Card>}
      {!loading && error && (
        <Card className="p-10 text-center">
          <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
        </Card>
      )}
      {!loading && !error && totalRecords === 0 && (
        <Card className="p-16 text-center">
          <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[#718096] font-medium">No questions found</p>
          <p className="text-xs text-gray-400 mt-1">{search.trim() || courseId ? "Try clearing your filters" : "Add a question to get started"}</p>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {rows.map((q, qi) => {
          const options = Array.isArray(q.questionOptions) ? q.questionOptions : [];
          return (
            <Card key={q.questionId} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#718096] bg-[#EDF2F7] px-2 py-0.5 rounded-md">Q{start + qi + 1}</span>
                  <span className="text-xs text-[#0E7C7B] font-medium">{q.courseName}</span>
                  {q.dateTime && <span className="text-xs text-[#718096]">· {new Date(q.dateTime).toLocaleDateString()}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(q)} className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={13} /></button>
                  <button
                    onClick={() => handleDelete(q)}
                    disabled={deletingId === q.questionId}
                    className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Delete question"
                  >
                    {deletingId === q.questionId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
              <p className="text-sm font-medium text-[#1A202C] mb-3 leading-relaxed whitespace-pre-line">{htmlToText(q.questionContent)}</p>
              <div className="grid grid-cols-2 gap-2">
                {options.map((opt, oi) => (
                  <div key={opt.questionJobOptionId ?? oi} className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border transition ${opt.isRightAns ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.07)] bg-[#F7FAFC]"}`}>
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${opt.isRightAns ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className={opt.isRightAns ? "text-emerald-800" : "text-[#718096]"}>{htmlToText(opt.options)}</span>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {!loading && !error && totalRecords > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#718096]">
              {`Showing ${start + 1}\u2013${Math.min(start + pageSize, totalRecords)} of ${totalRecords} question${totalRecords === 1 ? "" : "s"}`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1} className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronLeft size={14} className="mx-auto" />
              </button>
              <span className="px-2 text-xs text-[#718096] whitespace-nowrap">Page {safePage} of {totalPages}</span>
              <button onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages} className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed">
                <ChevronRight size={14} className="mx-auto" />
              </button>
            </div>
          </div>
        </Card>
      )}

      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#0E7C7B]" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
