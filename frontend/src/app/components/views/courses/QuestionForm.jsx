import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Btn, Card, SearchableSelect } from "../../shared/ui";
import { saveQuestion, editQuestion } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";
import { htmlToText } from "../../../../utils/html";

const BLANK_OPTIONS = ["", "", "", ""];

export function QuestionFormScreen({ question, onBack }) {
  const editing = Boolean(question?.questionId);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(editing ? String(question.courseId) : "");
  const [content, setContent] = useState(editing ? htmlToText(question.questionContent ?? "") : "");
  const [options, setOptions] = useState(() => {
    if (!editing) return BLANK_OPTIONS;
    const opts = Array.isArray(question.questionOptions) ? question.questionOptions : [];
    return BLANK_OPTIONS.map((_, i) => htmlToText(opts[i]?.options ?? ""));
  });
  const [correct, setCorrect] = useState(() => {
    if (!editing) return 0;
    const opts = Array.isArray(question.questionOptions) ? question.questionOptions : [];
    const idx = opts.findIndex(o => o.isRightAns);
    return idx >= 0 ? idx : 0;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getActiveCourses().then(list => setCourses(Array.isArray(list) ? list : [])).catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const courseOptions = courses.map(c => ({ id: c.courseId, label: `${c.courseCode} — ${c.courseName}` }));

  const handleSave = async (e) => {
    e.preventDefault();
    const courseIdNum = Number(courseId);
    const text = htmlToText(content);
    if (!courseIdNum) {
      setError("Please select a course.");
      return;
    }
    if (!text) {
      setError("Please enter the question text.");
      return;
    }
    if (options.every(o => !o.trim())) {
      setError("Please fill in at least one option.");
      return;
    }
    const payload = {
      courseId: courseIdNum,
      questionContent: text,
      questionOptionsList: options.map((opt, i) => ({ options: htmlToText(opt), isRightAns: i === correct }))
    };
    setSaving(true);
    setError(null);
    try {
      const msg = editing
        ? await editQuestion({ questionId: question.questionId, ...payload })
        : await saveQuestion(payload);
      setToast({ type: "success", message: msg || (editing ? "Question updated successfully" : "Question saved successfully") });
      setTimeout(onBack, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          title="Back to Question Bank"
          className="p-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-[#718096] hover:text-[#0E7C7B] hover:border-[#0E7C7B] transition"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[#1A202C]">{editing ? "Edit Question" : "Add Question"}</h1>
          <p className="text-xs text-[#718096] mt-0.5">{editing ? "Update the MCQ and save your changes" : "Create a new MCQ for a course"}</p>
        </div>
      </div>

      <Card className="p-5 flex flex-col gap-3 max-w-3xl">
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Course</label>
            <SearchableSelect
              options={courseOptions}
              value={courseId ? Number(courseId) : null}
              onSelect={id => setCourseId(id ? String(id) : "")}
              allLabel="Select a course…"
              placeholder="Search courses…"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Question</label>
            <textarea
              rows={5}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]"
              placeholder="Enter question text…"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt, i) => (
              <div key={i} className="flex flex-col gap-1">
                <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Option {String.fromCharCode(65 + i)}</label>
                <input
                  value={opt}
                  onChange={e => setOptions(prev => prev.map((v, j) => (j === i ? e.target.value : v)))}
                  className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition"
                  placeholder={`Enter option ${String.fromCharCode(65 + i)}`}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-[#1A202C] uppercase tracking-wide">Correct Answer</label>
            <select
              value={correct}
              onChange={e => setCorrect(Number(e.target.value))}
              className="h-10 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B] transition appearance-none"
            >
              {options.map((_, i) => <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>)}
            </select>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          <div className="flex gap-2 justify-end mt-2">
            <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
            <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              {editing ? "Save Changes" : "Save Question"}
            </Btn>
          </div>
        </form>
      </Card>

      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#0E7C7B]" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
