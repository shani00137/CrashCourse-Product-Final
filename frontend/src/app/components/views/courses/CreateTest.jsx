import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Eye,
  Trash2,
  RefreshCw,
  X,
  AlertCircle,
  BookOpen,
  Loader2,
  CheckCircle,
  Users,
  FileQuestion,
  Calendar,
  Clock
} from "lucide-react";
import { Btn, BouncingDots, Card, Modal, SearchableSelect, StatusBadge } from "../../shared/ui";
import { prepareTest, getAppUserTests, deleteTest, getTestDetails } from "../../../../services/testService";
import { getActiveCourses, getActiveApplicantsByCourse } from "../../../../services/applicantService";

const todayStr = () => {
  const d = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtDate = v => (v ? new Date(v).toLocaleDateString() : "—");
const PAGE_SIZE = 20;

export function CreateTestScreen({ user }) {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formCourseId, setFormCourseId] = useState("");
  const [formQuestions, setFormQuestions] = useState(40);
  const [formDuration, setFormDuration] = useState(40);
  const [formDate, setFormDate] = useState(todayStr());
  const [formMode, setFormMode] = useState("all");
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [applicantLoading, setApplicantLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState(null);

  const [viewTest, setViewTest] = useState(null);
  const [viewData, setViewData] = useState([]);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const showToast = (type, message) => setToast({ type, message });

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    getActiveCourses().then(list => setCourses(Array.isArray(list) ? list : [])).catch(() => setCourses([]));
  }, []);

  const load = useCallback(targetPage => {
    const p = targetPage ?? page;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAppUserTests(p, PAGE_SIZE).then(res => {
      if (cancelled) return;
      if (Array.isArray(res)) {
        setTests(res);
        setTotal(res.length);
        return;
      }
      const items = Array.isArray(res?.data) ? res.data : [];
      if (items.length === 0 && p > 1) {
        setPage(p - 1);
        return;
      }
      setTests(items);
      setTotal(res?.total ?? items.length);
    }).catch(err => {
      if (cancelled) return;
      setError(err instanceof Error ? err.message : "Failed to load tests.");
      setTests([]);
      setTotal(0);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => load(), [load]);

  const openForm = () => {
    setFormCourseId("");
    setFormQuestions(40);
    setFormDuration(40);
    setFormDate(todayStr());
    setFormMode("all");
    setApplicants([]);
    setSelectedApplicants([]);
    setFormError(null);
    setFormOpen(true);
  };

  useEffect(() => {
    if (!formOpen || formMode !== "select" || !formCourseId) {
      setApplicants([]);
      setSelectedApplicants([]);
      return;
    }
    let cancelled = false;
    setApplicantLoading(true);
    getActiveApplicantsByCourse(Number(formCourseId)).then(list => {
      if (cancelled) return;
      setApplicants(Array.isArray(list) ? list : []);
    }).catch(() => {
      if (!cancelled) setApplicants([]);
    }).finally(() => {
      if (!cancelled) setApplicantLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [formOpen, formMode, formCourseId]);

  const toggleApplicant = id => {
    setSelectedApplicants(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleGenerate = async e => {
    e.preventDefault();
    const courseIdNum = Number(formCourseId);
    if (!courseIdNum) {
      setFormError("Please select a course.");
      return;
    }
    if (!formQuestions || formQuestions < 1) {
      setFormError("Please enter the number of questions.");
      return;
    }
    if (!formDuration || formDuration < 1) {
      setFormError("Please enter the test duration.");
      return;
    }
    if (!formDate) {
      setFormError("Please select a test date.");
      return;
    }
    if (formMode === "select" && selectedApplicants.length === 0) {
      setFormError("Please select at least one applicant.");
      return;
    }
    setGenerating(true);
    setFormError(null);
    try {
      const msg = await prepareTest({
        courseId: courseIdNum,
        questions: Number(formQuestions),
        duration: Number(formDuration),
        testDate: new Date(formDate),
        applicantId: formMode === "all" ? [] : selectedApplicants,
        createdBy: user?.UserNo ?? user?.userNo ?? 0
      });
      showToast("success", msg || "Test created successfully");
      setFormOpen(false);
      setPage(1);
      load(1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create test.");
    } finally {
      setGenerating(false);
    }
  };

  const handleView = async t => {
    setViewTest(t);
    setViewData([]);
    setViewError(null);
    setViewLoading(true);
    try {
      const data = await getTestDetails(t.testId);
      setViewData(Array.isArray(data) ? data : []);
    } catch (err) {
      setViewError(err instanceof Error ? err.message : "Failed to load test details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async t => {
    if (!window.confirm(`Delete test #${t.testId} for ${t.firstName ?? ""} ${t.lastName ?? ""}?`)) return;
    setDeletingId(t.testId);
    try {
      const msg = await deleteTest(t.testId);
      showToast("success", msg || "Test deleted successfully");
      load();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to delete test.");
    } finally {
      setDeletingId(null);
    }
  };

  const courseOptions = courses.map(c => ({ id: c.courseId, label: `${c.courseCode} — ${c.courseName}` }));
  const statusFor = t => {
    if (!t.isCompleted) return "Pending";
    return (t.percentage ?? 0) >= 70 ? "Passed" : "Failed";
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageNumbers = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
  } else {
    pageNumbers.push(1);
    const start = Math.max(2, page - 2);
    const end = Math.min(totalPages - 1, page + 2);
    if (start > 2) pageNumbers.push("…");
    for (let i = start; i <= end; i++) pageNumbers.push(i);
    if (end < totalPages - 1) pageNumbers.push("…");
    pageNumbers.push(totalPages);
  }
  const pagerFrom = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pagerTo = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1A202C]">Create Test</h1>
        <div className="flex gap-2">
          <Btn variant="outline" icon={<RefreshCw size={14} />} onClick={() => load()}>Refresh</Btn>
          <Btn variant="primary" icon={<Plus size={14} />} onClick={openForm}>Generate Test</Btn>
        </div>
      </div>

      {loading && <Card className="p-4"><BouncingDots label="Loading tests…" /></Card>}
      {!loading && error && (
        <Card className="p-10 text-center">
          <AlertCircle size={28} className="mx-auto text-red-400 mb-2" />
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <p className="text-xs text-gray-400 mt-1">Make sure you are logged in and the API is running.</p>
        </Card>
      )}
      {!loading && !error && tests.length === 0 && (
        <Card className="p-16 text-center">
          <BookOpen size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[#718096] font-medium">No tests found</p>
          <p className="text-xs text-gray-400 mt-1">Click "Generate Test" to create one</p>
        </Card>
      )}
      {!loading && !error && tests.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)] bg-[#F7FAFC]">
                  {["Test #", "Applicant", "Course", "Test Date", "Questions", "Result %", "Status", "Actions"].map(h => (
                    <th key={h} className={`px-4 py-3 text-[11px] font-semibold text-[#718096] uppercase tracking-wide ${["Questions", "Result %"].includes(h) ? "text-right" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tests.map(t => (
                  <tr key={t.testId} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#F7FAFC] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#718096]">#{t.testId}</td>
                    <td className="px-4 py-3 font-medium text-[#1A202C]">{t.firstName} {t.lastName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#718096]">{t.courseName ?? "—"}</td>
                    <td className="px-4 py-3 text-[#718096]">{fmtDate(t.testDate)}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs">{t.questions}</td>
                    <td className="px-4 py-3 text-right">
                      {t.isCompleted ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 rounded-full bg-[#EDF2F7] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${(t.percentage ?? 0) >= 70 ? "bg-emerald-500" : "bg-red-500"}`}
                              style={{ width: `${Math.min(100, Math.max(0, t.percentage ?? 0))}%` }}
                            />
                          </div>
                          <span className={`font-mono text-xs font-semibold min-w-11 ${(t.percentage ?? 0) >= 70 ? "text-emerald-600" : "text-red-600"}`}>
                            {t.percentage ?? 0}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#A0AEC0]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={statusFor(t)} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => handleView(t)} title="View questions" className="p-1.5 text-[#718096] hover:text-[#0E7C7B] hover:bg-teal-50 rounded-lg transition"><Eye size={14} /></button>
                        <button
                          onClick={() => handleDelete(t)}
                          disabled={deletingId === t.testId}
                          title="Delete test"
                          className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        >
                          {deletingId === t.testId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[rgba(0,0,0,0.06)] px-4 py-3">
            <span className="text-xs text-[#718096]">
              {pagerFrom}–{pagerTo} of {total} tests
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[rgba(0,0,0,0.12)] text-[#718096] hover:bg-[#F7FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              {pageNumbers.map((n, i) =>
                n === "…" ? (
                  <span key={`e${i}`} className="px-1.5 text-xs text-[#A0AEC0]">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`min-w-8 h-8 px-2 text-xs font-medium rounded-lg transition ${n === page ? "bg-[#0E7C7B] text-white" : "border border-[rgba(0,0,0,0.12)] text-[#718096] hover:bg-[#F7FAFC]"}`}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[rgba(0,0,0,0.12)] text-[#718096] hover:bg-[#F7FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      )}

      {formOpen && (
        <Modal title="Generate Test" onClose={() => setFormOpen(false)} className="max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto">
          <form onSubmit={handleGenerate} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Course</label>
              <SearchableSelect
                options={courseOptions}
                value={formCourseId ? Number(formCourseId) : null}
                onSelect={id => setFormCourseId(id ? String(id) : "")}
                allLabel="Select a course…"
                placeholder="Search courses…"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Questions</label>
                <input
                  type="number" min="1"
                  value={formQuestions}
                  onChange={e => setFormQuestions(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Duration (min)</label>
                <input
                  type="number" min="1"
                  value={formDuration}
                  onChange={e => setFormDuration(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Test Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Applicants</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormMode("all")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${formMode === "all" ? "border-[#0E7C7B] bg-[#E6F4F4] text-[#0E7C7B] font-medium" : "border-[rgba(0,0,0,0.12)] text-[#718096] hover:border-[#0E7C7B]"}`}
                >
                  <Users size={14} /> All active applicants of course
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode("select")}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${formMode === "select" ? "border-[#0E7C7B] bg-[#E6F4F4] text-[#0E7C7B] font-medium" : "border-[rgba(0,0,0,0.12)] text-[#718096] hover:border-[#0E7C7B]"}`}
                >
                  <FileQuestion size={14} /> Select applicants
                </button>
              </div>
            </div>
            {formMode === "select" && (
              <div className="flex flex-col gap-1">
                {!formCourseId ? (
                  <p className="text-xs text-[#718096] bg-[#F7FAFC] border border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2">Select a course first to load its applicants.</p>
                ) : applicantLoading ? (
                  <div className="flex items-center gap-2 text-xs text-[#718096] bg-[#F7FAFC] border border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2">
                    <Loader2 size={13} className="animate-spin" /> Loading applicants…
                  </div>
                ) : applicants.length === 0 ? (
                  <p className="text-xs text-[#718096] bg-[#F7FAFC] border border-[rgba(0,0,0,0.06)] rounded-lg px-3 py-2">No active applicants found for this course.</p>
                ) : (
                  <div className="max-h-44 overflow-y-auto border border-[rgba(0,0,0,0.08)] rounded-lg divide-y divide-[rgba(0,0,0,0.04)]">
                    {applicants.map(a => (
                      <label key={a.applicantId} className="flex items-center gap-2.5 px-3 py-2 text-sm text-[#1A202C] hover:bg-[#F7FAFC] cursor-pointer transition">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.includes(a.applicantId)}
                          onChange={() => toggleApplicant(a.applicantId)}
                          className="accent-[#0E7C7B]"
                        />
                        <span>{a.firstName} {a.lastName}</span>
                        {a.registrationNo && <span className="ml-auto font-mono text-[10px] text-[#718096]">{a.registrationNo}</span>}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {formError && (
              <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <AlertCircle size={14} /> {formError}
              </div>
            )}
            <div className="flex gap-2 justify-end mt-2">
              <Btn variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Btn>
              <Btn type="submit" variant="primary" disabled={generating} className={generating ? "cursor-wait" : ""}>
                {generating && <Loader2 size={14} className="animate-spin" />}
                {generating ? "Generating…" : "Generate Test"}
              </Btn>
            </div>
          </form>
        </Modal>
      )}

      {viewTest && (
        <Modal
          title={`Test #${viewTest.testId} — ${viewTest.courseName ?? ""}`}
          onClose={() => setViewTest(null)}
          className="max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          <div className="flex items-center gap-4 text-xs text-[#718096] mb-4">
            <span className="flex items-center gap-1.5"><Calendar size={12} /> {fmtDate(viewTest.testDate)}</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {viewTest.duration} min</span>
            <span className="flex items-center gap-1.5"><FileQuestion size={12} /> {viewTest.questions} questions</span>
            <span className="flex items-center gap-1.5"><Users size={12} /> {viewTest.firstName} {viewTest.lastName}</span>
          </div>
          {viewLoading && <BouncingDots label="Loading questions…" />}
          {!viewLoading && viewError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={14} /> {viewError}
            </div>
          )}
          {!viewLoading && !viewError && viewData.length === 0 && (
            <p className="text-center text-sm text-[#718096] py-8">No questions found for this test.</p>
          )}
          {!viewLoading && !viewError && viewData.length > 0 && (
            <div className="flex flex-col gap-4">
              {viewData.map((q, qi) => {
                const options = Array.isArray(q.questionOptions) ? q.questionOptions : [];
                return (
                  <Card key={q.questionId ?? qi} className="p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-xs font-semibold text-[#718096] bg-[#EDF2F7] px-2 py-0.5 rounded-md flex-shrink-0">Q{qi + 1}</span>
                      <p className="text-sm font-medium text-[#1A202C] leading-relaxed">{q.questionContent}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {options.map((opt, oi) => (
                        <div
                          key={opt.questionJobOptionId ?? oi}
                          className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border transition ${opt.isRightAns ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.07)] bg-[#F7FAFC]"}`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${opt.isRightAns ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className={opt.isRightAns ? "text-emerald-800" : "text-[#718096]"}>{opt.options}</span>
                          {opt.isSelected ? <span className="ml-auto text-[10px] font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md flex-shrink-0">Selected</span> : null}
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Modal>
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
