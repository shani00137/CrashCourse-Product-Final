import { useEffect, useRef, useState } from "react";
import {
  Search,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Save,
  BookOpen,
  BadgeCheck,
  ShieldAlert,
  Clock,
  MousePointerClick,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Btn, Card, SearchableSelect } from "../../shared/ui";
import { getAllQuestions, reviewQuestion, editQuestion, updateQuestionVerifiedBy } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";
import { htmlToText } from "../../../../utils/html";

const PAGE_SIZE = 20;

const STATUS_PENDING = "pending";
const STATUS_CHECKING = "checking";
const STATUS_DONE = "done";
const STATUS_ERROR = "error";
const STATUS_ACCEPTED = "accepted";

function StatusBadge({ status, isCorrect }) {
  const map = {
    [STATUS_PENDING]: { icon: Clock, label: "Not checked", cls: "bg-gray-100 text-gray-600 border-gray-200" },
    [STATUS_CHECKING]: { icon: Loader2, label: "Checking...", cls: "bg-amber-50 text-amber-700 border-amber-200", spin: true },
    [STATUS_DONE]: isCorrect
      ? { icon: BadgeCheck, label: "Correct", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : { icon: ShieldAlert, label: "Incorrect", cls: "bg-red-50 text-red-600 border-red-200" },
    [STATUS_ERROR]: { icon: XCircle, label: "Error", cls: "bg-red-50 text-red-600 border-red-200" },
    [STATUS_ACCEPTED]: { icon: CheckCircle, label: "Accepted & Replaced", cls: "bg-blue-50 text-blue-700 border-blue-200" }
  };
  const cfg = map[status] ?? map[STATUS_PENDING];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <Icon size={12} className={cfg.spin ? "animate-spin" : ""} />
      {cfg.label}
    </span>
  );
}

function OptionRow({ letter, text, correct }) {
  return (
    <div className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs border transition ${correct ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.07)] bg-[#F7FAFC]"}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${correct ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
        {letter}
      </span>
      <span className={correct ? "text-emerald-800 leading-relaxed" : "text-[#718096] leading-relaxed"}>{text}</span>
    </div>
  );
}

function VerifiedBadge({ verifiedBy }) {
  if (verifiedBy === "Human") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <BadgeCheck size={11} /> Verified by Human
      </span>
    );
  }
  if (verifiedBy === "AI") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-50 text-violet-700 border border-violet-200">
        <Sparkles size={11} /> Verified by AI
      </span>
    );
  }
  return null;
}

