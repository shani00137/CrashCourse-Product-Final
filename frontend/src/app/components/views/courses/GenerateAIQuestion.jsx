import { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  AlertCircle,
  Loader2,
  CheckCircle,
  Database,
  Globe,
  Edit2,
  Trash2,
  Save,
  Check,
  X,
  Layers,
  Zap,
  Filter
} from "lucide-react";
import { Btn, Card, SearchableSelect } from "../../shared/ui";
import { generateAiQuestions, bulkSaveQuestions, getAllTopics } from "../../../../services/questionService";
import { getActiveCourses } from "../../../../services/applicantService";
import { htmlToText } from "../../../../utils/html";

const DIFFICULTY_LEVELS = [
  { key: "Easy", color: "emerald", ring: "ring-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", activeBg: "bg-emerald-500", activeText: "text-white", dot: "bg-emerald-400" },
  { key: "Medium", color: "amber", ring: "ring-amber-200", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", activeBg: "bg-amber-500", activeText: "text-white", dot: "bg-amber-400" },
  { key: "Hard", color: "red", ring: "ring-red-200", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", activeBg: "bg-red-500", activeText: "text-white", dot: "bg-red-400" }
];

const DIFF_MAP = Object.fromEntries(DIFFICULTY_LEVELS.map(d => [d.key, d]));

function DifficultyBadge({ level, size = "sm" }) {
  const d = DIFF_MAP[level];
  if (!d) return null;
  const cls = size === "xs"
    ? `inline-flex items-center gap-1 px-1.5 py-[1px] rounded text-[9px] font-bold uppercase tracking-wider ${d.bg} ${d.text} border ${d.border}`
    : `inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${d.bg} ${d.text} border ${d.border}`;
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
      {level}
    </span>
  );
}

export function GenerateAIQuestionScreen({ onBack }) {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [topicTitle, setTopicTitle] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [useDatabase, setUseDatabase] = useState(true);
  const [prompt, setPrompt] = useState("");

  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    getActiveCourses()
      .then(list => setCourses(Array.isArray(list) ? list : []))
      .catch(() => setCourses([]));
    getAllTopics()
      .then(list => setTopics(Array.isArray(list) ? list : []))
      .catch(() => setTopics([]));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const courseOptions = courses.map(c => ({
    id: c.courseId,
    label: `${c.courseCode} — ${c.courseName}`
  }));
  const topicOptions = topics.map(t => ({ id: t.topId, label: t.topTitle }));

  const stats = useMemo(() => {
    const s = { total: questions.length, Easy: 0, Medium: 0, Hard: 0 };
    questions.forEach(q => { if (s[q.difficulty] !== undefined) s[q.difficulty]++; });
    return s;
  }, [questions]);

  const handleGenerate = async () => {
    if (!courseId) {
      setToast({ type: "error", message: "Please select a course first." });
      return;
    }
    if (!count || count < 1) {
      setToast({ type: "error", message: "Enter a valid number of questions (1-50)." });
      return;
    }
    setGenerating(true);
    setError(null);
    setEditingIndex(null);
    setEditData(null);
    try {
      const res = await generateAiQuestions({
        courseId: Number(courseId),
        count: Math.min(Number(count), 50),
        difficulty,
        useDatabase,
        prompt: prompt.trim() || undefined,
        topId: selectedTopicId || undefined,
        topTitle: topicTitle || undefined
      });
      if (res?.succeeded && res.questions?.length > 0) {
        const tagged = res.questions.map(q => ({ ...q, difficulty }));
        setQuestions(prev => [...prev, ...tagged]);
        setToast({ type: "success", message: `Generated ${tagged.length} ${difficulty} questions. ${questions.length > 0 ? `Added to existing ${questions.length}.` : ""}` });
      } else {
        setError(res?.message || "AI returned no questions. Please try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate questions.");
    } finally {
      setGenerating(false);
    }
  };

  const startEdit = (idx) => {
    const q = questions[idx];
    setEditingIndex(idx);
    setEditData({
      questionContent: q.questionContent || "",
      options: q.options?.map(o => o.text || "") || ["", "", "", ""],
      correctIndex: q.correctIndex ?? 0,
      explanation: q.explanation || ""
    });
  };

  const saveEdit = () => {
    if (editingIndex === null || !editData) return;
    setQuestions(prev => prev.map((q, i) => {
      if (i !== editingIndex) return q;
      return {
        ...q,
        questionContent: editData.questionContent,
        options: editData.options.map(text => ({ text })),
        correctIndex: editData.correctIndex,
        explanation: editData.explanation
      };
    }));
    setEditingIndex(null);
    setEditData(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const handleDeleteQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      setEditData(null);
    } else if (editingIndex !== null && editingIndex > idx) {
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleClearAll = () => {
    if (questions.length === 0) return;
    if (!window.confirm(`Clear all ${questions.length} questions?`)) return;
    setQuestions([]);
    setEditingIndex(null);
    setEditData(null);
  };

  const handleSaveAll = async () => {
    if (!courseId) {
      setToast({ type: "error", message: "Please select a course." });
      return;
    }
    if (questions.length === 0) {
      setToast({ type: "error", message: "No questions to save." });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        courseId: Number(courseId),
        questions: questions.map(q => ({
          courseId: Number(courseId),
          questionContent: q.questionContent,
          questionOptionsList: q.options.map((opt, i) => ({
            options: typeof opt === "string" ? opt : opt.text || "",
            isRightAns: i === q.correctIndex
          }))
        }))
      };
      const res = await bulkSaveQuestions(payload);
      setToast({ type: "success", message: res || `${questions.length} questions saved to database!` });
      setQuestions([]);
      setEditingIndex(null);
      setEditData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save questions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Sparkles size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A202C]">Generate with AI</h1>
              <p className="text-[11px] text-[#718096]">Create multiple MCQ questions in one go</p>
            </div>
          </div>
        </div>
        {questions.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white rounded-xl border border-[rgba(0,0,0,0.07)] px-3 py-1.5 shadow-sm">
            <Layers size={13} className="text-violet-500" />
            <span className="text-xs font-bold text-[#1A202C]">{stats.total}</span>
            <span className="text-[10px] text-[#718096]">total</span>
            <span className="w-px h-3.5 bg-gray-200 mx-1" />
            {DIFFICULTY_LEVELS.map(d => (
              stats[d.key] > 0 && (
                <span key={d.key} className={`inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded text-[9px] font-bold ${d.bg} ${d.text}`}>
                  <span className={`w-1 h-1 rounded-full ${d.dot}`} />
                  {stats[d.key]} {d.key}
                </span>
              )
            ))}
          </div>
        )}
      </div>

      {/* Config Card */}
      <Card className="p-0 overflow-hidden shadow-sm">
        {/* Gradient top strip */}
        <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1A202C]">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <Zap size={13} className="text-violet-600" />
            </div>
            Generation Settings
          </div>

          {/* Row 1: Course + Count */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_160px] gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Course <span className="text-red-400">*</span>
              </label>
              <SearchableSelect
                options={courseOptions}
                value={courseId}
                onSelect={setCourseId}
                allLabel="Select a course..."
                placeholder="Search courses..."
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Questions
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] text-center font-semibold focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
              />
            </div>
          </div>

          {/* Row 1.5: Topic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                Topic <span className="font-normal text-[#A0AEC0] normal-case tracking-normal">(optional)</span>
              </label>
              <SearchableSelect
                options={topicOptions}
                value={selectedTopicId}
                onSelect={id => {
                  setSelectedTopicId(id);
                  if (id) {
                    const found = topics.find(t => t.topId === id);
                    if (found) setTopicTitle(found.topTitle);
                  } else {
                    setTopicTitle("");
                  }
                }}
                allLabel="No topic"
                placeholder="Search or type new topic..."
              />
            </div>
            {!selectedTopicId && (
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
                  New Topic Name
                </label>
                <input
                  type="text"
                  value={topicTitle}
                  onChange={e => setTopicTitle(e.target.value)}
                  placeholder="Type a new topic name..."
                  className="h-9 px-3 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-sm text-[#1A202C] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                />
              </div>
            )}
          </div>

          {/* Row 2: Difficulty + Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={11} /> Difficulty Level
              </label>
              <div className="flex gap-2">
                {DIFFICULTY_LEVELS.map(d => {
                  const active = difficulty === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setDifficulty(d.key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-150 ${
                        active
                          ? `${d.activeBg} ${d.activeText} border-transparent shadow-md`
                          : `bg-white ${d.text} ${d.border} hover:${d.bg}`
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${active ? "bg-white/60" : d.dot}`} />
                      {d.key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Source */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">Question Source</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setUseDatabase(true)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-150 ${
                    useDatabase
                      ? "bg-[#0E7C7B] text-white border-transparent shadow-md"
                      : "bg-white text-[#718096] border-[rgba(0,0,0,0.12)] hover:bg-gray-50"
                  }`}
                >
                  <Database size={14} />
                  Database
                </button>
                <button
                  onClick={() => setUseDatabase(false)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-150 ${
                    !useDatabase
                      ? "bg-violet-600 text-white border-transparent shadow-md"
                      : "bg-white text-[#718096] border-[rgba(0,0,0,0.12)] hover:bg-gray-50"
                  }`}
                >
                  <Globe size={14} />
                  Internet
                </button>
              </div>
              <p className="text-[10px] text-[#A0AEC0] leading-snug">
                {useDatabase
                  ? "Reads up to 100 existing questions as reference for new generation"
                  : "AI generates from its own knowledge without existing references"}
              </p>
            </div>
          </div>

          {/* Row 3: Prompt */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-widest">
              Additional Instructions <span className="font-normal text-[#A0AEC0] normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder='e.g. "Focus on pharmacology" or "Clinical scenario-based questions only"'
              className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition placeholder:text-[#CBD5E0]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* Generate */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-[#A0AEC0]">
              {questions.length > 0
                ? `${questions.length} question${questions.length === 1 ? "" : "s"} in queue — new batch will be added`
                : "Questions accumulate — generate multiple batches before saving"}
            </p>
            <Btn
              variant="primary"
              icon={generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              onClick={handleGenerate}
              disabled={generating || !courseId}
              className={`${generating ? "cursor-wait" : ""} bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-0 shadow-md shadow-violet-200`}
            >
              {generating ? "Generating..." : `Generate ${count || ""}`}
            </Btn>
          </div>
        </div>
      </Card>

      {/* Results */}
      {questions.length > 0 && (
        <Card className="p-0 overflow-hidden shadow-sm">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAFBFC] border-b border-[rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-sm">
                <CheckCircle size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A202C]">Generated Questions</p>
                <p className="text-[10px] text-[#A0AEC0]">Review, edit, then save to database</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition"
              >
                <Trash2 size={12} />
                Clear All
              </button>
              <Btn
                variant="primary"
                icon={saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                onClick={handleSaveAll}
                disabled={saving}
                className={`${saving ? "cursor-wait" : ""} text-xs`}
              >
                {saving ? "Saving..." : `Save All (${questions.length})`}
              </Btn>
            </div>
          </div>

          {/* Question list */}
          <div className="p-4 flex flex-col gap-3 max-h-[36rem] overflow-y-auto">
            {questions.map((q, idx) => {
              const isEditing = editingIndex === idx;
              const correctIdx = isEditing ? editData?.correctIndex ?? 0 : (q.correctIndex ?? 0);
              const opts = isEditing
                ? editData.options
                : (q.options?.map(o => typeof o === "string" ? o : o.text || "") || []);

              return (
                <div
                  key={idx}
                  className={`group border rounded-xl p-4 transition-all duration-150 ${
                    isEditing
                      ? "border-violet-300 bg-violet-50/40 shadow-sm ring-1 ring-violet-100"
                      : "border-[rgba(0,0,0,0.06)] bg-[#FAFBFC] hover:bg-white hover:border-[rgba(0,0,0,0.1)] hover:shadow-sm"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-violet-100 text-violet-700 text-[10px] font-extrabold">
                        {idx + 1}
                      </span>
                      <DifficultyBadge level={q.difficulty} size="xs" />
                    </div>
                    <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      {isEditing ? (
                        <>
                          <button onClick={saveEdit} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Save edit">
                            <Check size={13} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition" title="Cancel">
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(idx)} className="p-1.5 text-[#718096] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDeleteQuestion(idx)} className="p-1.5 text-[#718096] hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit mode */}
                  {isEditing && editData ? (
                    <div className="flex flex-col gap-2.5 ml-8">
                      <textarea
                        rows={3}
                        value={editData.questionContent}
                        onChange={e => setEditData({ ...editData, questionContent: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
                        placeholder="Question text..."
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {editData.options.map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-edit-${idx}`}
                              checked={editData.correctIndex === oi}
                              onChange={() => setEditData({ ...editData, correctIndex: oi })}
                              className="accent-[#0E7C7B]"
                            />
                            <span className="text-[10px] font-bold text-[#718096] w-3">{String.fromCharCode(65 + oi)}</span>
                            <input
                              value={opt}
                              onChange={e => {
                                const newOpts = [...editData.options];
                                newOpts[oi] = e.target.value;
                                setEditData({ ...editData, options: newOpts });
                              }}
                              className="flex-1 h-8 px-2.5 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white text-xs text-[#1A202C] focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition"
                              placeholder={`Option ${String.fromCharCode(65 + oi)}...`}
                            />
                          </div>
                        ))}
                      </div>
                      <textarea
                        rows={2}
                        value={editData.explanation}
                        onChange={e => setEditData({ ...editData, explanation: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-[rgba(0,0,0,0.12)] text-sm resize-none focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
                        placeholder="Explanation..."
                      />
                    </div>
                  ) : (
                    <div className="ml-8">
                      <p className="text-[13px] font-medium text-[#1A202C] mb-2.5 leading-relaxed">
                        {htmlToText(q.questionContent)}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2.5">
                        {q.options?.map((opt, oi) => {
                          const text = typeof opt === "string" ? opt : opt.text || "";
                          const isCorrect = oi === (q.correctIndex ?? 0);
                          return (
                            <div
                              key={oi}
                              className={`flex items-start gap-2 px-2.5 py-2 rounded-lg text-xs border transition ${
                                isCorrect
                                  ? "border-emerald-200 bg-emerald-50 shadow-sm"
                                  : "border-[rgba(0,0,0,0.04)] bg-white"
                              }`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-extrabold flex-shrink-0 mt-px ${
                                  isCorrect ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"
                                }`}
                              >
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <span className={`leading-relaxed ${isCorrect ? "text-emerald-800 font-medium" : "text-[#718096]"}`}>
                                {htmlToText(text)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {q.explanation && (
                        <div className="text-[11px] text-[#718096] bg-blue-50/60 border border-blue-100 rounded-lg px-3 py-2 leading-relaxed">
                          <span className="font-bold text-blue-600">Explanation: </span>
                          {htmlToText(q.explanation)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium text-white ${
            toast.type === "success" ? "bg-[#0E7C7B]" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}
    </div>
  );
}
