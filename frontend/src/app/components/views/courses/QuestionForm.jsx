import { useEffect, useState } from "react";
import { AlertCircle, Loader2, CheckCircle, Plus, Trash2, CircleDot } from "lucide-react";
import { Btn, Card, SearchableSelect } from "../../shared/ui";
import { RichTextEditor } from "../../shared/RichTextEditor";
import { saveQuestion, editQuestion } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";
import { htmlToText } from "../../../../utils/html";

const BLANK_OPTIONS = ["", "", "", ""];
const MAX_OPTIONS = 8;

export function QuestionFormScreen({ question, onBack }) {
  const editing = Boolean(question?.questionId);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(editing ? String(question.courseId) : "");
  const [content, setContent] = useState(() => {
    if (!editing) return "";
    return question.questionContent ?? "";
  });
  const [options, setOptions] = useState(() => {
    if (!editing) return [...BLANK_OPTIONS];
    const opts = Array.isArray(question.questionOptions) ? question.questionOptions : [];
    const mapped = opts.map(o => o.options ?? "");
    while (mapped.length < 4) mapped.push("");
    return mapped;
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

  const addOptions = () => {
    const next = Math.min(options.length + 2, MAX_OPTIONS);
    if (next > options.length) {
      const added = Array.from({ length: next - options.length }, () => "");
      setOptions(prev => [...prev, ...added]);
    }
  };

  const removeOption = (idx) => {
    if (options.length <= 4) return;
    setOptions(prev => prev.filter((_, i) => i !== idx));
    if (correct >= options.length - 1) {
      setCorrect(prev => Math.max(0, prev - 1));
    } else if (idx < correct) {
      setCorrect(prev => prev - 1);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const courseIdNum = Number(courseId);
    const questionHtml = content;
    const questionText = htmlToText(content);
    if (!courseIdNum) {
      setError("Please select a course.");
      return;
    }
    if (!questionText.trim()) {
      setError("Please enter the question text.");
      return;
    }
    if (options.every(o => !htmlToText(o).trim())) {
      setError("Please fill in at least one option.");
      return;
    }
    const nonEmptyOptions = options.filter(o => htmlToText(o).trim());
    const finalCorrect = Math.min(correct, nonEmptyOptions.length - 1);
    const payload = {
      courseId: courseIdNum,
      questionContent: questionHtml,
      questionOptionsList: nonEmptyOptions.map((opt, i) => ({ options: htmlToText(opt), isRightAns: i === finalCorrect }))
    };
    setSaving(true);
    setError(null);
    try {
      const msg = editing
        ? await editQuestion({ questionId: question.questionId, ...payload })
        : await saveQuestion(payload);
      setToast({ type: "success", message: msg || (editing ? "Question updated" : "Question saved") });
      setTimeout(onBack, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#1A202C]">{editing ? "Edit Question" : "Add Question"}</h1>
          <p className="text-xs text-[#718096] mt-0.5">{editing ? "Update the MCQ and save your changes" : "Create a new MCQ with rich text support"}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5 max-w-4xl">
        {/* Course */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">Course <span className="text-red-400">*</span></label>
            <SearchableSelect
              options={courseOptions}
              value={courseId ? Number(courseId) : null}
              onSelect={id => setCourseId(id ? String(id) : "")}
              allLabel="Select a course..."
              placeholder="Search courses..."
            />
          </div>
        </Card>

        {/* Question */}
        <Card className="p-5 flex flex-col gap-1">
          <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest mb-1">Question <span className="text-red-400">*</span></label>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Type your question here... (supports rich text, images, lists)"
            className="min-h-[100px]"
          />
          <p className="text-[10px] text-[#A0AEC0] mt-1">Use the toolbar for bold, italic, underline, lists, or paste/drag images directly.</p>
        </Card>

        {/* Options */}
        <Card className="p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
              Answer Options <span className="text-[#A0AEC0] normal-case tracking-normal font-medium">({options.length} of {MAX_OPTIONS})</span>
            </label>
            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOptions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0E7C7B] bg-[#E6F4F4] border border-[#0E7C7B]/20 hover:bg-[#d4eded] transition"
              >
                <Plus size={13} />
                Add {options.length + 2 > MAX_OPTIONS ? MAX_OPTIONS - options.length : 2} More
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {options.map((opt, i) => {
              const isCorrect = correct === i;
              const canRemove = options.length > 4 && i >= 4;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${
                    isCorrect
                      ? "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200"
                      : "border-[rgba(0,0,0,0.08)] bg-[#FAFBFC] hover:bg-white"
                  }`}
                >
                  {/* Correct radio */}
                  <button
                    type="button"
                    onClick={() => setCorrect(i)}
                    title={isCorrect ? "Correct answer" : "Mark as correct"}
                    className={`mt-2 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 ${
                      isCorrect
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                        : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"
                    }`}
                  >
                    <span className="text-[10px] font-extrabold">{String.fromCharCode(65 + i)}</span>
                  </button>

                  {/* Option editor */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCorrect ? "text-emerald-600" : "text-[#A0AEC0]"}`}>
                        Option {String.fromCharCode(65 + i)} {isCorrect && "— Correct"}
                      </span>
                      {canRemove && (
                        <button
                          type="button"
                          onClick={() => removeOption(i)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition"
                          title="Remove this option"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                    <RichTextEditor
                      value={opt}
                      onChange={html => setOptions(prev => prev.map((v, j) => (j === i ? html : v)))}
                      placeholder={`Option ${String.fromCharCode(65 + i)} text...`}
                      className="min-h-[48px]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {options.length < MAX_OPTIONS && (
            <button
              type="button"
              onClick={addOptions}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-[rgba(0,0,0,0.12)] text-sm font-medium text-[#718096] hover:border-[#0E7C7B] hover:text-[#0E7C7B] hover:bg-[#E6F4F4]/40 transition-all duration-150"
            >
              <Plus size={14} />
              Add More Options ({options.length}/{MAX_OPTIONS})
            </button>
          )}
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Btn variant="ghost" onClick={onBack}>Cancel</Btn>
          <Btn type="submit" variant="primary" disabled={saving} className={saving ? "cursor-wait" : ""}>
            {saving && <Loader2 size={14} className="animate-spin" />}
            {editing ? "Save Changes" : "Save Question"}
          </Btn>
        </div>
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
