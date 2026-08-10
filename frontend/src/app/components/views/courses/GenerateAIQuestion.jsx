import { useEffect, useState } from "react";
import { ArrowLeft, Sparkles, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Btn, Card, SearchableSelect } from "../../shared/ui";
import { saveQuestion } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";
import { htmlToText } from "../../../../utils/html";

const BLANK_OPTIONS = ["", "", "", ""];

export function GenerateAIQuestionScreen({ onBack }) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [content, setContent] = useState("");
  const [options, setOptions] = useState(BLANK_OPTIONS);
  const [correct, setCorrect] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
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

  const handleGenerate = () => {
    if (!prompt.trim()) {
      setToast({ type: "error", message: "Describe the scenario first, then press Generate." });
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setToast({ type: "error", message: "AI generation is not connected yet — fill the fields manually and save." });
    }, 900);
  };

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
    setSaving(true);
    setError(null);
    try {
      const msg = await saveQuestion({
        courseId: courseIdNum,
        questionContent: text,
        questionOptionsList: options.map((opt, i) => ({ options: htmlToText(opt), isRightAns: i === correct }))
      });
      setToast({ type: "success", message: msg || "Question saved successfully" });
      setCourseId("");
      setContent("");
      setOptions(BLANK_OPTIONS);
      setCorrect(0);
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Question Bank"
            className="p-2 border border-[rgba(0,0,0,0.12)] rounded-lg text-[#718096] hover:text-[#0E7C7B] hover:border-[#0E7C7B] transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-[#1A202C]">Generate with AI</h1>
            <p className="text-xs text-[#718096] mt-0.5">Create an MCQ for a selected course</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-5 items-start">
        <Card className="p-5 flex flex-col gap-3 min-w-0">
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
              rows={6}
              value={content}
              onChange={e => setContent(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-[#0E7C7B] focus:ring-1 focus:ring-[#0E7C7B]"
              placeholder="Question text…"
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
            <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Question
            </Btn>
          </div>
        </Card>

        <Card className="p-5 flex flex-col gap-3 xl:sticky xl:top-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
            <Sparkles size={15} /> Generate with AI
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-semibold text-violet-700 uppercase tracking-wide">Command Prompt</label>
            <textarea
              rows={8}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={'Describe the clinical scenario you want a question for… (e.g. "A 45-year-old diabetic patient presents with…")'}
              className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <Btn variant="primary" icon={generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} onClick={handleGenerate} disabled={generating} className={generating ? "cursor-wait" : ""}>
            {generating ? "Generating…" : "Generate"}
          </Btn>
          <p className="text-xs text-violet-600/80">AI will draft the question, 4 options and mark the correct answer — review before saving.</p>
        </Card>
      </form>

      {toast && (
        <div className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#0E7C7B]" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