export function QuestionCorrectionScreen({ onBack }) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [totalInCourse, setTotalInCourse] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [toast, setToast] = useState(null);

  const questionsRef = useRef([]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    getActiveCourses().then(list => setCourses(Array.isArray(list) ? list : [])).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const courseOptions = courses.map(c => ({ id: c.courseId, label: `${c.courseCode} — ${c.courseName}` }));

  const correctIndexOf = (q) => {
    const options = Array.isArray(q.questionOptions) ? q.questionOptions : [];
    const idx = options.findIndex(o => o.isRightAns);
    return idx >= 0 ? idx : 0;
  };

  const optionsOf = (q) => (Array.isArray(q.questionOptions) ? q.questionOptions : []).map(o => o.options ?? "");

  const selected = selectedIdx !== null ? questions[selectedIdx] : null;
  const selectedReview = selected ? reviews[selected.questionId] : null;

  const fetchQuestions = async (pageNumber) => {
    const res = await getAllQuestions({ pageNumber, pageSize: PAGE_SIZE, courseId, searchTerm: "" });
    const data = res?.data ?? [];
    setQuestions(data);
    setTotalInCourse(res?.totalRecords ?? data.length);
    return data;
  };

  const totalPages = Math.max(1, Math.ceil(totalInCourse / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const handleSearch = async () => {
    if (!courseId) {
      setToast({ type: "error", message: "Please select a course first." });
      return;
    }
    setSearching(true);
    setLoadError(null);
    setSearched(false);
    setQuestions([]);
    setTotalInCourse(0);
    setSelectedIdx(null);
    setExpandedIdx(null);
    setReviews({});
    setPage(1);
    try {
      await fetchQuestions(1);
      setSearched(true);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load questions.");
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const goToPage = async (p) => {
    const target = Math.max(1, Math.min(p, totalPages));
    if (target === page || searching) return;
    setSearching(true);
    setLoadError(null);
    setSelectedIdx(null);
    setExpandedIdx(null);
    try {
      await fetchQuestions(target);
      setPage(target);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load questions.");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedIdx === null) return;
    const q = questionsRef.current[selectedIdx];
    if (!q) return;
    setSubmitting(true);
    setReviews(prev => ({ ...prev, [q.questionId]: { status: STATUS_CHECKING } }));
    try {
      const res = await reviewQuestion({
        questionContent: htmlToText(q.questionContent),
        options: optionsOf(q),
        correctIndex: correctIndexOf(q)
      });
      const ok = res && typeof res === "object" && res.succeeded !== false;
      if (!ok) {
        throw new Error(res && typeof res.message === "string" ? res.message : "AI review failed.");
      }
      setReviews(prev => ({
        ...prev,
        [q.questionId]: { status: STATUS_DONE, isCorrect: !!res.isCorrect, review: res }
      }));
      if (res.isCorrect) {
        setQuestions(prev => prev.map(qq => qq.questionId === q.questionId ? { ...qq, verifiedBy: "AI" } : qq));
        updateQuestionVerifiedBy({ questionId: q.questionId, verifiedBy: "AI" }).catch(() => {});
      }
    } catch (err) {
      setReviews(prev => ({
        ...prev,
        [q.questionId]: { status: STATUS_ERROR, error: err instanceof Error ? err.message : "Review failed." }
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleAccept = async () => {
    if (selectedIdx === null) return;
    const q = questionsRef.current[selectedIdx];
    const review = selectedReview?.review;
    if (!q || !review) return;
    setSavingId(q.questionId);
    try {
      const options = Array.isArray(review.options) ? review.options : [];
      const correctedOptions = options.map((opt, oi) => ({ options: opt, isRightAns: oi === (review.correctIndex ?? 0) }));
      const msg = await editQuestion({
        questionId: q.questionId,
        courseId: q.courseId,
        questionContent: review.questionContent,
        questionOptionsList: correctedOptions,
        verifiedBy: "AI"
      });
      setQuestions(prev => prev.map((qq, ii) => ii === selectedIdx ? {
        ...qq,
        questionContent: review.questionContent,
        questionOptions: correctedOptions,
        verifiedBy: "AI"
      } : qq));
      setReviews(prev => ({
        ...prev,
        [q.questionId]: { ...prev[q.questionId], status: STATUS_ACCEPTED }
      }));
      setToast({ type: "success", message: msg || "Question replaced with the corrected version." });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to update the question." });
    } finally {
      setSavingId(null);
    }
  };

  const handleManualVerify = async () => {
    if (selectedIdx === null) return;
    const q = questionsRef.current[selectedIdx];
    if (!q) return;
    const next = q.verifiedBy === "Human" ? "" : "Human";
    setVerifyingId(q.questionId);
    try {
      const msg = await updateQuestionVerifiedBy({ questionId: q.questionId, verifiedBy: next });
      setQuestions(prev => prev.map(qq => qq.questionId === q.questionId ? { ...qq, verifiedBy: next || null } : qq));
      setToast({ type: "success", message: next === "Human" ? (msg || "Question marked as verified by Human.") : "Manual verification removed." });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to update verification." });
    } finally {
      setVerifyingId(null);
    }
  };

  const doneCount = Object.values(reviews).filter(r => r?.status === STATUS_DONE || r?.status === STATUS_ACCEPTED || r?.status === STATUS_ERROR).length;
  const wrongCount = Object.values(reviews).filter(r => r?.status === STATUS_DONE && !r.isCorrect).length;
  const rightCount = Object.values(reviews).filter(r => r?.status === STATUS_DONE && r.isCorrect).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C41E3A] to-rose-600 flex items-center justify-center shadow-md shadow-rose-200">
            <Sparkles size={17} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#1A202C]">Question Correction</h1>
            <p className="text-xs text-[#718096] mt-0.5">Pick any question, submit it, and AI checks &amp; corrects it</p>
          </div>
        </div>
        {onBack && (
          <Btn variant="ghost" icon={<ArrowLeft size={14} />} onClick={onBack}>Back</Btn>
        )}
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="text-[11px] font-semibold text-[#718096] uppercase tracking-wide mb-1 block">Course</label>
            <SearchableSelect
              options={courseOptions}
              value={courseId}
              onSelect={setCourseId}
              allLabel="Select a course..."
              placeholder="Search courses..."
            />
          </div>
          <div className="flex gap-2">
            <Btn
              variant="primary"
              icon={searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              onClick={handleSearch}
              disabled={searching || !courseId}
            >
              {searching ? "Loading..." : "Search"}
            </Btn>
          </div>
        </div>
      </Card>

      {searched && (
        <Card className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            {questions.length === 0 ? (
              <>
                <BookOpen size={16} className="text-gray-300" />
                <span className="text-sm font-medium text-[#718096]">No questions found for this course.</span>
              </>
            ) : (
              <>
                <span className="text-sm font-semibold text-[#1A202C]">
                  {questions.length} question{questions.length === 1 ? "" : "s"}{totalInCourse > questions.length ? ` of ${totalInCourse}` : ""}
                  {totalPages > 1 && <span className="text-[#718096] font-normal"> · Page {safePage} of {totalPages}</span>}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                  <CheckCircle size={12} /> {rightCount} correct
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                  <XCircle size={12} /> {wrongCount} incorrect
                </span>
                <span className="text-xs text-[#718096]">{doneCount} of {questions.length} checked</span>
              </>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[rgba(0,0,0,0.06)]">
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1 || searching}
                className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft size={14} className="mx-auto" />
              </button>
              <span className="px-2 text-xs font-medium text-[#718096]">Page {safePage} of {totalPages}</span>
              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages || searching}
                className="w-7 h-7 rounded-md text-xs font-medium text-[#718096] hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight size={14} className="mx-auto" />
              </button>
            </div>
          )}
        </Card>
      )}

      {loadError && (
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="break-all">{loadError}</span>
        </div>
      )}

      {!searched && (
        <div className="py-16 text-center">
          <Sparkles size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-[#718096] font-medium">Select a course and press Search</p>
          <p className="text-xs text-gray-400 mt-1">Then pick a question and submit it for AI correction</p>
        </div>
      )}

      {searched && questions.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* Left: pick a question */}
          <Card className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFF0F2] text-[#C41E3A] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A202C]">Original Questions</p>
                  <p className="text-[11px] text-[#718096]">Click a question to select it</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 max-h-[34rem] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isSelected = idx === selectedIdx;
                const isExpanded = idx === expandedIdx;
                const rev = reviews[q.questionId];
                const rStatus = rev?.status ?? STATUS_PENDING;
                const qOptions = Array.isArray(q.questionOptions) ? q.questionOptions : [];
                const qCorrect = correctIndexOf(q);
                return (
                  <button
                    key={q.questionId}
                    onClick={() => {
                      setSelectedIdx(idx);
                      setExpandedIdx(prev => (prev === idx ? null : idx));
                    }}
                    className={`w-full text-left rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? "border-[#C41E3A] bg-[#FFF0F2] ring-1 ring-[#C41E3A]/30"
                        : "border-[rgba(0,0,0,0.08)] bg-[#F7FAFC] hover:bg-white hover:border-[rgba(0,0,0,0.16)]"
                    }`}
                  >
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex flex-wrap items-center gap-2 min-w-0">
                          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-extrabold flex-shrink-0 ${isSelected ? "bg-[#C41E3A] text-white" : "bg-[#EDF2F7] text-[#718096]"}`}>
                            {idx + 1}
                          </span>
                          <StatusBadge status={rStatus} isCorrect={!!rev?.isCorrect} />
                          <VerifiedBadge verifiedBy={q.verifiedBy} />
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold flex-shrink-0 ${isSelected ? "text-[#C41E3A]" : "text-[#A0AEC0]"}`}>
                          <ChevronDown size={12} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                          {qOptions.length} options
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed ${isSelected ? "text-[#1A202C] font-medium" : "text-[#718096]"}`}>
                        {htmlToText(q.questionContent)}
                      </p>
                    </div>

                    {isExpanded && (
                      <div className="px-3 pb-3 flex flex-col gap-1.5">
                        {qOptions.map((opt, oi) => (
                          <div key={opt.questionJobOptionId ?? oi} className={`flex items-start gap-2.5 p-2 rounded-lg text-xs border ${oi === qCorrect ? "border-emerald-200 bg-emerald-50" : "border-[rgba(0,0,0,0.05)] bg-white"}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-px ${oi === qCorrect ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                              {String.fromCharCode(65 + oi)}
                            </span>
                            <span className={oi === qCorrect ? "text-emerald-800 leading-relaxed" : "text-[#718096] leading-relaxed"}>
                              {htmlToText(opt.options)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Right: corrected result for the selected question */}
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C41E3A] to-rose-500 text-white flex items-center justify-center flex-shrink-0">
                <Sparkles size={15} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1A202C]">Corrected Question</p>
                <p className="text-[11px] text-[#718096]">AI result for the selected question</p>
              </div>
            </div>

            {!selected && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <MousePointerClick size={28} className="text-gray-300" />
                <p className="text-sm font-medium text-[#718096]">No question selected</p>
                <p className="text-xs text-gray-400 max-w-xs">Pick a question from the left list, then press the Submit button at the bottom.</p>
              </div>
            )}

            {selected && !selectedReview && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Clock size={26} className="text-gray-300" />
                <p className="text-sm font-medium text-[#718096]">Q{selectedIdx + 1} selected</p>
                <p className="text-xs text-gray-400 max-w-xs">Press "Submit for Correction" at the bottom to send this question to the AI.</p>
              </div>
            )}

            {selected && selectedReview?.status === STATUS_CHECKING && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <Loader2 size={26} className="animate-spin text-amber-600" />
                <p className="text-sm font-semibold text-amber-700">Checking with AI...</p>
                <p className="text-xs text-gray-400">Reviewing the question text and options</p>
              </div>
            )}

            {selected && selectedReview?.status === STATUS_ERROR && (
              <div className="flex flex-col items-start gap-3 py-8 px-4 rounded-xl border border-red-200 bg-red-50/40">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                  <AlertCircle size={15} /> Review failed
                </div>
                <p className="text-xs text-red-500 break-all">{selectedReview.error || "Unknown error"}</p>
                <Btn variant="danger" icon={<RefreshCw size={14} />} onClick={handleSubmit} disabled={submitting}>
                  Retry
                </Btn>
              </div>
            )}

            {selected && selectedReview?.status === STATUS_DONE && selectedReview.isCorrect && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <CheckCircle size={22} />
                </div>
                <p className="text-sm font-semibold text-emerald-700">Verified Correct</p>
                <p className="text-xs text-emerald-600 text-center max-w-xs">{selectedReview.review?.message}</p>
              </div>
            )}

            {selected && selectedReview?.status === STATUS_DONE && !selectedReview.isCorrect && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
                  <XCircle size={14} /> Correction found for Q{selectedIdx + 1}
                </div>
                <div className="rounded-xl border border-[rgba(0,0,0,0.08)] p-3 bg-[#F7FAFC]">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-[#718096] mb-2">Original</div>
                  <OptionRow letter="✓" text="Incorrect as stored above" correct={false} />
                </div>
                <div className="rounded-xl border border-red-200 p-3 bg-red-50/40">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-red-600 mb-2">Corrected version</div>
                  <p className="text-[13px] font-medium text-[#1A202C] leading-relaxed mb-2.5 whitespace-pre-line">
                    {htmlToText(selectedReview.review.questionContent)}
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {(Array.isArray(selectedReview.review.options) ? selectedReview.review.options : []).map((opt, oi) => (
                      <OptionRow
                        key={oi}
                        letter={String.fromCharCode(65 + oi)}
                        text={String(opt)}
                        correct={oi === (selectedReview.review.correctIndex ?? 0)}
                      />
                    ))}
                  </div>
                  {selectedReview.review.explanation && (
                    <div className="mt-2.5 text-[11px] text-[#718096] bg-white/70 border border-blue-100 rounded-lg px-3 py-2 leading-relaxed">
                      <span className="font-bold text-blue-600">Why: </span>
                      {htmlToText(selectedReview.review.explanation)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {selected && selectedReview?.status === STATUS_ACCEPTED && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <CheckCircle size={22} />
                </div>
                <p className="text-sm font-semibold text-blue-700">Accepted &amp; Replaced</p>
                <p className="text-xs text-blue-600 text-center max-w-xs">The corrected version is now saved in the question bank.</p>
              </div>
            )}

            {selected && !selectedReview?.error && (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-[rgba(0,0,0,0.08)] bg-[#F7FAFC] px-3.5 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    id="manual-verify-tick"
                    className="w-4 h-4 accent-emerald-600 cursor-pointer flex-shrink-0"
                    checked={selected.verifiedBy === "Human"}
                    onChange={handleManualVerify}
                    disabled={!!verifyingId}
                  />
                  <label htmlFor="manual-verify-tick" className="text-xs font-medium text-[#1A202C] cursor-pointer select-none">
                    Manually verified by Human
                  </label>
                  <span className="text-[10px] text-[#718096] hidden sm:inline">Tick to mark, untick to clear</span>
                </div>
                {selected.verifiedBy ? <VerifiedBadge verifiedBy={selected.verifiedBy} /> : null}
              </div>
            )}
          </Card>
        </div>
      )}

      {searched && questions.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-[#718096] whitespace-nowrap">
              {selected ? (
                <>Selected: <span className="font-semibold text-[#1A202C]">Q{selectedIdx + 1}</span></>
              ) : (
                "No question selected"
              )}
            </span>
            {selectedReview?.status === STATUS_DONE && selectedReview.isCorrect && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                <CheckCircle size={12} /> Correct
              </span>
            )}
            {selectedReview?.status === STATUS_DONE && !selectedReview.isCorrect && selectedReview?.status !== STATUS_ACCEPTED && (
              <Btn
                variant="primary"
                icon={savingId ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                onClick={handleAccept}
                disabled={!!savingId}
              >
                {savingId ? "Updating..." : "Accept and Replace"}
              </Btn>
            )}
          </div>
          <Btn
            variant="primary"
            icon={submitting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            onClick={handleSubmit}
            disabled={selectedIdx === null || submitting}
            className="flex-shrink-0"
          >
            {submitting ? "Correcting..." : "Submit for Correction"}
          </Btn>
        </div>
      )}

      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><XCircle size={14} /></button>
        </div>
      )}
    </div>
  );
}